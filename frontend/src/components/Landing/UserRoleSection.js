import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { COLORS, FONTS, SIZES } from '../../constants/theme';

const userRoles = [
  {
    icon: '🎓',
    role: 'Students',
    description:
      'Access assignments, track progress, and communicate with teachers.',
    color: COLORS.student,
  },
  {
    icon: '👩‍🏫',
    role: 'Teachers',
    description:
      'Manage classes, share resources, and evaluate student performance.',
    color: COLORS.teacher,
  },
  {
    icon: '⚙️',
    role: 'Administrators',
    description: 'Oversee school operations and manage resources efficiently.',
    color: COLORS.admin,
  },
  {
    icon: '👨‍👩‍👧‍👦',
    role: 'Parents',
    description: "Stay informed about your child's activities and progress.",
    color: COLORS.parent,
  },
];

const RoleCard = ({ icon, role, description, color, onPress }) => (
  <TouchableOpacity style={styles.roleCard} onPress={onPress}>
    <Text style={styles.roleIcon}>{icon}</Text>
    <Text style={styles.roleTitle}>{role}</Text>
    <Text style={styles.roleDescription}>{description}</Text>
    <View style={[styles.roleButton, { backgroundColor: color }]}>
      <Text style={styles.roleButtonText}>Learn More</Text>
    </View>
  </TouchableOpacity>
);

const UserRoleSection = ({ onRolePress }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Who We Serve</Text>

      <View style={styles.rolesGrid}>
        {userRoles.map((role, index) => (
          <RoleCard
            key={index}
            icon={role.icon}
            role={role.role}
            description={role.description}
            color={role.color}
            onPress={() => onRolePress && onRolePress(role)}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#c1e5f6',
    paddingVertical: SIZES.padding * 3,
    paddingHorizontal: SIZES.padding,
  },
  sectionTitle: {
    fontSize: SIZES.h1,
    fontFamily: FONTS.bold,
    color: '#135f86',
    textAlign: 'center',
    marginBottom: SIZES.padding * 2,
  },
  rolesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: SIZES.padding,
  },
  roleCard: {
    backgroundColor: '#f2f9fd',
    borderRadius: SIZES.radius,
    padding: SIZES.padding,
    width: '47%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#c1e5f6',
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  roleIcon: {
    fontSize: 50,
    marginBottom: SIZES.padding,
  },
  roleTitle: {
    fontSize: SIZES.h3,
    fontFamily: FONTS.semiBold,
    color: '#155677',
    textAlign: 'center',
    marginBottom: SIZES.base,
  },
  roleDescription: {
    fontSize: SIZES.body3,
    fontFamily: FONTS.regular,
    color: '#174863',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: SIZES.padding,
  },
  roleButton: {
    paddingVertical: SIZES.base,
    paddingHorizontal: SIZES.padding,
    borderRadius: SIZES.radius,
  },
  roleButtonText: {
    fontSize: SIZES.body3,
    fontFamily: FONTS.medium,
    color: COLORS.white,
  },
});

export default UserRoleSection;
