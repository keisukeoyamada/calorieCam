import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Auth from './components/Auth';
import Dashboard from './components/Dashboard';
import Header from './components/Header';

const AppContent: React.FC = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div style={{ textAlign: 'center', marginTop: '50px' }}>読み込み中...</div>;
  }

  return (
    <>
      <Header />
      <main>
        <Routes>
          <Route path="/login" element={isAuthenticated ? <Navigate to="/" /> : <Auth />} />
          <Route path="/" element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" />} />
          <Route path="*" element={<Navigate to="/" />} /> {/* 未知のパスはリダイレクト */}
        </Routes>
      </main>
    </>
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
};

export default App;