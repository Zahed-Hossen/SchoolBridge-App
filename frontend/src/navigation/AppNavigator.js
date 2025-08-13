import React, { useEffect } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { useAuth } from '../context/AuthContext';
import { useRole } from '../context/RoleContext';

// Import your navigators
import AuthStackNavigator from './AuthNavigator';
import StudentTabNavigator from './student/StudentNavigator';
import TeacherTabNavigator from './teacher/TeacherNavigator';
import ParentTabNavigator from './parent/ParentNavigator';
import AdminTabNavigator from './admin/AdminNavigator';
import RoleSelectionScreen from '../screens/Common/RoleSelectionScreen';

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  const { isAuthenticated, user, isLoading: authLoading } = useAuth();
  const { currentRole, isLoading: roleLoading, setRole } = useRole();

  console.log('🎭 AppNavigator - Auth Status:', {
    isAuthenticated,
    currentRole,
    hasUser: !!user,
    authLoading,
    roleLoading,
    userRole: user?.role,
  });

  useEffect(() => {
    if (isAuthenticated && user?.role && !currentRole && setRole) {
      console.log('🔄 Auto-setting role from user object:', user.role);
      setRole(user.role);
    }
  }, [isAuthenticated, user?.role, currentRole, setRole]);

  if (authLoading || roleLoading) {
    return null;
  }

   if (!isAuthenticated) {
    console.log('🔓 Showing authentication stack');
    return <AuthStackNavigator />;
  }

  // Authenticated user with role - show role-based navigation
  if (isAuthenticated && (currentRole || user?.role)) {
    const userRole = currentRole || user?.role;
    console.log('✅ Showing role-based navigation for:', userRole);

    const normalizedRole = userRole?.toLowerCase().trim();
    console.log('🔄 Normalized role:', normalizedRole, 'from original:', userRole);

    switch (normalizedRole) {
      case 'student':
        console.log('📚 Loading Student Navigator');
        return <StudentTabNavigator />;
      case 'teacher':
        console.log('👩‍🏫 Loading Teacher Navigator');
        return <TeacherTabNavigator />;
      case 'parent':
        console.log('👨‍👩‍👧‍👦 Loading Parent Navigator');
        return <ParentTabNavigator />;
      case 'admin':
      case 'administrator':
        console.log('👨‍💼 Loading Admin Navigator');
        return <AdminTabNavigator />;
      default:
        console.warn('⚠️ Unknown role:', userRole, 'normalized:', normalizedRole, '- falling back to role selection');
        return (
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen
              name="RoleSelection"
              component={RoleSelectionScreen}
              initialParams={{
                error: `Unknown role: ${userRole}`,
                showError: true,
                user: user,
              }}
            />
          </Stack.Navigator>
        );
    }
  }

  // Authenticated user without role - show role selection
  console.log('👤 Authenticated user needs role selection');
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name="RoleSelection"
        component={RoleSelectionScreen}
        options={{
          title: 'Select Your Role',
          headerShown: true,
          headerLeft: () => null,
          gestureEnabled: false,
        }}
        initialParams={{
          user: user,
        }}
      />
    </Stack.Navigator>
  );
};

export default AppNavigator;
