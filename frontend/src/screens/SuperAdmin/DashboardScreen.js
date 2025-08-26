
import React from 'react';
import { View } from 'react-native';
import AppHeader from '../../components/navigation/AppHeader';

const DashboardScreen = () => {
  return (
    <View style={{ flex: 1 }}>
      <AppHeader
        title="Dashboard"
        subtitle="Welcome back, Admin"
        userRole="Admin"
      />

      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>

        <></>
      </View>
    </View>
  );
};

export default DashboardScreen;
