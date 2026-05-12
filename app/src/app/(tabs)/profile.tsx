import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../lib/auth';

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const router = useRouter();

  if (!user) {
    return (
      <View style={styles.center}>
        <Text style={styles.title}>KULL 1</Text>
        <Text style={styles.subtitle}>GPS-Verified Tournament Fishing</Text>
        <TouchableOpacity style={styles.primaryButton} onPress={() => router.push('/register')}>
          <Text style={styles.primaryText}>CREATE ACCOUNT</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.secondaryButton} onPress={() => router.push('/login')}>
          <Text style={styles.secondaryText}>SIGN IN</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{user.email[0].toUpperCase()}</Text>
        </View>
        <Text style={styles.email}>{user.email}</Text>
        <Text style={styles.role}>{user.role.toUpperCase()}</Text>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.stat}>
          <Text style={styles.statValue}>0</Text>
          <Text style={styles.statLabel}>TOURNAMENTS</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statValue}>0</Text>
          <Text style={styles.statLabel}>CATCHES</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statValue}>0</Text>
          <Text style={styles.statLabel}>WINS</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={logout}>
        <Text style={styles.logoutText}>SIGN OUT</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#111', padding: 24 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#111', padding: 24 },
  title: { fontSize: 32, fontWeight: '900', color: '#fff', letterSpacing: 4, marginBottom: 8 },
  subtitle: { fontSize: 13, color: 'rgba(255,255,255,0.4)', letterSpacing: 1, marginBottom: 40 },
  primaryButton: { backgroundColor: '#fff', paddingHorizontal: 40, paddingVertical: 16, borderRadius: 8, marginBottom: 12, width: '100%', alignItems: 'center' },
  primaryText: { fontSize: 13, fontWeight: '800', color: '#111', letterSpacing: 1 },
  secondaryButton: { paddingHorizontal: 40, paddingVertical: 16, borderRadius: 8, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)', width: '100%', alignItems: 'center' },
  secondaryText: { fontSize: 13, fontWeight: '700', color: 'rgba(255,255,255,0.6)', letterSpacing: 1 },
  header: { alignItems: 'center', marginTop: 40, marginBottom: 32 },
  avatar: { width: 72, height: 72, borderRadius: 36, backgroundColor: 'rgba(255,255,255,0.08)', justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  avatarText: { fontSize: 28, fontWeight: '800', color: '#4ADE80' },
  email: { fontSize: 16, fontWeight: '600', color: '#fff' },
  role: { fontSize: 11, fontWeight: '700', color: '#4ADE80', letterSpacing: 1.5, marginTop: 4 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 40, paddingVertical: 24, borderTopWidth: 1, borderBottomWidth: 1, borderColor: 'rgba(255,255,255,0.06)' },
  stat: { alignItems: 'center' },
  statValue: { fontSize: 24, fontWeight: '900', color: '#fff' },
  statLabel: { fontSize: 10, fontWeight: '700', color: 'rgba(255,255,255,0.35)', letterSpacing: 1, marginTop: 4 },
  logoutButton: { padding: 16, borderRadius: 8, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', alignItems: 'center' },
  logoutText: { fontSize: 12, fontWeight: '700', color: 'rgba(255,255,255,0.4)', letterSpacing: 1 },
});
