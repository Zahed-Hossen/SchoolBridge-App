import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import { useRole } from '../context/RoleContext';
import { useTenant } from '../context/TenantContext';

const PlaceholderScreen = ({
  title = 'Coming Soon',
  subtitle = 'This screen will be implemented next',
  icon = 'construct',
  features = [],
  estimatedCompletion = 'Phase 3',
  route
}) => {
  const { currentRole, roleTheme } = useRole();
  const { tenantBranding } = useTenant();

  // Get title from route params if provided
  const screenTitle = route?.params?.title || title;

  // Get role-specific color
  const primaryColor = roleTheme?.primary || tenantBranding?.primaryColor || '#667eea';
  const secondaryColor = roleTheme?.secondary || tenantBranding?.secondaryColor || '#764ba2';

  // Default features based on screen title
  const getDefaultFeatures = () => {
    if (screenTitle.includes('Assignment')) {
      return ['📝 Create & manage assignments', '📊 Track submission status', '💬 Provide feedback', '📁 File attachments support'];
    }
    if (screenTitle.includes('Grade')) {
      return ['🎯 View grade analytics', '📈 Progress tracking', '📊 Performance reports', '🏆 Achievement tracking'];
    }
    if (screenTitle.includes('Attendance')) {
      return ['📅 Daily attendance tracking', '📊 Attendance analytics', '🔔 Absence notifications', '📈 Attendance reports'];
    }
    if (screenTitle.includes('Dashboard')) {
      return ['📊 Real-time data overview', '📈 Performance metrics', '🔔 Important notifications', '🎯 Quick actions'];
    }
    if (screenTitle.includes('Profile')) {
      return ['👤 Personal information', '📸 Profile photo upload', '⚙️ Account settings', '🔐 Privacy controls'];
    }
    return ['🚀 Modern, intuitive design', '📱 Mobile-optimized interface', '🔄 Real-time updates', '🎨 Customizable views'];
  };

  const screenFeatures = features.length > 0 ? features : getDefaultFeatures();

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header Gradient */}
      <LinearGradient
        colors={[primaryColor, secondaryColor]}
        style={styles.header}
      >
        <Ionicons name={icon} size={64} color="#FFFFFF" />
        <Text style={styles.headerTitle}>{screenTitle}</Text>
        <Text style={styles.headerSubtitle}>{subtitle}</Text>

        {/* Role Badge */}
        <View style={styles.roleBadge}>
          <Text style={styles.roleBadgeText}>
            {currentRole?.toUpperCase()} SECTION
          </Text>
        </View>
      </LinearGradient>

      {/* Content */}
      <View style={styles.content}>
        {/* Status Card */}
        <View style={styles.statusCard}>
          <View style={styles.statusHeader}>
            <Ionicons name="time" size={24} color={primaryColor} />
            <Text style={styles.statusTitle}>Development Status</Text>
          </View>
          <Text style={styles.statusText}>
            This feature is currently in development and will be available in {estimatedCompletion}.
          </Text>
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <LinearGradient
                colors={[primaryColor, secondaryColor]}
                style={[styles.progressFill, { width: '25%' }]}
              />
            </View>
            <Text style={styles.progressText}>25% Complete</Text>
          </View>
        </View>

        {/* Features Preview */}
        <View style={styles.featuresCard}>
          <Text style={styles.featuresTitle}>✨ Planned Features</Text>
          {screenFeatures.map((feature, index) => (
            <View key={index} style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={20} color="#27AE60" />
              <Text style={styles.featureText}>{feature}</Text>
            </View>
          ))}
        </View>

        {/* Actions */}
        <View style={styles.actionsCard}>
          <Text style={styles.actionsTitle}>🚀 What's Next?</Text>

          <TouchableOpacity
            style={[styles.actionButton, { borderColor: primaryColor }]}
            onPress={() => console.log('🔔 User requested notification for:', screenTitle)}
          >
            <Ionicons name="notifications-outline" size={20} color={primaryColor} />
            <Text style={[styles.actionButtonText, { color: primaryColor }]}>
              Notify When Ready
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, { borderColor: primaryColor }]}
            onPress={() => console.log('💡 User provided feedback for:', screenTitle)}
          >
            <Ionicons name="bulb-outline" size={20} color={primaryColor} />
            <Text style={[styles.actionButtonText, { color: primaryColor }]}>
              Suggest Features
            </Text>
          </TouchableOpacity>
        </View>

        {/* Footer Info */}
        <View style={styles.footerInfo}>
          <Text style={styles.footerText}>
            🏫 {tenantBranding?.schoolName || 'SchoolBridge'} - {currentRole} Portal
          </Text>
          <Text style={styles.footerSubtext}>
            Building the future of education management
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFB',
  },
  header: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
    paddingTop: 60,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    marginBottom: 20,
  },
  roleBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  roleBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  content: {
    padding: 20,
    marginTop: -20,
  },
  statusCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A202C',
    marginLeft: 12,
  },
  statusText: {
    fontSize: 14,
    color: '#4A5568',
    lineHeight: 20,
    marginBottom: 16,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#E2E8F0',
    borderRadius: 4,
    overflow: 'hidden',
    marginRight: 12,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#718096',
  },
  featuresCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  featuresTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A202C',
    marginBottom: 16,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureText: {
    fontSize: 14,
    color: '#4A5568',
    marginLeft: 12,
    flex: 1,
  },
  actionsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A202C',
    marginBottom: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  footerInfo: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 40,
  },
  footerText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4A5568',
    textAlign: 'center',
  },
  footerSubtext: {
    fontSize: 12,
    color: '#A0AEC0',
    textAlign: 'center',
    marginTop: 4,
  },
});

export default PlaceholderScreen;
