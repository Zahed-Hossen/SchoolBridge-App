import React, { createContext, useContext, useState, useEffect } from 'react';
import TenantService from '../services/TenantService';

const TenantContext = createContext();

export const useTenant = () => {
  const context = useContext(TenantContext);
  if (!context) {
    throw new Error('useTenant must be used within a TenantProvider');
  }
  return context;
};

export const TenantProvider = ({ children }) => {
  const [tenantConfig, setTenantConfig] = useState(null);
  const [tenantFeatures, setTenantFeatures] = useState({});
  const [tenantBranding, setTenantBranding] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // 🏫 Initialize tenant on app start
  useEffect(() => {
    initializeTenant();
  }, []);

  const initializeTenant = async () => {
    try {
      setIsLoading(true);
      setError(null);

      console.log('🏫 Initializing tenant context...');

      // Load stored tenant or initialize default
      const result = await TenantService.loadStoredTenant();

      if (result.success) {
        updateTenantData();
        console.log('✅ Tenant context initialized successfully');
      } else {
        throw new Error(result.error || 'Failed to initialize tenant');
      }
    } catch (error) {
      console.error('❌ Tenant initialization error:', error);
      setError(error.message);
      // Still load default values
      updateTenantData();
    } finally {
      setIsLoading(false);
    }
  };

  const updateTenantData = () => {
    const config = TenantService.getCurrentTenant();
    setTenantConfig(config.config);
    setTenantFeatures(config.features);
    setTenantBranding(config.branding);
  };

  const switchTenant = async (newTenantId, newTenantConfig) => {
    try {
      setIsLoading(true);
      const result = await TenantService.switchTenant(newTenantId, newTenantConfig);

      if (result.success) {
        updateTenantData();
        console.log(`✅ Switched to tenant: ${newTenantConfig.schoolName}`);
        return { success: true };
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('❌ Tenant switch error:', error);
      setError(error.message);
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  const getTenantApiEndpoint = (endpoint) => {
    return TenantService.getTenantApiEndpoint(endpoint);
  };

  const isFeatureEnabled = (featureName) => {
    return TenantService.isFeatureEnabled(featureName);
  };

  const clearTenantData = async () => {
    try {
      await TenantService.clearTenantData();
      setTenantConfig(null);
      setTenantFeatures({});
      setTenantBranding({});
      console.log('🧹 Tenant context cleared');
    } catch (error) {
      console.error('❌ Failed to clear tenant context:', error);
    }
  };

  const value = {
    // State
    tenantConfig,
    tenantFeatures,
    tenantBranding,
    isLoading,
    error,

    // Methods
    initializeTenant,
    switchTenant,
    getTenantApiEndpoint,
    isFeatureEnabled,
    clearTenantData,
    updateTenantData,

    // Computed values
    schoolName: tenantBranding?.schoolName || 'SchoolBridge',
    primaryColor: tenantBranding?.primaryColor || '#667eea',
    secondaryColor: tenantBranding?.secondaryColor || '#764ba2',
    isResourceSharingEnabled: tenantFeatures?.resourceSharing || false,
    isIoTEnabled: tenantFeatures?.iotIntegration || false,
    isAdvancedAnalyticsEnabled: tenantFeatures?.advancedAnalytics || false,
  };

  return (
    <TenantContext.Provider value={value}>
      {children}
    </TenantContext.Provider>
  );
};

export { TenantContext };
