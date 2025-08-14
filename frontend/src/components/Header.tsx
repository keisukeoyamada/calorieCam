import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Header: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <header style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '15px 25px',
      backgroundColor: '#F8F9FA',
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.08)',
      borderBottom: 'none',
    }}>
      <h1 style={{ margin: 0, fontSize: '24px', color: '#3C4043' }}>
        <Link to="/dashboard" style={{ textDecoration: 'none', color: 'inherit' }}>CalorieCam</Link>
      </h1>
      {user && (
        <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
          <Link to="/history" style={{ color: '#4285F4', textDecoration: 'none', fontWeight: 'bold' }}>
            食事履歴
          </Link>
          <span style={{ color: '#5F6368' }}>ようこそ、{user.username}さん！</span>
          <button
            onClick={logout}
            style={{
              padding: '8px 15px',
              backgroundColor: '#EA4335',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
            }}
          >
            ログアウト
          </button>
        </div>
      )}
    </header>
  );
};

export default Header;
