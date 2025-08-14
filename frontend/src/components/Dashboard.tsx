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

  return (
    <div style={{ padding: '20px', maxWidth: '900px', margin: '20px auto', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
      <h2 style={{ textAlign: 'center', color: '#333' }}>今日のダッシュボード</h2>

      <div style={{ display: 'flex', justifyContent: 'space-around', marginBottom: '30px', flexWrap: 'wrap' }}>
        <div style={{ textAlign: 'center', padding: '15px', border: '1px solid #eee', borderRadius: '8px', minWidth: '180px', margin: '10px' }}>
          <h3 style={{ color: '#007bff', margin: '0 0 10px 0' }}>目標カロリー</h3>
          {isEditingLimit ? (
            <div>
              <input
                type="number"
                value={dailyCalorieLimit}
                onChange={(e) => setDailyCalorieLimit(parseInt(e.target.value))}
                style={{ width: '100px', padding: '5px', borderRadius: '4px', border: '1px solid #ddd' }}
              /> kcal
              <button onClick={handleUpdateLimit} style={{ marginLeft: '10px', padding: '5px 10px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>保存</button>
            </div>
          ) : (
            <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#333' }}>
              {dailyCalorieLimit} kcal
              <button onClick={() => setIsEditingLimit(true)} style={{ marginLeft: '10px', padding: '5px 10px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>編集</button>
            </p>
          )}
        </div>

        <div style={{ textAlign: 'center', padding: '15px', border: '1px solid #eee', borderRadius: '8px', minWidth: '180px', margin: '10px' }}>
          <h3 style={{ color: '#ffc107', margin: '0 0 10px 0' }}>摂取カロリー</h3>
          <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#333' }}>{totalCaloriesToday} kcal</p>
        </div>

        <div style={{ textAlign: 'center', padding: '15px', border: '1px solid #eee', borderRadius: '8px', minWidth: '180px', margin: '10px' }}>
          <h3 style={{ color: remainingCalories >= 0 ? '#28a745' : '#dc3545', margin: '0 0 10px 0' }}>残りカロリー</h3>
          <p style={{ fontSize: '24px', fontWeight: 'bold', color: remainingCalories >= 0 ? '#28a745' : '#dc3545' }}>{remainingCalories} kcal</p>
        </div>
      </div>

      {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}

      <MealUpload onMealUploaded={fetchTodayMeals} />

      <h3 style={{ marginTop: '40px', marginBottom: '20px', color: '#333' }}>今日の食事記録</h3>
      {loadingMeals ? (
        <p style={{ textAlign: 'center' }}>食事記録を読み込み中...</p>
      ) : todayMeals.length === 0 ? (
        <p style={{ textAlign: 'center' }}>今日の食事記録はありません。</p>
      ) : (
        <MealList meals={todayMeals} onMealDeleted={handleMealDeleted} />
      )}
    </div>
  );
};

export default Dashboard;
