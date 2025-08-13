import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { API_CONFIG } from '../constants/config';

class TenantService {
  constructor() {
    this.currentTenant = null;
    this.tenantConfig = null;
    this.initialized = false;
  }

  // 🏫 Initialize tenant (school) context
  async initializeTenant(schoolId, schoolConfig) {
    try {
      this.currentTenant = schoolId;
      this.tenantConfig = schoolConfig;
      this.initialized = true;

      await AsyncStorage.setItem('currentTenant', schoolId);
      await AsyncStorage.setItem('tenantConfig', JSON.stringify(schoolConfig));

      console.log(`🏫 Tenant initialized: ${schoolConfig.schoolName}`);
      console.log(`🎨 Primary Color: ${schoolConfig.primaryColor}`);
      console.log(`🔧 Features:`, schoolConfig.features);

      return { success: true, tenant: schoolId };
    } catch (error) {
      console.error('❌ Tenant initialization failed:', error);
      throw error;
    }
  }

  // 🔄 Load tenant from storage on app start
  async loadStoredTenant() {
    try {
      const storedTenantId = await AsyncStorage.getItem('currentTenant');
      const storedConfig = await AsyncStorage.getItem('tenantConfig');

      if (storedTenantId && storedConfig) {
        this.currentTenant = storedTenantId;
        this.tenantConfig = JSON.parse(storedConfig);
        this.initialized = true;

        console.log(`🏫 Tenant loaded from storage: ${this.tenantConfig.schoolName}`);
        return { success: true, tenant: storedTenantId };
      } else {
        console.log('ℹ️ No stored tenant found, using default configuration');
        await this.initializeDefaultTenant();
        return { success: true, tenant: 'default' };
      }
    } catch (error) {
      console.error('❌ Failed to load stored tenant:', error);
      await this.initializeDefaultTenant();
      return { success: false, error: error.message };
    }
  }

  // 🎯 Initialize default tenant for development
  async initializeDefaultTenant() {
    const defaultConfig = {
      schoolName: 'SchoolBridge Demo',
      schoolId: 'demo_school_001',
      logo: null,
      primaryColor: '#667eea',
      secondaryColor: '#764ba2',
      apiBaseUrl: API_CONFIG.BASE_URL,
      features: {
        iotIntegration: true,
        resourceSharing: true,
        advancedAnalytics: true,
        multiLanguage: false,
        googleOAuth: true,
        parentPortal: true,
        mobileApp: true,
        realTimeNotifications: true,
      },
      settings: {
        academicYear: '2024-2025',
        timezone: 'UTC',
        currency: 'USD',
        language: 'en',
        dateFormat: 'MM/DD/YYYY',
        gradeScale: 'A-F',
      },
      customization: {
        logoPosition: 'center',
        themeMode: 'light',
        dashboardLayout: 'modern',
        navigationStyle: 'tabs',
      },
      compliance: {
        ferpa: true,
        gdpr: true,
        coppa: true,
        dataRetention: '7years',
      }
    };

    await this.initializeTenant('demo_school_001', defaultConfig);
  }

  // 🔐 Get tenant-specific API endpoints
  getTenantApiEndpoint(endpoint) {
    const baseUrl = this.tenantConfig?.apiBaseUrl || API_CONFIG.BASE_URL;

    if (this.currentTenant && this.currentTenant !== 'demo_school_001') {
      return `${baseUrl}/tenant/${this.currentTenant}/${endpoint}`;
    }

    // For demo/development, use direct endpoints
    return `${baseUrl}/${endpoint}`;
  }

  // 🏷️ Get tenant branding/customization
  getTenantBranding() {
    if (!this.initialized) {
      return this.getDefaultBranding();
    }

    return {
      schoolName: this.tenantConfig?.schoolName || 'SchoolBridge',
      logo: this.tenantConfig?.logo || null,
      primaryColor: this.tenantConfig?.primaryColor || '#667eea',
      secondaryColor: this.tenantConfig?.secondaryColor || '#764ba2',
      customization: this.tenantConfig?.customization || {},
      settings: this.tenantConfig?.settings || {},
    };
  }

  // 🎨 Get default branding for fallback
  getDefaultBranding() {
    return {
      schoolName: 'SchoolBridge',
      logo: null,
      primaryColor: '#667eea',
      secondaryColor: '#764ba2',
      customization: {
        logoPosition: 'center',
        themeMode: 'light',
        dashboardLayout: 'modern',
        navigationStyle: 'tabs',
      },
      settings: {
        academicYear: '2024-2025',
        timezone: 'UTC',
        currency: 'USD',
        language: 'en',
        dateFormat: 'MM/DD/YYYY',
        gradeScale: 'A-F',
      },
    };
  }

