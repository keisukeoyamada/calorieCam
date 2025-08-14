import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { meals } from '../services/api';
import MealList, { type Meal } from './MealList';
import { useAuth } from '../context/AuthContext';

interface GroupedMeals {
  [date: string]: Meal[];
}

const MealHistory: React.FC = () => {
  const [groupedMeals, setGroupedMeals] = useState<GroupedMeals>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await meals.getMealHistory();
        const mealsData: Meal[] = response.data;
        
        const groups = mealsData.reduce((acc, meal) => {
          const date = new Date(meal.created_at).toLocaleDateString('ja-JP');
          if (!acc[date]) {
            acc[date] = [];
          }
          acc[date].push(meal);
          return acc;
        }, {} as GroupedMeals);

        setGroupedMeals(groups);
      } catch (err: any) {
        console.error('Failed to fetch meal history:', err);
        setError(err.response?.data?.detail || '食事履歴の取得に失敗しました。');
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  const handleMealDeleted = (mealId: number) => {
    setGroupedMeals(prevGroupedMeals => {
        const newGroupedMeals = { ...prevGroupedMeals };
        for (const date in newGroupedMeals) {
            const filteredMeals = newGroupedMeals[date].filter(meal => meal.id !== mealId);
            if (filteredMeals.length === 0) {
                delete newGroupedMeals[date];
            } else {
                newGroupedMeals[date] = filteredMeals;
            }
        }
        return newGroupedMeals;
    });
  };

  if (loading) {
    return <p style={{ textAlign: 'center', marginTop: '20px' }}>履歴を読み込み中...</p>;
  }

  if (error) {
    return <p style={{ color: 'red', textAlign: 'center', marginTop: '20px' }}>{error}</p>;
  }

  return (
    <div style={{
      padding: '20px',
      width: '90%',
      margin: '20px auto',
      boxSizing: 'border-box',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
      borderRadius: '8px',
      backgroundColor: '#F8F9FA'
    }}>
      <h2 style={{ textAlign: 'center', color: '#3C4043', marginBottom: '30px' }}>食事の履歴</h2>
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <Link to="/dashboard" style={{ color: '#4285F4', textDecoration: 'none', fontWeight: 'bold' }}>ダッシュボードに戻る</Link>
      </div>
      {Object.keys(groupedMeals).length === 0 ? (
        <p style={{ textAlign: 'center', color: '#5F6368' }}>食事の記録はありません。</p>
      ) : (
        Object.entries(groupedMeals).map(([date, mealsOnDate]) => {
          const totalCalories = mealsOnDate.reduce((sum, meal) => sum + meal.calories, 0);
          const calorieLimit = user?.daily_calorie_limit || 2000;
          const difference = calorieLimit - totalCalories;

          return (
            <div key={date} style={{
              marginBottom: '40px',
              padding: '20px',
              border: 'none',
              borderRadius: '8px',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
              backgroundColor: 'white'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #E0E0E0', paddingBottom: '10px', marginBottom: '20px' }}>
                <h3 style={{ margin: 0, color: '#3C4043' }}>{date}</h3>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '16px', fontWeight: 'bold', color: '#3C4043' }}>
                    合計: {totalCalories} kcal
                  </span>
                  <span style={{
                    marginLeft: '15px',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    color: difference < 0 ? '#EA4335' : '#34A853'
                  }}>
                    残り: {difference} kcal
                  </span>
                </div>
              </div>
              <MealList meals={mealsOnDate} onMealDeleted={handleMealDeleted} showImage={false} />
            </div>
          );
        })
      )}
    </div>
  );
};

export default MealHistory;
