import React from 'react';
import CreateNewMap from './CreateNewMap';
import OngoingExpeditions from './OngoingExpeditions';

const Dashboard: React.FC = () => {
  return (
    <div className="min-h-screen bg-nexus-dark">
      <div className="container mx-auto px-6 py-12 space-y-20">
        <CreateNewMap />
        <OngoingExpeditions />
      </div>
    </div>
  );
};

export default Dashboard;