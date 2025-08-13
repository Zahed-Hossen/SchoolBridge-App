import React, { createContext, useContext, useState, useEffect } from 'react';
import RoleService from '../services/RoleService';
import { useTenant } from './TenantContext';
import { useAuth } from './AuthContext';

const RoleContext = createContext();

export const useRole = () => {
  const context = useContext(RoleContext);
  if (!context) {
    throw new Error('useRole must be used within a RoleProvider');
  }
  return context;
};

export const RoleProvider = ({ children }) => {
  const { user, role: authRole } = useAuth();
  const { tenantFeatures } = useTenant();

  const [currentRole, setCurrentRole] = useState(null);
  const [permissions, setPermissions] = useState([]);
  const [navigation, setNavigation] = useState([]);
  const [dashboardWidgets, setDashboardWidgets] = useState([]);
  const [roleTheme, setRoleTheme] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  // 🎭 Update role data when auth role or tenant features change
  useEffect(() => {
    if (authRole) {
      updateRoleData(authRole);
    } else {
      clearRoleData();
    }
  }, [authRole, tenantFeatures]);

  // ✅ FIXED: Update the updateRoleData function with correct method calls
  const updateRoleData = (role) => {
    if (!role) {
      clearRoleData();
      return;
    }

    console.log('🎭 Updating role data for:', role);

    try {
      // ✅ FIXED: Get permissions from RoleService
      const rolePermissions = RoleService.getRolePermissions(role, tenantFeatures);
      console.log('🔑 Role permissions assigned:', rolePermissions);

      setCurrentRole(role);
      setPermissions(rolePermissions); // ✅ This should not be empty now

      // ✅ FIXED: Set navigation based on role (correct method call)
      const roleNavigation = RoleService.getRoleNavigation(role, tenantFeatures);
      setNavigation(roleNavigation);

      // ✅ FIXED: Set dashboard widgets (correct method call)
      const widgets = RoleService.getRoleDashboardWidgets(role, tenantFeatures);
      setDashboardWidgets(widgets);

      // ✅ FIXED: Set role theme (correct method call)
      const theme = RoleService.getRoleTheme(role);
      setRoleTheme(theme);

      setIsLoading(false);

      console.log('✅ Role data updated:', {
        role,
        permissionsCount: rolePermissions.length,
        permissions: rolePermissions,
        navigationCount: roleNavigation.length,
        widgetsCount: widgets.length,
        theme: theme,
      });
    } catch (error) {
      console.error('❌ Error updating role data:', error);
      clearRoleData();
    }
  };

  const clearRoleData = () => {
    setCurrentRole(null);
    setPermissions([]);
    setNavigation([]);
    setDashboardWidgets([]);
    setRoleTheme({});
    setIsLoading(false);
  };

  const hasPermission = (permission) => {
    if (!currentRole || !permission) return false;
    return RoleService.hasPermission(currentRole, permission, tenantFeatures);
  };

  const hasFeatureAccess = (feature) => {
    if (!currentRole || !feature) return false;
    return RoleService.getFeatureAccess(currentRole, feature, tenantFeatures);
  };

  const getRoleDisplayName = (role = currentRole) => {
    return RoleService.ROLE_METADATA[role]?.displayName || role;
  };

  const getRoleIcon = (role = currentRole) => {
    return RoleService.ROLE_METADATA[role]?.icon || '👤';
  };

  const canAccessScreen = (screenName) => {
    return navigation.some(nav => nav.screen === screenName);
  };

  const getNavigationByCategory = (category) => {
    return navigation.filter(nav => nav.category === category);
  };

  const value = {
    // State
    currentRole,
    permissions,
    navigation,
    dashboardWidgets,
    roleTheme,
    isLoading,

    // Methods
    hasPermission,
    hasFeatureAccess,
    getRoleDisplayName,
    getRoleIcon,
    canAccessScreen,
    getNavigationByCategory,
    updateRoleData,
    clearRoleData,

    // Constants
    ROLES: RoleService.ROLES,
    PERMISSIONS: RoleService.PERMISSIONS,
    ROLE_METADATA: RoleService.ROLE_METADATA,

    // Computed values
    isAdmin: currentRole === RoleService.ROLES.ADMIN,
    isTeacher: currentRole === RoleService.ROLES.TEACHER,
    isStudent: currentRole === RoleService.ROLES.STUDENT,
    isParent: currentRole === RoleService.ROLES.PARENT,
    roleColor: roleTheme?.primary || '#3498DB',
  };

  return (
    <RoleContext.Provider value={value}>
      {children}
    </RoleContext.Provider>
  );
};

export { RoleContext };
