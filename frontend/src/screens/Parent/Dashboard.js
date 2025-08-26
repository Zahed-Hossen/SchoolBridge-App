import React from 'react';
import PlaceholderScreen from '../../components/PlaceholderScreen';

const Dashboard = (props) => {
  return (
    <PlaceholderScreen
      title="Parent Dashboard"
      subtitle="Your dashboard is coming soon!"
      icon="speedometer"
      estimatedCompletion="Phase 2"
      route={props.route}
    />
  );
};

export default Dashboard;
