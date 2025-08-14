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
      padding: '10px 20px',
      backgroundColor: '#f8f8f8',
      borderBottom: '1px solid #eee',
      boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
    }}>
      <h1 style={{ margin: 0, fontSize: '24px', color: '#333' }}>
        <Link to="/dashboard" style={{ textDecoration: 'none', color: 'inherit' }}>CalorieCam</Link>
      </h1>
      {user && (
        <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}>
          <Link to="/history" style={{ marginRight: '15px', color: '#007bff', textDecoration: 'none' }}>食事履歴</Link>
          <span style={{ marginRight: '15px', color: '#555' }}>ようこそ、{user.username}さん！</span>
          <button
            onClick={logout}
            style={{
              padding: '8px 15px',
              backgroundColor: '#dc3545',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px'
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
