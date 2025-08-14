import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { users, meals } from '../services/api';
import MealUpload from './MealUpload';
import MealList from './MealList';

interface Meal {
  id: number;
  meal_type: 'breakfast' | 'lunch' | 'dinner';
  description: string;
  calories: number;
  image_path: string;
  created_at: string;
}

const Dashboard: React.FC = () => {
  const { user, fetchUser } = useAuth();
  const [dailyCalorieLimit, setDailyCalorieLimit] = useState(user?.daily_calorie_limit || 2000);
  const [isEditingLimit, setIsEditingLimit] = useState(false);
  const [todayMeals, setTodayMeals] = useState<Meal[]>([]);
  const [loadingMeals, setLoadingMeals] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const totalCaloriesToday = todayMeals.reduce((sum, meal) => sum + meal.calories, 0);
  const remainingCalories = dailyCalorieLimit - totalCaloriesToday;

  const fetchTodayMeals = async () => {
    setLoadingMeals(true);
    setError(null);
    try {
      const response = await meals.getTodayMeals();
      setTodayMeals(response.data);
    } catch (err: any) {
      console.error('Failed to fetch today\'s meals:', err);
      setError(err.response?.data?.detail || '今日の食事の取得に失敗しました。');
    } finally {
      setLoadingMeals(false);
    }
  };

  useEffect(() => {
    if (user) {
      setDailyCalorieLimit(user.daily_calorie_limit);
      fetchTodayMeals();
    }
  }, [user]);

  const handleUpdateLimit = async () => {
    setError(null);
    try {
      await users.updateMe(dailyCalorieLimit);
      await fetchUser(); // コンテキストのユーザーデータを更新
      setIsEditingLimit(false);
    } catch (err: any) {
      console.error('Failed to update calorie limit:', err);
      setError(err.response?.data?.detail || 'カロリー上限の更新に失敗しました。');
    }
  };

  const handleMealDeleted = (mealId: number) => {
    setTodayMeals(prevMeals => prevMeals.filter(meal => meal.id !== mealId));
  };

  const today = new Date();
  const formattedDate = today.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });

  return (
    <div style={{
      padding: '20px',
      width: '90%',
      margin: '20px auto',
      backgroundColor: '#F8F9FA',
      borderRadius: '8px',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
      boxSizing: 'border-box'
    }}>
      <h2 style={{ textAlign: 'center', color: '#3C4043', marginBottom: '30px' }}>
        今日のダッシュボード（{formattedDate}）
      </h2>

      <div style={{ display: 'flex', justifyContent: 'space-around', marginBottom: '30px', flexWrap: 'wrap', gap: '20px' }}>
        <div style={{
          textAlign: 'center',
          padding: '20px',
          backgroundColor: 'white',
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
          minWidth: '180px',
          flex: 1,
          margin: '0'
        }}>
          <h3 style={{ color: '#4285F4', margin: '0 0 15px 0' }}>目標カロリー</h3>
          {isEditingLimit ? (
            <div>
              <input
                type="number"
                value={dailyCalorieLimit}
                onChange={(e) => setDailyCalorieLimit(parseInt(e.target.value))}
                style={{
                  width: '100px',
                  padding: '8px',
                  borderRadius: '4px',
                  border: '1px solid #E0E0E0',
                  boxSizing: 'border-box'
                }}
              /> kcal
              <button onClick={handleUpdateLimit} style={{
                marginLeft: '10px',
                padding: '8px 15px',
                backgroundColor: '#34A853',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
              }}>保存</button>
            </div>
          ) : (
            <p style={{ fontSize: '28px', fontWeight: 'bold', color: '#3C4043' }}>
              {dailyCalorieLimit} kcal
              <button onClick={() => setIsEditingLimit(true)} style={{
                marginLeft: '10px',
                padding: '8px 15px',
                backgroundColor: '#5F6368',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
              }}>編集</button>
            </p>
          )}
        </div>

        <div style={{
          textAlign: 'center',
          padding: '20px',
          backgroundColor: 'white',
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
          minWidth: '180px',
          flex: 1,
          margin: '0'
        }}>
          <h3 style={{ color: '#FBBC04', margin: '0 0 15px 0' }}>摂取カロリー</h3>
          <p style={{ fontSize: '28px', fontWeight: 'bold', color: '#3C4043' }}>{totalCaloriesToday} kcal</p>
        </div>

        <div style={{
          textAlign: 'center',
          padding: '20px',
          backgroundColor: 'white',
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
          minWidth: '180px',
          flex: 1,
          margin: '0'
        }}>
          <h3 style={{ color: remainingCalories >= 0 ? '#34A853' : '#EA4335', margin: '0 0 15px 0' }}>残りカロリー</h3>
          <p style={{ fontSize: '28px', fontWeight: 'bold', color: remainingCalories >= 0 ? '#34A853' : '#EA4335' }}>{remainingCalories} kcal</p>
        </div>
      </div>

      {error && <p style={{ textAlign: 'center', color: '#EA4335' }}>{error}</p>}

      <MealUpload onMealUploaded={fetchTodayMeals} />

      <h3 style={{ marginTop: '40px', marginBottom: '20px', color: '#3C4043' }}>今日の食事記録</h3>
      {loadingMeals ? (
        <p style={{ textAlign: 'center', color: '#5F6368' }}>食事記録を読み込み中...</p>
      ) : todayMeals.length === 0 ? (
        <p style={{ textAlign: 'center', color: '#5F6368' }}>今日の食事記録はありません。</p>
      ) : (
        <MealList meals={todayMeals} onMealDeleted={handleMealDeleted} />
      )}
    </div>
  );
};

export default Dashboard;
