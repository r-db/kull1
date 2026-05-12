import { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert, Dimensions } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import MapView, { Polygon, PROVIDER_GOOGLE } from 'react-native-maps';
import { tournamentApi } from '../../lib/api';
import { useAuth } from '../../lib/auth';

const FORMAT_LABELS: Record<string, string> = {
  big_bass: 'BIG BASS',
  five_fish: '5-FISH LIMIT',
  slot_limit: 'SLOT LIMIT',
  multi_day: 'MULTI-DAY',
};

export default function TournamentDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const router = useRouter();
  const [tournament, setTournament] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);

  useEffect(() => {
    if (!id) return;
    tournamentApi.get(id).then(setTournament).catch(console.error).finally(() => setLoading(false));
  }, [id]);

  const handleRegister = async () => {
    if (!user) {
      router.push('/login');
      return;
    }
    if (!id) return;
    setRegistering(true);
    try {
      await tournamentApi.register(id);
      Alert.alert('Registered!', 'You are now registered for this tournament.');
      // Refresh
      const updated = await tournamentApi.get(id);
      setTournament(updated);
    } catch (err: any) {
      Alert.alert('Registration Failed', err.message);
    } finally {
      setRegistering(false);
    }
  };

  if (loading || !tournament) {
    return (
      <View style={styles.center}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  const boundary = tournament.boundaryGeojson;
  const coords = boundary?.coordinates?.[0]?.map(([lng, lat]: number[]) => ({
    latitude: lat,
    longitude: lng,
  })) || [];

  const startDate = new Date(tournament.startAt);
  const endDate = new Date(tournament.endAt);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.format}>{FORMAT_LABELS[tournament.format] || tournament.format}</Text>
        <Text style={styles.name}>{tournament.name}</Text>
        <Text style={styles.club}>{tournament.clubName}</Text>
      </View>

      {coords.length > 0 && (
        <MapView
          style={styles.map}
          initialRegion={{
            latitude: coords.reduce((sum: number, c: any) => sum + c.latitude, 0) / coords.length,
            longitude: coords.reduce((sum: number, c: any) => sum + c.longitude, 0) / coords.length,
            latitudeDelta: 0.15,
            longitudeDelta: 0.15,
          }}
          mapType="satellite"
        >
          <Polygon
            coordinates={coords}
            strokeColor="#4ADE80"
            fillColor="rgba(74,222,128,0.15)"
            strokeWidth={2}
          />
        </MapView>
      )}

      <View style={styles.details}>
        <View style={styles.detailRow}>
          <Text style={styles.label}>DATE</Text>
          <Text style={styles.value}>{startDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.label}>TIME</Text>
          <Text style={styles.value}>
            {startDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })} — {endDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
          </Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.label}>ENTRY FEE</Text>
          <Text style={styles.value}>${(tournament.entryFeeCents / 100).toFixed(2)}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.label}>REGISTERED</Text>
          <Text style={styles.value}>{tournament.registeredCount}{tournament.maxAnglers ? ` / ${tournament.maxAnglers}` : ''}</Text>
        </View>
        {tournament.description && (
          <View style={styles.descriptionBox}>
            <Text style={styles.description}>{tournament.description}</Text>
          </View>
        )}
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.registerButton, registering && styles.disabled]}
          onPress={handleRegister}
          disabled={registering}
        >
          <Text style={styles.registerText}>{registering ? 'REGISTERING...' : 'REGISTER — $' + (tournament.entryFeeCents / 100).toFixed(0)}</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#111' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#111' },
  loadingText: { color: 'rgba(255,255,255,0.4)' },
  header: { padding: 24, paddingBottom: 16 },
  format: { fontSize: 11, fontWeight: '700', color: '#4ADE80', letterSpacing: 1.5, marginBottom: 8 },
  name: { fontSize: 24, fontWeight: '900', color: '#fff', marginBottom: 4 },
  club: { fontSize: 14, color: 'rgba(255,255,255,0.55)' },
  map: { height: 220, marginHorizontal: 16, borderRadius: 10, overflow: 'hidden' },
  details: { padding: 24, gap: 16 },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  label: { fontSize: 11, fontWeight: '700', color: 'rgba(255,255,255,0.35)', letterSpacing: 1 },
  value: { fontSize: 14, fontWeight: '600', color: '#fff' },
  descriptionBox: { marginTop: 8, padding: 16, backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 8, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' },
  description: { fontSize: 14, color: 'rgba(255,255,255,0.6)', lineHeight: 22 },
  footer: { padding: 24, paddingBottom: 48 },
  registerButton: { backgroundColor: '#4ADE80', padding: 18, borderRadius: 10, alignItems: 'center' },
  registerText: { fontSize: 14, fontWeight: '900', color: '#111', letterSpacing: 1 },
  disabled: { opacity: 0.5 },
});
