import { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { tournamentApi } from '../../lib/api';

interface Standing {
  userId: string;
  rank: number | null;
  totalWeightOz: string;
  catchCount: number;
  firstName: string;
  lastName: string;
}

export default function LeaderboardScreen() {
  const [standings, setStandings] = useState<Standing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: Get active tournament ID from context/params
    // For now, show placeholder
    setLoading(false);
  }, []);

  const renderItem = ({ item, index }: { item: Standing; index: number }) => {
    const weightLbs = (parseFloat(item.totalWeightOz) / 16).toFixed(2);
    const isTop3 = index < 3;

    return (
      <View style={[styles.row, isTop3 && styles.topRow]}>
        <Text style={[styles.rank, isTop3 && styles.topRank]}>
          {item.rank || index + 1}
        </Text>
        <View style={styles.nameCol}>
          <Text style={styles.name}>{item.firstName} {item.lastName}</Text>
          <Text style={styles.catches}>{item.catchCount} {item.catchCount === 1 ? 'catch' : 'catches'}</Text>
        </View>
        <Text style={[styles.weight, isTop3 && styles.topWeight]}>{weightLbs} lbs</Text>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <Text style={styles.placeholder}>Loading...</Text>
      </View>
    );
  }

  if (standings.length === 0) {
    return (
      <View style={styles.center}>
        <Text style={styles.placeholder}>No active tournament</Text>
        <Text style={styles.subtext}>Register for a tournament to see the live leaderboard</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={standings}
      renderItem={renderItem}
      keyExtractor={(item) => item.userId}
      style={styles.list}
      contentContainerStyle={styles.listContent}
    />
  );
}

const styles = StyleSheet.create({
  list: { flex: 1, backgroundColor: '#111' },
  listContent: { padding: 16, gap: 2 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#111' },
  placeholder: { color: 'rgba(255,255,255,0.35)', fontSize: 18, fontWeight: '700' },
  subtext: { color: 'rgba(255,255,255,0.2)', fontSize: 13, marginTop: 8 },
  row: {
    flexDirection: 'row', alignItems: 'center',
    padding: 14, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  topRow: { backgroundColor: 'rgba(74,222,128,0.05)' },
  rank: { width: 32, fontSize: 16, fontWeight: '800', color: 'rgba(255,255,255,0.4)', textAlign: 'center' },
  topRank: { color: '#4ADE80' },
  nameCol: { flex: 1, marginLeft: 12 },
  name: { fontSize: 15, fontWeight: '700', color: '#fff' },
  catches: { fontSize: 11, color: 'rgba(255,255,255,0.35)', marginTop: 2 },
  weight: { fontSize: 16, fontWeight: '800', color: 'rgba(255,255,255,0.6)' },
  topWeight: { color: '#fff' },
});
