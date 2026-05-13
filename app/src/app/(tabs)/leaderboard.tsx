import { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, RefreshControl } from 'react-native';
import { api } from '../../lib/api';

interface AOYEntry {
  rank: number;
  angler: { id: string; name: string; avatarUrl: string | null };
  totalPoints: number;
  tournamentsFished: number;
  bestFinish: number;
  totalFish: number;
  totalLength: number;
}

export default function LeaderboardScreen() {
  const [standings, setStandings] = useState<AOYEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isTeam, setIsTeam] = useState(false);
  const season = new Date().getFullYear();

  const fetchStandings = useCallback(async (showLoader = true) => {
    if (showLoader) setLoading(true);
    try {
      const data = await api(`/api/results/aoy?season=${season}&is_team=${isTeam}&limit=100`);
      setStandings(data.standings || []);
    } catch {
      // Silently fail — show empty state
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [season, isTeam]);

  useEffect(() => { fetchStandings(); }, [fetchStandings]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchStandings(false);
  };

  const renderItem = ({ item }: { item: AOYEntry }) => {
    const isTop3 = item.rank <= 3;

    return (
      <View style={[styles.row, isTop3 && styles.topRow]}>
        <View style={[styles.rankBadge, isTop3 && styles.topRankBadge]}>
          <Text style={[styles.rank, isTop3 && styles.topRank]}>{item.rank}</Text>
        </View>
        <View style={styles.nameCol}>
          <Text style={styles.name}>{item.angler.name}</Text>
          <Text style={styles.stats}>
            {item.tournamentsFished} events  ·  {item.totalFish} fish  ·  {item.totalLength.toFixed(1)}"
          </Text>
        </View>
        <View style={styles.pointsCol}>
          <Text style={[styles.points, isTop3 && styles.topPoints]}>{item.totalPoints}</Text>
          <Text style={styles.pointsLabel}>PTS</Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Toggle: Individual / Team */}
      <View style={styles.toggleBar}>
        <TouchableOpacity
          style={[styles.toggleBtn, !isTeam && styles.toggleActive]}
          onPress={() => setIsTeam(false)}
        >
          <Text style={[styles.toggleText, !isTeam && styles.toggleActiveText]}>INDIVIDUAL</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.toggleBtn, isTeam && styles.toggleActive]}
          onPress={() => setIsTeam(true)}
        >
          <Text style={[styles.toggleText, isTeam && styles.toggleActiveText]}>TEAM</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.seasonLabel}>{season} ANGLER OF THE YEAR</Text>

      {loading ? (
        <View style={styles.center}>
          <Text style={styles.placeholder}>Loading standings...</Text>
        </View>
      ) : standings.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.placeholder}>No standings yet</Text>
          <Text style={styles.subtext}>Results will appear after the first tournament</Text>
        </View>
      ) : (
        <FlatList
          data={standings}
          renderItem={renderItem}
          keyExtractor={(item) => item.angler.id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#4ADE80" />
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#111' },
  toggleBar: { flexDirection: 'row', padding: 16, paddingBottom: 0, gap: 8 },
  toggleBtn: { flex: 1, padding: 10, borderRadius: 8, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', alignItems: 'center' },
  toggleActive: { backgroundColor: 'rgba(74,222,128,0.1)', borderColor: '#4ADE80' },
  toggleText: { fontSize: 11, fontWeight: '800', color: 'rgba(255,255,255,0.35)', letterSpacing: 1.5 },
  toggleActiveText: { color: '#4ADE80' },
  seasonLabel: { fontSize: 11, fontWeight: '700', color: 'rgba(255,255,255,0.25)', letterSpacing: 1.5, textAlign: 'center', paddingVertical: 12 },
  listContent: { paddingHorizontal: 16, paddingBottom: 32 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  placeholder: { color: 'rgba(255,255,255,0.35)', fontSize: 18, fontWeight: '700' },
  subtext: { color: 'rgba(255,255,255,0.2)', fontSize: 13, marginTop: 8 },
  row: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  topRow: { backgroundColor: 'rgba(74,222,128,0.04)', borderRadius: 8, marginBottom: 2, paddingHorizontal: 8 },
  rankBadge: { width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.06)', justifyContent: 'center', alignItems: 'center' },
  topRankBadge: { backgroundColor: 'rgba(74,222,128,0.15)' },
  rank: { fontSize: 14, fontWeight: '800', color: 'rgba(255,255,255,0.4)' },
  topRank: { color: '#4ADE80' },
  nameCol: { flex: 1, marginLeft: 12 },
  name: { fontSize: 15, fontWeight: '700', color: '#fff' },
  stats: { fontSize: 11, color: 'rgba(255,255,255,0.3)', marginTop: 3 },
  pointsCol: { alignItems: 'flex-end' },
  points: { fontSize: 18, fontWeight: '900', color: 'rgba(255,255,255,0.6)' },
  topPoints: { color: '#fff' },
  pointsLabel: { fontSize: 9, fontWeight: '700', color: 'rgba(255,255,255,0.2)', letterSpacing: 1, marginTop: 1 },
});
