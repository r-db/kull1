import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../lib/auth';
import { getPendingCount, syncQueue } from '../../lib/offline-queue';

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [pendingCatches, setPendingCatches] = useState(0);
  const [syncing, setSyncing] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (user) loadPendingCount();
  }, [user]);

  const loadPendingCount = async () => {
    try {
      const count = await getPendingCount();
      setPendingCatches(count);
    } catch {}
  };

  const handleSync = async () => {
    setSyncing(true);
    try {
      const result = await syncQueue();
      await loadPendingCount();
      if (result.synced > 0) {
        // Could show alert but keeping it clean
      }
    } catch {}
    setSyncing(false);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadPendingCount();
    setRefreshing(false);
  };

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
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#4ADE80" />}
    >
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{user.email[0].toUpperCase()}</Text>
        </View>
        <Text style={styles.email}>{user.email}</Text>
        <Text style={styles.role}>{user.role.toUpperCase()}</Text>
      </View>

      {pendingCatches > 0 && (
        <View style={styles.pendingBar}>
          <Text style={styles.pendingText}>
            {pendingCatches} catch{pendingCatches > 1 ? 'es' : ''} waiting to sync
          </Text>
          <TouchableOpacity
            style={[styles.syncButton, syncing && styles.disabled]}
            onPress={handleSync}
            disabled={syncing}
          >
            <Text style={styles.syncText}>{syncing ? 'SYNCING...' : 'SYNC NOW'}</Text>
          </TouchableOpacity>
        </View>
      )}

      <TouchableOpacity style={styles.logoutButton} onPress={logout}>
        <Text style={styles.logoutText}>SIGN OUT</Text>
      </TouchableOpacity>
    </ScrollView>
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
  pendingBar: { backgroundColor: 'rgba(245,158,11,0.1)', borderWidth: 1, borderColor: 'rgba(245,158,11,0.3)', borderRadius: 12, padding: 16, marginBottom: 24, alignItems: 'center', gap: 10 },
  pendingText: { color: '#F59E0B', fontSize: 13, fontWeight: '700' },
  syncButton: { backgroundColor: '#F59E0B', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 6 },
  syncText: { color: '#111', fontSize: 11, fontWeight: '800', letterSpacing: 0.5 },
  disabled: { opacity: 0.5 },
  logoutButton: { padding: 16, borderRadius: 8, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', alignItems: 'center', marginTop: 16 },
  logoutText: { fontSize: 12, fontWeight: '700', color: 'rgba(255,255,255,0.4)', letterSpacing: 1 },
});
