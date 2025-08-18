import React from 'react';
import ScreenHeader from '../components/navigation/ScreenHeader';

export function getInfoScreenOptions({ title, navigation, gradientColors }) {
  return {
    headerShown: true,
    header: (props) => (
      <ScreenHeader
        {...props}
        title={title}
        showBackButton={true}
        onBackPress={() => navigation.goBack()}
        primaryColor="#7b2ff2"
        gradientColors={gradientColors || ['#7b2ff2', '#f357a8']}
        backButtonStyle={{ backgroundColor: '#7b2ff2' }}
      />
    ),
  };
}
