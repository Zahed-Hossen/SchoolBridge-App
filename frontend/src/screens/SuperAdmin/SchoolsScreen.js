import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  TextInput,
  Text,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import SchoolCard from '../../components/SuperAdmin/SchoolCard';
import { BASE_THEME } from '../../constants/theme';
import { apiCall } from '../../api/client';
import SimpleHeader from '../../components/navigation/SimpleHeader';

const SchoolsScreen = ({ navigation }) => {
  const styles = getStyles();
  const [searchQuery, setSearchQuery] = useState('');
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch schools function for refresh
  const fetchSchools = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await apiCall('GET', '/schools');
      if (data && data.schools) {
        setSchools(data.schools);
      } else {
        setSchools([]);
      }
    } catch (err) {
      setError('Failed to load schools');
      setSchools([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchools();
  }, []);

  // Map backend school data to SchoolCard props
  const mappedSchools = schools.map((school) => {
    let status = 'Active';
    if (school.isActive === false) status = 'Suspended';
    if (typeof school.isActive === 'undefined') status = 'Active';
    return {
      ...school,
      location: school.address?.city || 'N/A',
      users: typeof school.usersCount === 'number' ? school.usersCount : 0,
      status,
    };
  });

  const filteredSchools = mappedSchools.filter(
    (school) =>
      school.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (school.location || '').toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const showFiltered = searchQuery.length > 0;

  return (
    <View style={styles.container}>
      {/* Fixed Header */}
      <View style={styles.headerWrapper}>
        <SimpleHeader
          title="Schools"
          userRole="Admin"
          navigation={navigation}
          primaryColor="#2563EB"
          style={{ alignItems: 'center', justifyContent: 'center' }}
          rightAction={
            <TouchableOpacity
              onPress={() =>
                navigation
                  .getParent()
                  ?.navigate('AddSchool', { onSchoolAdded: fetchSchools })
              }
              style={{ padding: 2 }}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons name="add" size={28} color="purple" />
            </TouchableOpacity>
          }
        />
      </View>
      <View style={{ paddingTop: 80 }}>
        <View style={styles.searchContainer}>
          <Ionicons
            name="search"
            size={20}
            color={BASE_THEME.colors.text.secondary}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Search schools..."
            placeholderTextColor={BASE_THEME.colors.text.secondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Schools List: show all if no search, filtered if searching */}
        {loading ? (
          <View style={styles.emptyContainer}>
            <Text>Loading schools...</Text>
          </View>
        ) : error ? (
          <View style={styles.emptyContainer}>
            <Text style={{ color: 'red' }}>{error}</Text>
          </View>
        ) : (
          <FlatList
            data={showFiltered ? filteredSchools : mappedSchools}
            keyExtractor={(item) => item._id}
            contentContainerStyle={styles.listContent}
            ListHeaderComponent={
              <Text style={styles.resultsText}>
                {showFiltered
                  ? `${filteredSchools.length} result${
                      filteredSchools.length === 1 ? '' : 's'
                    } found`
                  : `${mappedSchools.length} school${
                      mappedSchools.length === 1 ? '' : 's'
                    } in database`}
              </Text>
            }
            renderItem={({ item }) => (
              <SchoolCard
                school={item}
                onPress={() =>
                  navigation.navigate('SchoolDetails', { school: item })
                }
              />
            )}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Ionicons
                  name="school"
                  size={48}
                  color={BASE_THEME.colors.text.secondary}
                />
                <Text style={styles.emptyText}>No schools found</Text>
              </View>
            }
          />
        )}
      </View>
    </View>
  );
};

const getStyles = () =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: BASE_THEME.colors.background.primary,
      padding: BASE_THEME.spacing.md,
    },
    headerWrapper: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 10,
      alignItems: 'center',
      justifyContent: 'center',
    },
    searchContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: BASE_THEME.colors.card,
      borderRadius: BASE_THEME.borderRadius.md,
      paddingHorizontal: BASE_THEME.spacing.md,
      paddingVertical: BASE_THEME.spacing.sm,
      marginBottom: BASE_THEME.spacing.md,
    },
    searchInput: {
      flex: 1,
      marginLeft: BASE_THEME.spacing.sm,
      color: BASE_THEME.colors.text.primary,
      fontSize: BASE_THEME.fonts.sizes.body2,
    },
    listContent: {
      paddingBottom: BASE_THEME.spacing.lg,
    },
    resultsText: {
      color: BASE_THEME.colors.text.secondary,
      marginBottom: BASE_THEME.spacing.sm,
      fontSize: BASE_THEME.fonts.sizes.body3,
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: BASE_THEME.spacing.xl,
    },
    emptyText: {
      marginTop: BASE_THEME.spacing.md,
      color: BASE_THEME.colors.text.secondary,
      fontSize: BASE_THEME.fonts.sizes.body2,
    },
  });

export default SchoolsScreen;
