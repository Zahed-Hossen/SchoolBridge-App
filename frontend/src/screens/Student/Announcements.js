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
import { useFocusEffect } from '@react-navigation/native';

import { useAuth } from '../../context/AuthContext';
import { useRole } from '../../context/RoleContext';
import { useTenant } from '../../context/TenantContext';
import { announcementService } from '../../api/services/announcementService';

const Announcements = ({ navigation }) => {
  const { user } = useAuth();
  const { roleTheme } = useRole();
  const { tenantBranding } = useTenant();

  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [itemsPerPage] = useState(5);

  // ✅ Load announcements from API
  const loadAnnouncements = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
        setCurrentPage(0);
      } else {
        setLoading(true);
      }

      console.log('📢 Loading announcements...');

      // Use your existing API service
      const response = await announcementService.getAll({
        page: currentPage + 1,
        limit: itemsPerPage * 3, // Load more for offline use
      });

      if (response.success && response.data) {
        setAnnouncements(response.data.announcements || []);
        console.log('✅ Announcements loaded successfully');
      } else {
        throw new Error(response.message || 'Failed to load announcements');
      }

    } catch (error) {
      console.error('❌ Error loading announcements:', error);

      // Use mock data as fallback
      setAnnouncements(getMockAnnouncements());

      Alert.alert(
        'Connection Issue',
        'Using offline data. Pull down to refresh.',
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // ✅ Mock announcements data matching your web structure
  const getMockAnnouncements = () => [
    {
      id: 1,
      title: 'Exam Schedule Released',
      description: 'The mid-term examination schedule has been released. Please check your student portal for specific dates and times.',
      date: '2024-08-04T10:30:00Z',
      read: false,
      priority: 'high',
      author: 'Academic Office',
      category: 'Academic',
    },
    {
      id: 2,
      title: 'Library Hours Extended',
      description: 'During exam week, the library will remain open until 10:00 PM Monday through Friday to accommodate student study needs.',
      date: '2024-08-03T14:20:00Z',
      read: false,
      priority: 'medium',
      author: 'Library Administration',
      category: 'Facility',
    },
    {
      id: 3,
      title: 'Sports Day Event',
      description: 'Annual sports day is scheduled for next Friday. All students are encouraged to participate in various athletic events.',
      date: '2024-08-02T09:15:00Z',
      read: true,
      priority: 'medium',
      author: 'Sports Department',
      category: 'Event',
    },
    {
      id: 4,
      title: 'New Cafeteria Menu',
      description: 'We\'ve updated our cafeteria menu with healthier options and student favorites. Check out the new offerings starting Monday.',
      date: '2024-08-01T16:45:00Z',
      read: true,
      priority: 'low',
      author: 'Food Services',
      category: 'Facility',
    },
    {
      id: 5,
      title: 'Parent-Teacher Conference',
      description: 'Parent-teacher conferences are scheduled for August 15-16. Please sign up for your preferred time slot through the parent portal.',
      date: '2024-07-31T11:30:00Z',
      read: false,
      priority: 'high',
      author: 'Administration',
      category: 'Academic',
    },
    {
      id: 6,
      title: 'Technology Workshop',
      description: 'Join us for a technology workshop focusing on digital literacy and online learning tools. Open to all students.',
      date: '2024-07-30T13:00:00Z',
      read: true,
      priority: 'medium',
      author: 'IT Department',
      category: 'Workshop',
    },
    {
      id: 7,
      title: 'School Holiday Notice',
      description: 'Please note that school will be closed next Friday for a staff development day. Regular classes will resume the following Monday.',
      date: '2024-07-29T08:45:00Z',
      read: true,
      priority: 'high',
      author: 'Principal\'s Office',
      category: 'Holiday',
    },
    {
      id: 8,
      title: 'Art Exhibition Opening',
      description: 'Student art exhibition opens in the main hall. Come view the creative works of your fellow students.',
      date: '2024-07-28T15:20:00Z',
      read: false,
      priority: 'low',
      author: 'Art Department',
      category: 'Event',
    },
  ];

  // ✅ Filter announcements based on search
  const getFilteredAnnouncements = () => {
    let filtered = announcements;

    if (searchQuery) {
      filtered = filtered.filter(announcement =>
        announcement.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        announcement.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        announcement.category?.toLowerCase().includes(searchQuery.toLowerCase())
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
      setAnnouncements(prev =>
        prev.map(announcement =>
          announcement.id === announcementId
            ? { ...announcement, read: true }
            : announcement
        )
      );

      // Call API to update read status
      const response = await announcementService.markAsRead(announcementId);

      if (!response.success) {
        // Revert if API call failed
        setAnnouncements(prev =>
          prev.map(announcement =>
            announcement.id === announcementId
              ? { ...announcement, read: false }
              : announcement
          )
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

  // ✅ Get priority color
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return '#E74C3C';
      case 'medium': return '#F39C12';
      case 'low': return '#27AE60';
      default: return '#95A5A6';
    }
  };

  // ✅ Get category icon
  const getCategoryIcon = (category) => {
    switch (category?.toLowerCase()) {
      case 'academic': return 'school';
      case 'facility': return 'business';
      case 'event': return 'calendar';
      case 'workshop': return 'construct';
      case 'holiday': return 'sunny';
      default: return 'information-circle';
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
    }, [])
  );

  const onRefresh = () => {
    loadAnnouncements(true);
  };

  // Theme colors
  const primaryColor = roleTheme?.primary || tenantBranding?.primaryColor || '#3498DB';

  // ✅ Loading state
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
      {/* ✅ Header */}
      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>📢 Announcements</Text>
        <Text style={styles.headerSubtitle}>
          Stay updated with the latest news
        </Text>
      </View>

      {/* ✅ Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search announcements..."
          value={searchQuery}
          onChangeText={(text) => {
            setSearchQuery(text);
            setCurrentPage(0); // Reset to first page when searching
          }}
          placeholderTextColor="#999"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity
            onPress={() => {
              setSearchQuery('');
              setCurrentPage(0);
            }}
          >
            <Ionicons name="close-circle" size={20} color="#999" />
          </TouchableOpacity>
        )}
      </View>

      {/* ✅ Stats Bar */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{announcements.length}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: '#E74C3C' }]}>
            {announcements.filter(a => !a.read).length}
          </Text>
          <Text style={styles.statLabel}>Unread</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: '#27AE60' }]}>
            {announcements.filter(a => a.read).length}
          </Text>
          <Text style={styles.statLabel}>Read</Text>
        </View>
      </View>

      {/* ✅ Announcements List */}
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
        {currentAnnouncements.length > 0 ? (
          currentAnnouncements.map((announcement) => (
            <TouchableOpacity
              key={announcement.id}
              style={[
                styles.announcementCard,
                !announcement.read && styles.unreadCard
              ]}
              onPress={() => navigation.navigate('AnnouncementDetails', {
                announcementId: announcement.id,
                announcement: announcement
              })}
              activeOpacity={0.7}
            >
              {/* ✅ Announcement Header */}
              <View style={styles.announcementHeader}>
                <View style={styles.announcementTitleContainer}>
                  <View style={styles.categoryContainer}>
                    <Ionicons
                      name={getCategoryIcon(announcement.category)}
                      size={16}
                      color={primaryColor}
                    />
                    <Text style={[styles.categoryText, { color: primaryColor }]}>
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
                    { backgroundColor: getPriorityColor(announcement.priority) }
                  ]}
                />
              </View>

              {/* ✅ Announcement Content */}
              <Text style={styles.announcementTitle} numberOfLines={2}>
                {announcement.title}
              </Text>

              <Text style={styles.announcementDescription} numberOfLines={3}>
                {announcement.description}
              </Text>

              {/* ✅ Announcement Footer */}
              <View style={styles.announcementFooter}>
                <View style={styles.announcementMeta}>
                  <Ionicons name="person" size={14} color="#666" />
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
                    style={[styles.markAsReadButton, { backgroundColor: primaryColor }]}
                    onPress={(e) => {
                      e.stopPropagation();
                      handleMarkAsRead(announcement.id);
                    }}
                  >
                    <Text style={styles.markAsReadButtonText}>Mark as Read</Text>
                  </TouchableOpacity>
                )}
              </View>
            </TouchableOpacity>
          ))
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="megaphone-outline" size={64} color="#CCC" />
            <Text style={styles.emptyStateTitle}>
              {searchQuery ? 'No Matching Announcements' : 'No Announcements Yet'}
            </Text>
            <Text style={styles.emptyStateText}>
              {searchQuery
                ? 'Try adjusting your search terms'
                : 'New announcements will appear here when available'
              }
            </Text>
          </View>
        )}
      </ScrollView>

      {/* ✅ Pagination */}
      {totalPages > 1 && (
        <View style={styles.paginationContainer}>
          <TouchableOpacity
            style={[
              styles.paginationButton,
              currentPage === 0 && styles.disabledButton
            ]}
            onPress={() => setCurrentPage(Math.max(0, currentPage - 1))}
            disabled={currentPage === 0}
          >
            <Ionicons name="chevron-back" size={20} color={currentPage === 0 ? '#CCC' : primaryColor} />
            <Text style={[
              styles.paginationButtonText,
              { color: currentPage === 0 ? '#CCC' : primaryColor }
            ]}>
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
              currentPage >= totalPages - 1 && styles.disabledButton
            ]}
            onPress={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
            disabled={currentPage >= totalPages - 1}
          >
            <Text style={[
              styles.paginationButtonText,
              { color: currentPage >= totalPages - 1 ? '#CCC' : primaryColor }
            ]}>
              Next
            </Text>
            <Ionicons name="chevron-forward" size={20} color={currentPage >= totalPages - 1 ? '#CCC' : primaryColor} />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    marginTop: 12,
  },
  headerContainer: {
    backgroundColor: '#FFFFFF',
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#666',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginVertical: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  announcementsList: {
    flex: 1,
    paddingHorizontal: 16,
  },
  announcementCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  unreadCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#3498DB',
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
    backgroundColor: '#F8F9FA',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginRight: 8,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
  },
  unreadBadge: {
    backgroundColor: '#E74C3C',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  unreadBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  priorityIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  announcementTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    lineHeight: 24,
  },
  announcementDescription: {
    fontSize: 14,
    color: '#666',
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
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  announcementDot: {
    fontSize: 12,
    color: '#CCC',
    marginHorizontal: 6,
  },
  announcementDate: {
    fontSize: 12,
    color: '#999',
  },
  markAsReadButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  markAsReadButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    lineHeight: 20,
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
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
    fontSize: 14,
    fontWeight: '500',
    marginHorizontal: 4,
  },
  paginationInfo: {
    alignItems: 'center',
  },
  paginationText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  paginationSubtext: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
});

export default Announcements;
