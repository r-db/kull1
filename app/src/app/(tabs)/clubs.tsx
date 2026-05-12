import { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, RefreshControl } from 'react-native';
import { clubApi } from '../../lib/api';

interface Club {
  id: string;
  name: string;
  region: string | null;
  status: string;
}

export default function ClubsScreen() {
  const [clubs, setClubs] = useState<Club[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchClubs = async () => {
    try {
      const data = await clubApi.list();
      setClubs(data);
    } catch (err) {
      console.error('Failed to load clubs:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchClubs(); }, []);

  const renderItem = ({ item }: { item: Club }) => (
    <TouchableOpacity style={styles.card} activeOpacity={0.7}>
      <Text style={styles.name}>{item.name}</Text>
      {item.region && <Text style={styles.region}>{item.region}</Text>}
    </TouchableOpacity>
  );

  return (
    <FlatList
      data={clubs}
      renderItem={renderItem}
      keyExtractor={(item) => item.id}
      style={styles.list}
      contentContainerStyle={styles.listContent}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchClubs(); }} tintColor="#4ADE80" />}
      ListEmptyComponent={
        <View style={styles.center}>
          <Text style={styles.emptyText}>{loading ? 'Loading clubs...' : 'No clubs yet'}</Text>
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
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 10, padding: 16,
  },
  name: { fontSize: 16, fontWeight: '800', color: '#fff' },
  region: { fontSize: 13, color: 'rgba(255,255,255,0.55)', marginTop: 4 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 100 },
  emptyText: { color: 'rgba(255,255,255,0.35)', fontSize: 14 },
});
