import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
  TextInput,
  Modal,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { apiService } from '../../api/apiService';

const StudentAnnouncements = ({ navigation }) => {
  const { user } = useAuth();
  const [announcements, setAnnouncements] = useState([]);
  const [filteredAnnouncements, setFilteredAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  // ✅ ENHANCED: Pagination state (like your web version)
  const [currentPage, setCurrentPage] = useState(0);
  const [itemsPerPage] = useState(10);

  const categories = [
    'All',
    'Academic',
    'Events',
    'Administrative',
    'Emergency',
    'Sports',
    'Library',
  ];

  // ✅ UPDATED: Use the new API service
  const fetchAnnouncements = useCallback(async () => {
    try {
      setLoading(true);

      // Try to fetch from backend using new API service
      const response = await apiService.announcements.getAll({
        category: selectedCategory !== 'All' ? selectedCategory : undefined,
        search: searchQuery,
        page: currentPage,
        limit: itemsPerPage,
      });

      if (response.success) {
        setAnnouncements(response.announcements || response.data);
        console.log('✅ Announcements fetched from backend');
      } else {
        throw new Error('Backend returned error');
      }
    } catch (error) {
      console.error('Error fetching announcements:', error);
      console.log('📱 Using mock data as fallback');
      // Fallback to mock data if backend fails
      loadMockData();
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedCategory, searchQuery, currentPage, itemsPerPage]);

  // ✅ ENHANCED: Mock data (enhanced from your web structure)
  const loadMockData = () => {
    const mockAnnouncements = [
      {
        id: 1,
        title: 'Mid-Term Examination Schedule Released',
        description:
          'The mid-term examination schedule for all subjects has been released. Please check your student portal for detailed timings and venues.',
        content:
          'The mid-term examination schedule for all subjects has been released. Please check your student portal for detailed timings and venues. Make sure to arrive 15 minutes before your scheduled exam time. Bring your student ID and required stationery.',
        category: 'Academic',
        priority: 'high',
        author: 'Academic Office',
        date: '2024-01-15',
        time: '09:30 AM',
        read: false,
        attachments: ['exam_schedule.pdf'],
        tags: ['exams', 'important', 'schedule'],
      },
      {
        id: 2,
        title: 'Annual Science Fair 2024',
        description:
          'Get ready for our Annual Science Fair! This year\'s theme is "Innovation for Tomorrow". Students from grades 9-12 can participate.',
        content:
          'Get ready for our Annual Science Fair! This year\'s theme is "Innovation for Tomorrow". Students from grades 9-12 can participate. Registration deadline is January 25th. Prizes worth $5000 to be won! Contact your science teacher for more details.',
        category: 'Events',
        priority: 'medium',
        author: 'Science Department',
        date: '2024-01-14',
        time: '02:15 PM',
        read: true,
        attachments: ['science_fair_guidelines.pdf', 'registration_form.pdf'],
        tags: ['science', 'competition', 'fair'],
      },
      {
        id: 3,
        title: 'Library Hours Extended During Exam Week',
        description:
          'To support student preparation for mid-term exams, the library will extend its hours from Monday to Friday, 6:00 AM to 11:00 PM.',
        content:
          'To support student preparation for mid-term exams, the library will extend its hours from Monday to Friday, 6:00 AM to 11:00 PM. Additional study rooms and computer access will be available. Silent study zones will be strictly enforced.',
        category: 'Library',
        priority: 'medium',
        author: 'Library Administration',
        date: '2024-01-14',
        time: '11:45 AM',
        read: true,
        attachments: [],
        tags: ['library', 'study', 'hours'],
      },
      {
        id: 4,
        title: 'Emergency Drill Scheduled',
        description:
          'A fire safety drill has been scheduled for tomorrow at 10:00 AM. All students and staff must evacuate buildings immediately upon hearing the alarm.',
        content:
          'A fire safety drill has been scheduled for tomorrow at 10:00 AM. All students and staff must evacuate buildings immediately upon hearing the alarm. Assembly point is the main playground. Please review evacuation procedures.',
        category: 'Emergency',
        priority: 'high',
        author: 'Safety Department',
        date: '2024-01-13',
        time: '04:20 PM',
        read: false,
        attachments: ['evacuation_map.pdf'],
        tags: ['safety', 'emergency', 'drill'],
      },
      {
        id: 5,
        title: 'Winter Sports Registration Open',
        description:
          'Registration for winter sports including basketball, volleyball, and swimming is now open. Tryouts begin next week.',
        content:
          'Registration for winter sports including basketball, volleyball, and swimming is now open. Tryouts begin next week. Contact the sports department for more information. Physical fitness certificate required.',
        category: 'Sports',
        priority: 'low',
        author: 'Sports Department',
        date: '2024-01-12',
        time: '01:30 PM',
        read: true,
        attachments: ['sports_registration.pdf'],
        tags: ['sports', 'registration', 'winter'],
      },
      {
        id: 6,
        title: 'Fee Payment Deadline Reminder',
        description:
          'This is a reminder that the deadline for semester fee payment is January 20th. Late payments will incur a penalty.',
        content:
          'This is a reminder that the deadline for semester fee payment is January 20th. Late payments will incur a penalty. Please ensure your fees are paid on time. Payment can be made online or at the finance office.',
        category: 'Administrative',
        priority: 'high',
        author: 'Finance Office',
        date: '2024-01-11',
        time: '09:00 AM',
        read: false,
        attachments: ['fee_structure.pdf'],
        tags: ['fees', 'payment', 'deadline'],
      },
      {
        id: 7,
        title: 'Guest Lecture on AI and Machine Learning',
        description:
          'Join us for an exciting guest lecture by Dr. Sarah Chen from MIT on "The Future of AI in Education".',
        content:
          'Join us for an exciting guest lecture by Dr. Sarah Chen from MIT on "The Future of AI in Education". The session will be held in the main auditorium on January 18th at 2:00 PM. All students are welcome to attend.',
        category: 'Academic',
        priority: 'medium',
        author: 'Computer Science Department',
        date: '2024-01-10',
        time: '03:45 PM',
        read: true,
        attachments: ['speaker_bio.pdf'],
        tags: ['lecture', 'AI', 'technology'],
      },
      {
        id: 8,
        title: 'New Cafeteria Menu Available',
        description:
          'A new healthy and diverse menu has been introduced in the cafeteria. Check out the vegetarian, vegan, and gluten-free options.',
        content:
          'A new healthy and diverse menu has been introduced in the cafeteria. Check out the vegetarian, vegan, and gluten-free options now available daily. Nutritional information is posted at each station.',
        category: 'Administrative',
        priority: 'low',
        author: 'Cafeteria Management',
        date: '2024-01-09',
        time: '12:00 PM',
        read: true,
        attachments: ['menu_january.pdf'],
        tags: ['cafeteria', 'menu', 'food'],
      },
    ];

    setAnnouncements(mockAnnouncements);
  };

  useEffect(() => {
    fetchAnnouncements();
  }, [fetchAnnouncements]);

  useEffect(() => {
    filterAnnouncements();
  }, [announcements, searchQuery, selectedCategory]);

  // ✅ ENHANCED: Filter announcements (like your web pagination)
  const filterAnnouncements = () => {
    let filtered = announcements;

    // Filter by category
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(
        (announcement) => announcement.category === selectedCategory,
      );
    }

    // Filter by search query
    if (searchQuery.trim()) {
      filtered = filtered.filter(
        (announcement) =>
          announcement.title
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          announcement.description
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          announcement.tags?.some((tag) =>
            tag.toLowerCase().includes(searchQuery.toLowerCase()),
          ),
      );
    }

    setFilteredAnnouncements(filtered);
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchAnnouncements();
  };

  // ✅ UPDATED: Enhanced mark as read with API call
  const handleMarkAsRead = async (announcementId) => {
    try {
      // Try to mark as read on backend
      await apiService.announcements.markAsRead(announcementId);
    } catch (error) {
      console.error('Error marking as read on backend:', error);
      // Continue with local update even if backend fails
    }

    // Update local state
    setAnnouncements((prev) =>
      prev.map((announcement) =>
        announcement.id === announcementId
          ? { ...announcement, read: true }
          : announcement,
      ),
    );
  };

  const openAnnouncementDetail = (announcement) => {
    setSelectedAnnouncement(announcement);
    setModalVisible(true);
    if (!announcement.read) {
      handleMarkAsRead(announcement.id);
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return '#E74C3C';
      case 'medium':
        return '#F39C12';
      case 'low':
        return '#27AE60';
      default:
        return '#3498DB';
    }
  };

  const getCategoryColor = (category) => {
    const colors = {
      Academic: '#3498DB',
      Events: '#9B59B6',
      Administrative: '#34495E',
      Emergency: '#E74C3C',
      Sports: '#E67E22',
      Library: '#16A085',
    };
    return colors[category] || '#95A5A6';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const diffTime = today - date;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  // ✅ ENHANCED: Pagination (like your web version)
  const getPaginatedData = () => {
    const offset = currentPage * itemsPerPage;
    return filteredAnnouncements.slice(offset, offset + itemsPerPage);
  };

  const totalPages = Math.ceil(filteredAnnouncements.length / itemsPerPage);

  const renderAnnouncementItem = ({ item }) => (
    <TouchableOpacity
      style={[styles.announcementCard, !item.read && styles.unreadCard]}
      onPress={() => openAnnouncementDetail(item)}
    >
      <View style={styles.cardHeader}>
        <View style={styles.headerLeft}>
          <View
            style={[
              styles.categoryTag,
              { backgroundColor: getCategoryColor(item.category) },
            ]}
          >
            <Text style={styles.categoryText}>{item.category}</Text>
          </View>
          <View
            style={[
              styles.priorityIndicator,
              { backgroundColor: getPriorityColor(item.priority) },
            ]}
          />
        </View>
        <View style={styles.headerRight}>
          <Text style={styles.dateText}>{formatDate(item.date)}</Text>
          <Text style={styles.timeText}>{item.time}</Text>
        </View>
      </View>

      <Text
        style={[styles.announcementTitle, !item.read && styles.unreadTitle]}
      >
        {item.title}
      </Text>

      <Text style={styles.announcementPreview} numberOfLines={2}>
        {item.description}
      </Text>

      <View style={styles.cardFooter}>
        <Text style={styles.authorText}>By {item.author}</Text>
        <View style={styles.footerRight}>
          {item.attachments?.length > 0 && (
            <View style={styles.attachmentIndicator}>
              <Ionicons name="attach" size={16} color="#666666" />
              <Text style={styles.attachmentCount}>
                {item.attachments.length}
              </Text>
            </View>
          )}
          {!item.read && (
            <TouchableOpacity
              onPress={(e) => {
                e.stopPropagation();
                handleMarkAsRead(item.id);
              }}
              style={styles.markReadButton}
            >
              <Text style={styles.markReadText}>Mark Read</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderCategoryFilter = (category) => (
    <TouchableOpacity
      key={category}
      style={[
        styles.categoryFilter,
        selectedCategory === category && styles.activeCategoryFilter,
      ]}
      onPress={() => setSelectedCategory(category)}
    >
      <Text
        style={[
          styles.categoryFilterText,
          selectedCategory === category && styles.activeCategoryFilterText,
        ]}
      >
        {category}
      </Text>
    </TouchableOpacity>
  );

  // ✅ ENHANCED: Pagination controls
  const renderPaginationControls = () => {
    if (totalPages <= 1) return null;

    return (
      <View style={styles.paginationContainer}>
        <TouchableOpacity
          style={[
            styles.paginationButton,
            currentPage === 0 && styles.disabledButton,
          ]}
          onPress={() => setCurrentPage(Math.max(0, currentPage - 1))}
          disabled={currentPage === 0}
        >
          <Text style={styles.paginationText}>Previous</Text>
        </TouchableOpacity>

        <Text style={styles.pageInfo}>
          Page {currentPage + 1} of {totalPages}
        </Text>

        <TouchableOpacity
          style={[
            styles.paginationButton,
            currentPage === totalPages - 1 && styles.disabledButton,
          ]}
          onPress={() =>
            setCurrentPage(Math.min(totalPages - 1, currentPage + 1))
          }
          disabled={currentPage === totalPages - 1}
        >
          <Text style={styles.paginationText}>Next</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const unreadCount = announcements.filter((a) => !a.read).length;

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3498DB" />
        <Text style={styles.loadingText}>Loading announcements...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#333333" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Announcements</Text>
          {unreadCount > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadBadgeText}>{unreadCount}</Text>
            </View>
          )}
        </View>
        <TouchableOpacity style={styles.searchButton}>
          <Ionicons name="search" size={24} color="#333333" />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons
          name="search"
          size={20}
          color="#666666"
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.searchInput}
          placeholder="Search announcements..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity
            onPress={() => setSearchQuery('')}
            style={styles.clearButton}
          >
            <Ionicons name="close-circle" size={20} color="#666666" />
          </TouchableOpacity>
        )}
      </View>

      {/* Category Filters */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoryContainer}
        contentContainerStyle={styles.categoryContent}
      >
        {categories.map(renderCategoryFilter)}
      </ScrollView>

      {/* Announcements List */}
      <FlatList
        data={getPaginatedData()} // ✅ Use paginated data
        renderItem={renderAnnouncementItem}
        keyExtractor={(item) => item.id.toString()}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="megaphone-outline" size={64} color="#CCCCCC" />
            <Text style={styles.emptyTitle}>No announcements found</Text>
            <Text style={styles.emptyText}>
              {searchQuery || selectedCategory !== 'All'
                ? 'Try adjusting your search or filters'
                : 'Check back later for new updates'}
            </Text>
          </View>
        }
        ListFooterComponent={renderPaginationControls} // ✅ Add pagination
      />

      {/* Announcement Detail Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              onPress={() => setModalVisible(false)}
              style={styles.modalCloseButton}
            >
              <Ionicons name="close" size={24} color="#333333" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Announcement Details</Text>
            <View style={styles.modalPlaceholder} />
          </View>

          {selectedAnnouncement && (
            <ScrollView style={styles.modalContent}>
              <View style={styles.modalCardHeader}>
                <View
                  style={[
                    styles.categoryTag,
                    {
                      backgroundColor: getCategoryColor(
                        selectedAnnouncement.category,
                      ),
                    },
                  ]}
                >
                  <Text style={styles.categoryText}>
                    {selectedAnnouncement.category}
                  </Text>
                </View>
                <View
                  style={[
                    styles.priorityIndicator,
                    {
                      backgroundColor: getPriorityColor(
                        selectedAnnouncement.priority,
                      ),
                    },
                  ]}
                />
              </View>

              <Text style={styles.modalAnnouncementTitle}>
                {selectedAnnouncement.title}
              </Text>

              <View style={styles.modalMetadata}>
                <Text style={styles.modalAuthor}>
                  By {selectedAnnouncement.author}
                </Text>
                <Text style={styles.modalDate}>
                  {formatDate(selectedAnnouncement.date)} at{' '}
                  {selectedAnnouncement.time}
                </Text>
              </View>

              <Text style={styles.modalContentText}>
                {selectedAnnouncement.content}
              </Text>

              {selectedAnnouncement.attachments?.length > 0 && (
                <View style={styles.attachmentsSection}>
                  <Text style={styles.attachmentsTitle}>Attachments</Text>
                  {selectedAnnouncement.attachments.map((attachment, index) => (
                    <TouchableOpacity key={index} style={styles.attachmentItem}>
                      <Ionicons
                        name="document-text"
                        size={20}
                        color="#3498DB"
                      />
                      <Text style={styles.attachmentName}>{attachment}</Text>
                      <Ionicons name="download" size={20} color="#3498DB" />
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              {selectedAnnouncement.tags?.length > 0 && (
                <View style={styles.tagsSection}>
                  <Text style={styles.tagsTitle}>Tags</Text>
                  <View style={styles.tagsContainer}>
                    {selectedAnnouncement.tags.map((tag, index) => (
                      <View key={index} style={styles.tag}>
                        <Text style={styles.tagText}>#{tag}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}
            </ScrollView>
          )}
        </View>
      </Modal>
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
    color: '#666666',
    marginTop: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
    paddingTop: 50, // Account for status bar
  },
  backButton: {
    padding: 8,
  },
  headerCenter: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
  },
  unreadBadge: {
    backgroundColor: '#E74C3C',
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  unreadBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  searchButton: {
    padding: 8,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333333',
  },
  clearButton: {
    padding: 4,
  },
  categoryContainer: {
    marginBottom: 16,
  },
  categoryContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  categoryFilter: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  activeCategoryFilter: {
    backgroundColor: '#3498DB',
    borderColor: '#3498DB',
  },
  categoryFilterText: {
    fontSize: 14,
    color: '#666666',
    fontWeight: '500',
  },
  activeCategoryFilterText: {
    color: '#FFFFFF',
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 32,
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
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  priorityIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  headerRight: {
    alignItems: 'flex-end',
  },
  dateText: {
    fontSize: 12,
    color: '#666666',
    fontWeight: '500',
  },
  timeText: {
    fontSize: 10,
    color: '#999999',
    marginTop: 2,
  },
  announcementTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 8,
    lineHeight: 22,
  },
  unreadTitle: {
    color: '#2C3E50',
  },
  announcementPreview: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
    marginBottom: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  authorText: {
    fontSize: 12,
    color: '#999999',
    fontStyle: 'italic',
  },
  footerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  attachmentIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
  },
  attachmentCount: {
    fontSize: 12,
    color: '#666666',
    marginLeft: 4,
  },
  markReadButton: {
    backgroundColor: '#43A047',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  markReadText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '500',
  },
  // ✅ ENHANCED: Pagination styles (from your web version)
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  paginationButton: {
    backgroundColor: '#3498DB',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    marginHorizontal: 8,
  },
  disabledButton: {
    backgroundColor: '#BDC3C7',
  },
  paginationText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  pageInfo: {
    fontSize: 14,
    color: '#666666',
    marginHorizontal: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 64,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666666',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#999999',
    textAlign: 'center',
    lineHeight: 20,
  },
  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
    paddingTop: 50,
  },
  modalCloseButton: {
    padding: 8,
  },
  modalTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    textAlign: 'center',
  },
  modalPlaceholder: {
    width: 40,
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  modalCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalAnnouncementTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
    lineHeight: 28,
    marginBottom: 12,
  },
  modalMetadata: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  modalAuthor: {
    fontSize: 14,
    color: '#666666',
    fontWeight: '500',
  },
  modalDate: {
    fontSize: 12,
    color: '#999999',
  },
  modalContentText: {
    fontSize: 16,
    color: '#333333',
    lineHeight: 24,
    marginBottom: 24,
  },
  attachmentsSection: {
    marginTop: 24,
    marginBottom: 24,
  },
  attachmentsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 12,
  },
  attachmentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  attachmentName: {
    flex: 1,
    fontSize: 14,
    color: '#333333',
    marginLeft: 8,
  },
  tagsSection: {
    marginTop: 24,
  },
  tagsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 12,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tagText: {
    fontSize: 12,
    color: '#3498DB',
    fontWeight: '500',
  },
});

export default StudentAnnouncements;
