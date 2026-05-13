import { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, Image, Modal, FlatList } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as Location from 'expo-location';
import * as ImageManipulator from 'expo-image-manipulator';
import { useAuth } from '../../lib/auth';
import { catchApi, tournamentApi } from '../../lib/api';
import { useRouter } from 'expo-router';

interface Tournament {
  id: string;
  name: string;
  status: string;
  lakeName: string | null;
  date: string | null;
}

export default function CatchScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [permission, requestPermission] = useCameraPermissions();
  const [photo, setPhoto] = useState<string | null>(null);
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [showTournamentPicker, setShowTournamentPicker] = useState(false);
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loadingTournaments, setLoadingTournaments] = useState(false);
  const cameraRef = useRef<CameraView>(null);

  if (!user) {
    return (
      <View style={styles.center}>
        <Text style={styles.title}>Sign in to submit catches</Text>
        <TouchableOpacity style={styles.button} onPress={() => router.push('/login')}>
          <Text style={styles.buttonText}>SIGN IN</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!permission?.granted) {
    return (
      <View style={styles.center}>
        <Text style={styles.title}>Camera access required</Text>
        <Text style={styles.subtitle}>KULL 1 needs your camera to photograph catches for GPS-verified tournament submissions.</Text>
        <TouchableOpacity style={styles.button} onPress={requestPermission}>
          <Text style={styles.buttonText}>GRANT CAMERA ACCESS</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const takePhoto = async () => {
    if (!cameraRef.current) return;

    // Get location simultaneously
    const locPromise = Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.BestForNavigation,
    });

    // Get GPS first — expo-camera does NOT auto-embed GPS in photos
    let loc: Location.LocationObject | null = null;
    try {
      loc = await locPromise;
      setLocation(loc);
    } catch {
      Alert.alert('Location Error', 'Could not get GPS coordinates. Make sure location services are enabled.');
      return;
    }

    // Take photo with GPS EXIF manually injected
    const exifData: Record<string, any> = {};
    if (loc) {
      exifData.GPSLatitude = loc.coords.latitude;
      exifData.GPSLongitude = loc.coords.longitude;
      if (loc.coords.altitude) exifData.GPSAltitude = loc.coords.altitude;
    }

    const result = await cameraRef.current.takePictureAsync({
      quality: 0.8,
      exif: true,
      additionalExif: exifData,
    });
    if (!result) return;

    // Compress on-device before upload (platform-specific quality tuning)
    const compressed = await ImageManipulator.manipulateAsync(
      result.uri,
      [{ resize: { width: 1200 } }],
      { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
    );

    setPhoto(compressed.uri);
  };

  const submitCatch = async (tournamentId: string) => {
    if (!photo || !location) {
      Alert.alert('Missing Data', 'Photo and GPS location are required.');
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('tournament_id', tournamentId);
      formData.append('lat', location.coords.latitude.toString());
      formData.append('lng', location.coords.longitude.toString());
      formData.append('photo', {
        uri: photo,
        type: 'image/jpeg',
        name: `catch_${Date.now()}.jpg`,
      } as any);

      const result = await catchApi.submit(formData);

      if (result.status === 'verified') {
        Alert.alert('Catch Verified!', 'Your catch has been GPS-verified and added to the leaderboard.');
      } else if (result.status === 'boundary_violation') {
        Alert.alert('Boundary Violation', 'Your location is outside the tournament boundary.');
      } else if (result.status === 'time_violation') {
        Alert.alert('Time Violation', 'The tournament window has closed.');
      }

      setPhoto(null);
      setLocation(null);
    } catch (err: any) {
      Alert.alert('Submission Failed', err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (photo) {
    return (
      <View style={styles.container}>
        <Image source={{ uri: photo }} style={styles.preview} />
        {location && (
          <View style={styles.gpsBar}>
            <Text style={styles.gpsText}>
              GPS: {location.coords.latitude.toFixed(6)}, {location.coords.longitude.toFixed(6)}
            </Text>
            <Text style={styles.gpsAccuracy}>
              Accuracy: {location.coords.accuracy?.toFixed(1)}m
            </Text>
          </View>
        )}
        <View style={styles.actionBar}>
          <TouchableOpacity style={styles.retakeButton} onPress={() => { setPhoto(null); setLocation(null); }}>
            <Text style={styles.retakeText}>RETAKE</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.submitButton, submitting && styles.disabled]}
            onPress={async () => {
              setLoadingTournaments(true);
              try {
                const data = await tournamentApi.list({ status: 'live' });
                const live = (data.tournaments || []) as Tournament[];
                if (live.length === 0) {
                  Alert.alert('No Active Tournaments', 'There are no tournaments currently in progress.');
                } else if (live.length === 1) {
                  submitCatch(live[0].id);
                } else {
                  setTournaments(live);
                  setShowTournamentPicker(true);
                }
              } catch {
                Alert.alert('Error', 'Could not load tournaments. Check your connection.');
              } finally {
                setLoadingTournaments(false);
              }
            }}
            disabled={submitting || loadingTournaments}
          >
            <Text style={styles.submitText}>
              {submitting ? 'SUBMITTING...' : loadingTournaments ? 'LOADING...' : 'SUBMIT CATCH'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView ref={cameraRef} style={styles.camera} facing="back">
        <View style={styles.overlay}>
          <Text style={styles.overlayText}>Position fish on bump board</Text>
        </View>
      </CameraView>
      <TouchableOpacity style={styles.captureButton} onPress={takePhoto}>
        <View style={styles.captureInner} />
      </TouchableOpacity>

      {/* Tournament Picker Modal */}
      <Modal visible={showTournamentPicker} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>SELECT TOURNAMENT</Text>
            <FlatList
              data={tournaments}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.tournamentItem}
                  onPress={() => {
                    setShowTournamentPicker(false);
                    submitCatch(item.id);
                  }}
                >
                  <Text style={styles.tournamentName}>{item.name}</Text>
                  {item.lakeName && (
                    <Text style={styles.tournamentLake}>{item.lakeName}</Text>
                  )}
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity
              style={styles.modalCancel}
              onPress={() => setShowTournamentPicker(false)}
            >
              <Text style={styles.modalCancelText}>CANCEL</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#111', padding: 24 },
  title: { fontSize: 20, fontWeight: '800', color: '#fff', marginBottom: 8, textAlign: 'center' },
  subtitle: { fontSize: 14, color: 'rgba(255,255,255,0.55)', textAlign: 'center', marginBottom: 24, lineHeight: 20 },
  button: { backgroundColor: '#fff', paddingHorizontal: 32, paddingVertical: 14, borderRadius: 8 },
  buttonText: { fontSize: 13, fontWeight: '800', color: '#111', letterSpacing: 1 },
  camera: { flex: 1 },
  overlay: { position: 'absolute', bottom: 100, left: 0, right: 0, alignItems: 'center' },
  overlayText: { color: 'rgba(255,255,255,0.6)', fontSize: 14, fontWeight: '600' },
  captureButton: {
    position: 'absolute', bottom: 40, alignSelf: 'center',
    width: 72, height: 72, borderRadius: 36,
    borderWidth: 4, borderColor: '#fff',
    justifyContent: 'center', alignItems: 'center',
  },
  captureInner: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#fff' },
  preview: { flex: 1, resizeMode: 'contain' },
  gpsBar: {
    backgroundColor: 'rgba(0,0,0,0.8)', padding: 12,
    flexDirection: 'row', justifyContent: 'space-between',
  },
  gpsText: { color: '#4ADE80', fontSize: 12, fontWeight: '600' },
  gpsAccuracy: { color: 'rgba(255,255,255,0.5)', fontSize: 12 },
  actionBar: { flexDirection: 'row', padding: 16, gap: 12, backgroundColor: '#111' },
  retakeButton: { flex: 1, padding: 14, borderRadius: 8, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)', alignItems: 'center' },
  retakeText: { color: '#fff', fontWeight: '700', fontSize: 13, letterSpacing: 0.5 },
  submitButton: { flex: 2, padding: 14, borderRadius: 8, backgroundColor: '#4ADE80', alignItems: 'center' },
  submitText: { color: '#111', fontWeight: '800', fontSize: 13, letterSpacing: 0.5 },
  disabled: { opacity: 0.5 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#1A1E24', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 24, maxHeight: '60%' },
  modalTitle: { fontSize: 13, fontWeight: '800', color: 'rgba(255,255,255,0.5)', letterSpacing: 1.5, marginBottom: 16, textAlign: 'center' },
  tournamentItem: { padding: 16, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.06)' },
  tournamentName: { fontSize: 16, fontWeight: '700', color: '#fff', marginBottom: 4 },
  tournamentLake: { fontSize: 13, color: 'rgba(255,255,255,0.4)' },
  modalCancel: { marginTop: 12, padding: 14, borderRadius: 8, borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)', alignItems: 'center' },
  modalCancelText: { color: 'rgba(255,255,255,0.5)', fontWeight: '700', fontSize: 13, letterSpacing: 0.5 },
});
