import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TextInput,
  Text,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import SchoolCard from '../../components/SuperAdmin/SchoolCard';
import { BASE_THEME } from '../../constants/theme';

import SimpleHeader from '../../components/navigation/SimpleHeader';

const SchoolsScreen = ({ navigation }) => {
  const styles = getStyles();
  const [searchQuery, setSearchQuery] = useState('');

  const schools = [
    {
      id: 'sch-001',
      name: 'Green Valley School',
      location: 'Dhaka',
      users: 420,
      status: 'Active',
    },
    // Add more schools...
  ];

  const filteredSchools = schools.filter(
    (school) =>
      school.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      school.location.toLowerCase().includes(searchQuery.toLowerCase()),
  );

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

        <FlatList
          data={filteredSchools}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={
            <Text style={styles.resultsText}>
              {filteredSchools.length}{' '}
              {filteredSchools.length === 1 ? 'school' : 'schools'} found
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

        <TouchableOpacity
          style={[
            styles.addButton,
            { backgroundColor: BASE_THEME.colors.primary },
          ]}
          onPress={() => navigation.navigate('AddSchool')}
        >
          <Ionicons name="add" size={24} color="white" />
        </TouchableOpacity>
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
    addButton: {
      position: 'absolute',
      bottom: BASE_THEME.spacing.lg,
      right: BASE_THEME.spacing.lg,
      width: 56,
      height: 56,
      borderRadius: 28,
      justifyContent: 'center',
      alignItems: 'center',
      elevation: 4,
    },
  });

export default SchoolsScreen;
