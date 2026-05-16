import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import ContactsView from './components/ContactsView';
import LoginPage from './pages/LoginPage';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  return isAuthenticated ? <Layout>{children}</Layout> : <Navigate to="/login" />;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard data={{
                totalContacts: 156,
                totalDeals: 42,
                activeDealsValue: 1250000,
                winRate: 38.5,
                stageData: [
                  { name: 'Prospecting', value: 12 },
                  { name: 'Qualification', value: 18 },
                  { name: 'Negotiation', value: 8 },
                  { name: 'Closed Won', value: 4 },
                ],
                revenueData: [
                  { name: 'Jan', value: 85000 },
                  { name: 'Feb', value: 92000 },
                  { name: 'Mar', value: 78000 },
                ],
              }} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/contacts"
          element={
            <ProtectedRoute>
              <ContactsView />
            </ProtectedRoute>
          }
        />
        <Route path="/" element={<Navigate to="/dashboard" />} />
      </Routes>
    </Router>
  );
}

export default App;
