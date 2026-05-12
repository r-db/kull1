import { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { tournamentApi } from '../../lib/api';

interface Tournament {
  id: string;
  name: string;
  format: string;
  entryFeeCents: number;
  startAt: string;
  endAt: string;
  status: string;
  maxAnglers: number | null;
  clubName: string;
  clubRegion: string;
}

const FORMAT_LABELS: Record<string, string> = {
  big_bass: 'BIG BASS',
  five_fish: '5-FISH LIMIT',
  slot_limit: 'SLOT LIMIT',
  multi_day: 'MULTI-DAY',
};

export default function TournamentsScreen() {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchTournaments = useCallback(async () => {
    try {
      const data = await tournamentApi.list();
      setTournaments(data);
    } catch (err) {
      console.error('Failed to load tournaments:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchTournaments(); }, [fetchTournaments]);

  const onRefresh = () => { setRefreshing(true); fetchTournaments(); };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const renderItem = ({ item }: { item: Tournament }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => router.push(`/tournament/${item.id}`)}
      activeOpacity={0.7}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.format}>{FORMAT_LABELS[item.format] || item.format}</Text>
        <Text style={styles.fee}>${(item.entryFeeCents / 100).toFixed(0)}</Text>
      </View>
      <Text style={styles.name}>{item.name}</Text>
      <Text style={styles.club}>{item.clubName} — {item.clubRegion}</Text>
      <View style={styles.cardFooter}>
        <Text style={styles.date}>{formatDate(item.startAt)}</Text>
        {item.maxAnglers && (
          <Text style={styles.spots}>{item.maxAnglers} spots</Text>
        )}
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <Text style={styles.loadingText}>Loading tournaments...</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={tournaments}
      renderItem={renderItem}
      keyExtractor={(item) => item.id}
      style={styles.list}
      contentContainerStyle={styles.listContent}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#4ADE80" />}
      ListEmptyComponent={
        <View style={styles.center}>
          <Text style={styles.emptyText}>No tournaments available</Text>
        </View>
      }
    />
  );
}

const styles = StyleSheet.create({
  list: { flex: 1, backgroundColor: '#111' },
  listContent: { padding: 16, gap: 12 },
  card: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 10,
    padding: 16,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  format: { fontSize: 10, fontWeight: '700', color: '#4ADE80', letterSpacing: 1.5 },
  fee: { fontSize: 14, fontWeight: '800', color: '#fff' },
  name: { fontSize: 18, fontWeight: '800', color: '#fff', marginBottom: 4 },
  club: { fontSize: 13, color: 'rgba(255,255,255,0.55)', marginBottom: 8 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between' },
  date: { fontSize: 12, color: 'rgba(255,255,255,0.35)' },
  spots: { fontSize: 12, color: 'rgba(255,255,255,0.35)' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#111' },
  loadingText: { color: 'rgba(255,255,255,0.55)', fontSize: 14 },
  emptyText: { color: 'rgba(255,255,255,0.35)', fontSize: 16 },
});
