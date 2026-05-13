import { View, Text, StyleSheet, ScrollView, Linking, TouchableOpacity } from 'react-native';

export default function ClubsScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Club Header */}
      <View style={styles.header}>
        <Text style={styles.clubName}>YAK-A-BASS</Text>
        <Text style={styles.clubRegion}>NOR-CAL</Text>
        <Text style={styles.clubDescription}>
          Northern California's premier kayak bass fishing tournament trail.
          GPS-verified catches, live leaderboards, and Angler of the Year competition.
        </Text>
      </View>

      {/* Quick Stats */}
      <View style={styles.statsRow}>
        <View style={styles.stat}>
          <Text style={styles.statIcon}>🏆</Text>
          <Text style={styles.statValue}>10</Text>
          <Text style={styles.statLabel}>EVENTS</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statIcon}>👥</Text>
          <Text style={styles.statValue}>50+</Text>
          <Text style={styles.statLabel}>ANGLERS</Text>
        </View>
      </View>

      {/* Links */}
      <View style={styles.links}>
        <TouchableOpacity
          style={styles.linkCard}
          onPress={() => Linking.openURL('https://yakabass.kull1.com')}
        >
          <Text style={styles.linkIcon}>🌐</Text>
          <Text style={styles.linkText}>yakabass.kull1.com</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.linkCard}
          onPress={() => Linking.openURL('https://maps.google.com/?q=California+Delta')}
        >
          <Text style={styles.linkIcon}>📍</Text>
          <Text style={styles.linkText}>California Delta Region</Text>
        </TouchableOpacity>
      </View>

      {/* Coming Soon */}
      <View style={styles.comingSoon}>
        <Text style={styles.comingSoonTitle}>MORE CLUBS COMING</Text>
        <Text style={styles.comingSoonText}>
          KULL 1 is expanding. Your club could be next. Tournament directors can apply to run their trail on the KULL 1 platform.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#111' },
  content: { padding: 24, paddingBottom: 48 },
  header: { marginBottom: 32, paddingTop: 16 },
  clubName: { fontSize: 28, fontWeight: '900', color: '#fff', letterSpacing: 4, marginBottom: 4 },
  clubRegion: { fontSize: 13, fontWeight: '700', color: '#4ADE80', letterSpacing: 2, marginBottom: 16 },
  clubDescription: { fontSize: 15, color: 'rgba(255,255,255,0.6)', lineHeight: 24 },
  statsRow: { flexDirection: 'row', gap: 16, marginBottom: 32 },
  stat: {
    flex: 1, backgroundColor: 'rgba(255,255,255,0.03)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)',
    borderRadius: 12, padding: 20, alignItems: 'center', gap: 8,
  },
  statIcon: { fontSize: 20 },
  statValue: { fontSize: 24, fontWeight: '900', color: '#fff' },
  statLabel: { fontSize: 10, fontWeight: '700', color: 'rgba(255,255,255,0.3)', letterSpacing: 1.5 },
  links: { gap: 10, marginBottom: 32 },
  linkCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: 'rgba(255,255,255,0.03)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)',
    borderRadius: 10, padding: 16,
  },
  linkIcon: { fontSize: 16 },
  linkText: { fontSize: 14, color: 'rgba(255,255,255,0.7)', fontWeight: '600' },
  comingSoon: {
    backgroundColor: 'rgba(74,222,128,0.04)', borderWidth: 1, borderColor: 'rgba(74,222,128,0.15)',
    borderRadius: 12, padding: 20,
  },
  comingSoonTitle: { fontSize: 12, fontWeight: '800', color: '#4ADE80', letterSpacing: 1.5, marginBottom: 8 },
  comingSoonText: { fontSize: 14, color: 'rgba(255,255,255,0.5)', lineHeight: 22 },
});
