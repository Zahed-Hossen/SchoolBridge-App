import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  TextInput,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';

import { useAuth } from '../../context/AuthContext';
import { useRole } from '../../context/RoleContext';
import { useTenant } from '../../context/TenantContext';
import { COLORS, FONTS, SPACING } from '../../constants/theme';

const Announcements = ({ navigation }) => {
  const { user } = useAuth();
  const { roleTheme } = useRole();
  const { tenantBranding } = useTenant();

  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Fix: define itemsPerPage
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 5;

  // Mock async loadAnnouncements for frontend-only development
  const loadAnnouncements = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 800));
      // Mock data
      const mockData = [
        {
          id: '1',
          title: 'Welcome to the New School Year!',
          description:
            'We are excited to start the new academic year. Please check your schedule and be on time.',
          category: 'Academic',
          priority: 'high',
          author: 'Principal',
          date: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
          read: false,
        },
        {
          id: '2',
          title: 'Library Renovation',
          description:
            'The school library will be closed for renovation from next week.',
          category: 'Facility',
          priority: 'medium',
          author: 'Admin',
          date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
          read: true,
        },
        {
          id: '3',
          title: 'Science Fair Registration',
          description:
            'Register for the annual science fair by the end of this month.',
          category: 'Event',
          priority: 'low',
          author: 'Science Dept.',
          date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
          read: false,
        },
      ];
      setAnnouncements(mockData);
    } catch (error) {
      Alert.alert('Error', 'Failed to load announcements');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // ✅ Filter announcements based on search
  const getFilteredAnnouncements = () => {
    let filtered = announcements;

    if (searchQuery) {
      filtered = filtered.filter(
        (announcement) =>
          announcement.title
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          announcement.description
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          announcement.category
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase()),
      );
    }

    return filtered;
  };

  // ✅ Get paginated announcements
  const getPaginatedAnnouncements = () => {
    const filtered = getFilteredAnnouncements();
    const offset = currentPage * itemsPerPage;
    return filtered.slice(offset, offset + itemsPerPage);
  };

  // ✅ Handle mark as read
  const handleMarkAsRead = async (announcementId) => {
    try {
      // Optimistically update UI
      setAnnouncements((prev) =>
        prev.map((announcement) =>
          announcement.id === announcementId
            ? { ...announcement, read: true }
            : announcement,
        ),
      );

      // Call API to update read status
      const response = await announcementService.markAsRead(announcementId);

      if (!response.success) {
        // Revert if API call failed
        setAnnouncements((prev) =>
          prev.map((announcement) =>
            announcement.id === announcementId
              ? { ...announcement, read: false }
              : announcement,
          ),
        );
        throw new Error(response.message || 'Failed to mark as read');
      }

      console.log(`✅ Announcement ${announcementId} marked as read`);
    } catch (error) {
      console.error('❌ Error marking announcement as read:', error);
      Alert.alert('Error', 'Failed to mark announcement as read');
    }
  };

  // ✅ Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = now - date;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
      if (diffHours === 0) {
        const diffMinutes = Math.floor(diffTime / (1000 * 60));
        return `${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''} ago`;
      }
      return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    }
  };

  // Get priority color (theme)
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return COLORS.error;
      case 'medium':
        return COLORS.warning;
      case 'low':
        return COLORS.success;
      default:
        return COLORS.grey.medium;
    }
  };

  // ✅ Get category icon
  const getCategoryIcon = (category) => {
    switch (category?.toLowerCase()) {
      case 'academic':
        return 'school';
      case 'facility':
        return 'business';
      case 'event':
        return 'calendar';
      case 'workshop':
        return 'construct';
      case 'holiday':
        return 'sunny';
      default:
        return 'information-circle';
    }
  };

  // ✅ Pagination
  const filteredAnnouncements = getFilteredAnnouncements();
  const currentAnnouncements = getPaginatedAnnouncements();
  const totalPages = Math.ceil(filteredAnnouncements.length / itemsPerPage);

  // ✅ Initial load
  useFocusEffect(
    useCallback(() => {
      loadAnnouncements();
    }, []),
  );

  const onRefresh = () => {
    loadAnnouncements(true);
  };

  // Theme colors
  const primaryColor =
    roleTheme?.primary || tenantBranding?.primaryColor || COLORS.student;
  const headerGradient = [COLORS.student, COLORS.primary];

  // Loading state
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={primaryColor} />
        <Text style={styles.loadingText}>Loading announcements...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Solid Color Header */}
      <SafeAreaView edges={['top']} style={{ backgroundColor: '#3498DB' }}>
        <View style={[styles.headerSolid, { backgroundColor: '#3498DB' }]}>
          <Text style={styles.headerTitle}>📢 Announcements</Text>
          <Text style={styles.headerSubtitle}>
            Stay updated with the latest news
          </Text>
        </View>
      </SafeAreaView>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons
          name="search"
          size={20}
          color={COLORS.grey.medium}
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.searchInput}
          placeholder="Search announcements..."
          value={searchQuery}
          onChangeText={(text) => {
            setSearchQuery(text);
            setCurrentPage(0);
          }}
          placeholderTextColor={COLORS.grey.medium}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity
            onPress={() => {
              setSearchQuery('');
              setCurrentPage(0);
            }}
          >
            <Ionicons
              name="close-circle"
              size={20}
              color={COLORS.grey.medium}
            />
          </TouchableOpacity>
        )}
      </View>

      {/* Stats Bar */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{announcements.length}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: COLORS.error }]}>
            {announcements.filter((a) => !a.read).length}
          </Text>
          <Text style={styles.statLabel}>Unread</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: COLORS.success }]}>
            {announcements.filter((a) => a.read).length}
          </Text>
          <Text style={styles.statLabel}>Read</Text>
        </View>
      </View>

      {/* Announcements List */}
      <ScrollView
        style={styles.announcementsList}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={primaryColor}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {getPaginatedAnnouncements().length > 0 ? (
          getPaginatedAnnouncements().map((announcement) => (
            <TouchableOpacity
              key={announcement.id}
              style={[
                styles.announcementCard,
                !announcement.read && styles.unreadCard,
              ]}
              onPress={() =>
                navigation.navigate('AnnouncementDetails', {
                  announcementId: announcement.id,
                  announcement: announcement,
                })
              }
              activeOpacity={0.7}
            >
              {/* Announcement Header */}
              <View style={styles.announcementHeader}>
                <View style={styles.announcementTitleContainer}>
                  <View style={styles.categoryContainer}>
                    <Ionicons
                      name={getCategoryIcon(announcement.category)}
                      size={16}
                      color={primaryColor}
                    />
                    <Text
                      style={[styles.categoryText, { color: primaryColor }]}
                    >
                      {announcement.category || 'General'}
                    </Text>
                  </View>
                  {!announcement.read && (
                    <View style={styles.unreadBadge}>
                      <Text style={styles.unreadBadgeText}>NEW</Text>
                    </View>
                  )}
                </View>
                <View
                  style={[
                    styles.priorityIndicator,
                    {
                      backgroundColor: getPriorityColor(announcement.priority),
                    },
                  ]}
                />
              </View>
              {/* Announcement Content */}
              <Text style={styles.announcementTitle} numberOfLines={2}>
                {announcement.title}
              </Text>
              <Text style={styles.announcementDescription} numberOfLines={3}>
                {announcement.description}
              </Text>
              {/* Announcement Footer */}
              <View style={styles.announcementFooter}>
                <View style={styles.announcementMeta}>
                  <Ionicons
                    name="person"
                    size={14}
                    color={COLORS.text.secondary}
                  />
                  <Text style={styles.announcementAuthor}>
                    {announcement.author || 'Administration'}
                  </Text>
                  <Text style={styles.announcementDot}>•</Text>
                  <Text style={styles.announcementDate}>
                    {formatDate(announcement.date)}
                  </Text>
                </View>
                {!announcement.read && (
                  <TouchableOpacity
                    style={[
                      styles.markAsReadButton,
                      { backgroundColor: primaryColor },
                    ]}
                    onPress={(e) => {
                      e.stopPropagation();
                      handleMarkAsRead(announcement.id);
                    }}
                  >
                    <Text style={styles.markAsReadButtonText}>
                      Mark as Read
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </TouchableOpacity>
          ))
        ) : (
          <View style={styles.emptyState}>
            <Ionicons
              name="megaphone-outline"
              size={64}
              color={COLORS.grey.medium}
            />
            <Text style={styles.emptyStateTitle}>
              {searchQuery
                ? 'No Matching Announcements'
                : 'No Announcements Yet'}
            </Text>
            <Text style={styles.emptyStateText}>
              {searchQuery
                ? 'Try adjusting your search terms'
                : 'New announcements will appear here when available'}
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Pagination */}
      {totalPages > 1 && (
        <View style={styles.paginationContainer}>
          <TouchableOpacity
            style={[
              styles.paginationButton,
              currentPage === 0 && styles.disabledButton,
            ]}
            onPress={() => setCurrentPage(Math.max(0, currentPage - 1))}
            disabled={currentPage === 0}
          >
            <Ionicons
              name="chevron-back"
              size={20}
              color={currentPage === 0 ? COLORS.grey.medium : primaryColor}
            />
            <Text
              style={[
                styles.paginationButtonText,
                {
                  color: currentPage === 0 ? COLORS.grey.medium : primaryColor,
                },
              ]}
            >
              Previous
            </Text>
          </TouchableOpacity>
          <View style={styles.paginationInfo}>
            <Text style={styles.paginationText}>
              Page {currentPage + 1} of {totalPages}
            </Text>
            <Text style={styles.paginationSubtext}>
              {filteredAnnouncements.length} total announcements
            </Text>
          </View>
          <TouchableOpacity
            style={[
              styles.paginationButton,
              currentPage >= totalPages - 1 && styles.disabledButton,
            ]}
            onPress={() =>
              setCurrentPage(Math.min(totalPages - 1, currentPage + 1))
            }
            disabled={currentPage >= totalPages - 1}
          >
            <Text
              style={[
                styles.paginationButtonText,
                {
                  color:
                    currentPage >= totalPages - 1
                      ? COLORS.grey.medium
                      : primaryColor,
                },
              ]}
            >
              Next
            </Text>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={
                currentPage >= totalPages - 1
                  ? COLORS.grey.medium
                  : primaryColor
              }
            />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.secondary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background.secondary,
  },
  loadingText: {
    fontSize: FONTS.sizes.md,
    color: COLORS.text.secondary,
    marginTop: 12,
  },
  headerSolid: {
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.lg,
    paddingHorizontal: SPACING.xl,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: FONTS.sizes.h1,
    fontWeight: FONTS.weights['700'],
    color: COLORS.white,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: FONTS.sizes.md,
    color: COLORS.text.white,
    opacity: 0.9,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    marginHorizontal: 16,
    marginVertical: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.grey.light,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: FONTS.sizes.md,
    color: COLORS.text.primary,
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: COLORS.grey.dark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: FONTS.sizes.xxl,
    fontWeight: FONTS.weights.bold,
    color: COLORS.text.primary,
  },
  statLabel: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.text.secondary,
    marginTop: 4,
  },
  announcementsList: {
    flex: 1,
    paddingHorizontal: 16,
  },
  announcementCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: COLORS.grey.dark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  unreadCard: {
    borderLeftWidth: 4,
    borderLeftColor: COLORS.student,
  },
  announcementHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  announcementTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categoryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background.secondary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginRight: 8,
  },
  categoryText: {
    fontSize: FONTS.sizes.sm,
    fontWeight: FONTS.weights['500'],
    marginLeft: 4,
  },
  unreadBadge: {
    backgroundColor: COLORS.error,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  unreadBadgeText: {
    fontSize: FONTS.sizes.xs,
    fontWeight: FONTS.weights.bold,
    color: COLORS.white,
  },
  priorityIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  announcementTitle: {
    fontSize: FONTS.sizes.lg,
    fontWeight: FONTS.weights['600'],
    color: COLORS.text.primary,
    marginBottom: 8,
    lineHeight: 24,
  },
  announcementDescription: {
    fontSize: FONTS.sizes.body3,
    color: COLORS.text.secondary,
    lineHeight: 20,
    marginBottom: 16,
  },
  announcementFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  announcementMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  announcementAuthor: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.text.secondary,
    marginLeft: 4,
  },
  announcementDot: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.grey.medium,
    marginHorizontal: 6,
  },
  announcementDate: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.text.light,
  },
  markAsReadButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  markAsReadButtonText: {
    fontSize: FONTS.sizes.sm,
    fontWeight: FONTS.weights['500'],
    color: COLORS.white,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyStateTitle: {
    fontSize: FONTS.sizes.xl,
    fontWeight: FONTS.weights['600'],
    color: COLORS.text.primary,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: FONTS.sizes.body3,
    color: COLORS.text.light,
    textAlign: 'center',
    lineHeight: 20,
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: COLORS.grey.light,
  },
  paginationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  disabledButton: {
    opacity: 0.5,
  },
  paginationButtonText: {
    fontSize: FONTS.sizes.body3,
    fontWeight: FONTS.weights['500'],
    marginHorizontal: 4,
  },
  paginationInfo: {
    alignItems: 'center',
  },
  paginationText: {
    fontSize: FONTS.sizes.body3,
    fontWeight: FONTS.weights['500'],
    color: COLORS.text.primary,
  },
  paginationSubtext: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.text.secondary,
    marginTop: 2,
  },
});

export default Announcements;