  // 📊 Get tenant-specific features
  getTenantFeatures() {
    if (!this.initialized) {
      return this.getDefaultFeatures();
    }

    return {
      iotIntegration: this.tenantConfig?.features?.iotIntegration || false,
      resourceSharing: this.tenantConfig?.features?.resourceSharing || false,
      advancedAnalytics: this.tenantConfig?.features?.advancedAnalytics || false,
      multiLanguage: this.tenantConfig?.features?.multiLanguage || false,
      googleOAuth: this.tenantConfig?.features?.googleOAuth || true,
      parentPortal: this.tenantConfig?.features?.parentPortal || true,
      mobileApp: this.tenantConfig?.features?.mobileApp || true,
      realTimeNotifications: this.tenantConfig?.features?.realTimeNotifications || true,
    };
  }

  // 🔧 Get default features for fallback
  getDefaultFeatures() {
    return {
      iotIntegration: true,
      resourceSharing: true,
      advancedAnalytics: true,
      multiLanguage: false,
      googleOAuth: true,
      parentPortal: true,
      mobileApp: true,
      realTimeNotifications: true,
    };
  }

  // 🌐 Check if inter-school collaboration is enabled
  isResourceSharingEnabled() {
    return this.tenantConfig?.features?.resourceSharing === true;
  }

  // 📱 Check if feature is enabled for current tenant
  isFeatureEnabled(featureName) {
    const features = this.getTenantFeatures();
    return features[featureName] === true;
  }

  // 🔒 Validate tenant access
  async validateTenantAccess(userId, role) {
    try {
      // For demo tenant, always allow access
      if (this.currentTenant === 'demo_school_001') {
        return {
          success: true,
          message: 'Demo tenant access granted',
          permissions: this.getDefaultPermissions(role)
        };
      }

      const response = await fetch(this.getTenantApiEndpoint('validate-access'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, role, tenantId: this.currentTenant })
      });

      return await response.json();
    } catch (error) {
      console.error('❌ Tenant access validation failed:', error);
      return { success: false, error: error.message };
    }
  }

  // 👥 Get default permissions for demo
  getDefaultPermissions(role) {
    const permissions = {
      admin: ['all'],
      teacher: ['manage_classes', 'grade_students', 'view_analytics'],
      student: ['view_grades', 'submit_assignments', 'view_schedule'],
      parent: ['view_child_data', 'communicate_teachers', 'make_payments']
    };

    return permissions[role?.toLowerCase()] || [];
  }

  // ⚙️ Get tenant settings
  getTenantSettings() {
    if (!this.initialized) {
      return this.getDefaultBranding().settings;
    }

    return this.tenantConfig?.settings || this.getDefaultBranding().settings;
  }

  // 🏫 Get current tenant info
  getCurrentTenant() {
    return {
      id: this.currentTenant,
      config: this.tenantConfig,
      initialized: this.initialized,
      branding: this.getTenantBranding(),
      features: this.getTenantFeatures(),
      settings: this.getTenantSettings(),
    };
  }

  // 🔄 Switch tenant (for multi-tenant admin users)
  async switchTenant(newTenantId, newTenantConfig) {
    try {
      console.log(`🔄 Switching from ${this.currentTenant} to ${newTenantId}`);

      await this.initializeTenant(newTenantId, newTenantConfig);

      console.log(`✅ Successfully switched to tenant: ${newTenantConfig.schoolName}`);
      return { success: true, tenant: newTenantId };
    } catch (error) {
      console.error('❌ Failed to switch tenant:', error);
      return { success: false, error: error.message };
    }
  }

  // 🧹 Clear tenant data
  async clearTenantData() {
    try {
      await AsyncStorage.multiRemove(['currentTenant', 'tenantConfig']);

      this.currentTenant = null;
      this.tenantConfig = null;
      this.initialized = false;

      console.log('🧹 Tenant data cleared');
      return { success: true };
    } catch (error) {
      console.error('❌ Failed to clear tenant data:', error);
      return { success: false, error: error.message };
    }
  }

  // 🔍 Debug tenant information
  debugTenantInfo() {
    const info = {
      currentTenant: this.currentTenant,
      initialized: this.initialized,
      schoolName: this.tenantConfig?.schoolName,
      features: this.getTenantFeatures(),
      branding: this.getTenantBranding(),
      apiEndpoint: this.getTenantApiEndpoint('test'),
    };

    console.log('🔍 Tenant Debug Info:', info);
    return info;
  }
}

export default new TenantService();
