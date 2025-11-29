import React from 'react';
import { ConfigProvider, useConfig } from './contexts/ConfigContext';
import PublicPage from './components/PublicPage';
import AdminPanel from './components/AdminPanel';

const AppContent: React.FC = () => {
  const { isAdmin } = useConfig();

  return (
    <div className="relative overflow-x-hidden">
      <PublicPage />
      {isAdmin && <AdminPanel />}
    </div>
  );
};

import ErrorBoundary from './components/ErrorBoundary';

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <ConfigProvider>
        <AppContent />
      </ConfigProvider>
    </ErrorBoundary>
  );
};

export default App;
