import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const Auth: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [dailyCalorieLimit, setDailyCalorieLimit] = useState(2000);
  const [error, setError] = useState<string | null>(null);

  const { login, signup, loading } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      if (isLogin) {
        await login(username, password);
      } else {
        await signup(username, password, dailyCalorieLimit);
      }
    } catch (err: any) {
      console.error('Auth error:', err);
      setError(err.response?.data?.detail || 'An unexpected error occurred.');
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
      <h2>{isLogin ? 'ログイン' : '新規登録'}</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="username" style={{ display: 'block', marginBottom: '5px' }}>ユーザー名:</label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box', borderRadius: '4px', border: '1px solid #ddd' }}
          />
        </div>
        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="password" style={{ display: 'block', marginBottom: '5px' }}>パスワード:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box', borderRadius: '4px', border: '1px solid #ddd' }}
          />
        </div>
        {!isLogin && (
          <div style={{ marginBottom: '15px' }}>
            <label htmlFor="dailyCalorieLimit" style={{ display: 'block', marginBottom: '5px' }}>1日の目標カロリー:</label>
            <input
              type="number"
              id="dailyCalorieLimit"
              value={dailyCalorieLimit}
              onChange={(e) => setDailyCalorieLimit(parseInt(e.target.value))}
              required
              min="1"
              style={{ width: '100%', padding: '8px', boxSizing: 'border-box', borderRadius: '4px', border: '1px solid #ddd' }}
            />
          </div>
        )}
        <button type="submit" disabled={loading} style={{ width: '100%', padding: '10px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          {loading ? '処理中...' : (isLogin ? 'ログイン' : '新規登録')}
        </button>
      </form>
      <p style={{ textAlign: 'center', marginTop: '20px' }}>
        {isLogin ? 'アカウントをお持ちでないですか？' : 'すでにアカウントをお持ちですか？'}
        <button
          onClick={() => setIsLogin(!isLogin)}
          style={{ background: 'none', border: 'none', color: '#007bff', cursor: 'pointer', textDecoration: 'underline', marginLeft: '5px' }}
        >
          {isLogin ? '新規登録' : 'ログイン'}
        </button>
      </p>
    </div>
  );
};

export default Auth;
