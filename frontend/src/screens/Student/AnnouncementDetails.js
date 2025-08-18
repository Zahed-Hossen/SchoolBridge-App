import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SPACING } from '../../constants/theme';

const HEADER_COLOR = '#3498DB';

const AnnouncementDetails = ({ route, navigation }) => {
  const { announcement } = route.params || {};
  if (!announcement) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="alert-circle" size={48} color={COLORS.error} />
        <Text style={styles.emptyText}>Announcement not found.</Text>
      </View>
    );
  }

  // Header with SafeAreaView and color sync
  const Header = () => (
    <SafeAreaView edges={['top']} style={{ backgroundColor: HEADER_COLOR }}>
      <View style={[styles.header, { backgroundColor: HEADER_COLOR }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={26} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {announcement.title}
        </Text>
        <View style={{ width: 32 }} />
      </View>
    </SafeAreaView>
  );

  return (
    <View style={styles.container}>
      <Header />
      <ScrollView
        style={styles.content}
        contentContainerStyle={{ padding: SPACING.lg }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.metaRow}>
          <Ionicons name="person" size={16} color={COLORS.text.secondary} />
          <Text style={styles.metaText}>
            {announcement.author || 'Administration'}
          </Text>
          <Text style={styles.metaDot}>•</Text>
          <Text style={styles.metaText}>
            {new Date(announcement.date).toLocaleString()}
          </Text>
        </View>
        <Text style={styles.description}>{announcement.description}</Text>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.secondary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingTop: Platform.OS === 'ios' ? 44 : 16,
    paddingBottom: SPACING.md,
    backgroundColor: HEADER_COLOR,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    elevation: 2,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.12)',
    marginRight: 8,
  },
  headerTitle: {
    fontSize: FONTS.sizes.h3,
    color: '#fff',
    flex: 1,
    textAlign: 'center',
    fontWeight: '700',
  },
  content: {
    flex: 1,
    backgroundColor: COLORS.background.secondary,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background.secondary,
  },
  emptyText: {
    fontSize: FONTS.sizes.lg,
    color: COLORS.text.secondary,
    marginTop: 16,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  metaText: {
    fontSize: FONTS.sizes.body3,
    color: COLORS.text.secondary,
    marginLeft: 4,
  },
  metaDot: {
    fontSize: FONTS.sizes.body3,
    color: COLORS.text.light,
    marginHorizontal: 8,
  },
  description: {
    fontSize: FONTS.sizes.md,
    color: COLORS.text.primary,
    lineHeight: 22,
    marginTop: 8,
  },
});

export default AnnouncementDetails;
