import React, { useState } from 'react';
import { meals as apiMeals } from '../services/api'; // Renamed to avoid conflict

export interface Meal {
  id: number;
  meal_type: 'breakfast' | 'lunch' | 'dinner';
  description: string;
  calories: number;
  image_path: string;
  created_at: string;
}

export interface MealListProps {
  meals: Meal[];
  onMealDeleted: (mealId: number) => void; // Callback function
  showImage?: boolean;
}

const MealList: React.FC<MealListProps> = ({ meals, onMealDeleted, showImage = true }) => {
  const [deleting, setDeleting] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const getMealTypeLabel = (type: 'breakfast' | 'lunch' | 'dinner') => {
    switch (type) {
      case 'breakfast': return '朝食';
      case 'lunch': return '昼食';
      case 'dinner': return '夕食';
      default: return '';
    }
  };

  const handleDelete = async (mealId: number) => {
    if (!window.confirm('この食事記録を削除してもよろしいですか？')) {
      return;
    }
    setDeleting(mealId);
    setError(null);
    try {
      await apiMeals.deleteMeal(mealId);
      onMealDeleted(mealId); // Notify parent component
    } catch (err: any) {
      console.error('Failed to delete meal:', err);
      setError(err.response?.data?.detail || '食事の削除に失敗しました。');
    } finally {
      setDeleting(null);
    }
  };

  const formatDateTime = (utcDateTimeString: string) => {
    // Check if the string already contains a timezone indicator (Z, +, or -)
    const hasTimezone = utcDateTimeString.endsWith('Z') || utcDateTimeString.includes('+') || utcDateTimeString.includes('-');
    // If not, append 'Z' to force UTC interpretation by new Date()
    const dateToParse = hasTimezone ? utcDateTimeString : utcDateTimeString + 'Z';
    
    const date = new Date(dateToParse);
    
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false, // Use 24-hour format
    };
    return date.toLocaleString('ja-JP', options);
  };

  return (
    <>
      {error && <p style={{ color: '#EA4335', textAlign: 'center' }}>{error}</p>}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px' }}>
        {meals.map((meal) => (
          <div key={meal.id} style={{
            border: 'none',
            borderRadius: '8px',
            overflow: 'hidden',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
            backgroundColor: 'white',
            position: 'relative'
          }}>
            {showImage && (
              <img
                src={`http://localhost:8000/${meal.image_path.replace('/app/', '')}`}
                alt={meal.description || 'Meal image'}
                style={{ width: '100%', height: '200px', objectFit: 'cover', borderBottom: '1px solid #E0E0E0' }}
              />
            )}
            <div style={{ padding: '15px' }}>
              <h4 style={{ margin: '0 0 10px 0', color: '#3C4043' }}>{getMealTypeLabel(meal.meal_type)}</h4>
              <p style={{ margin: '0 0 5px 0', fontSize: '14px', color: '#5F6368' }}>{meal.description}</p>
              <p style={{ margin: '0', fontSize: '16px', fontWeight: 'bold', color: '#4285F4' }}>{meal.calories} kcal</p>
              <p style={{ margin: '10px 0 0 0', fontSize: '12px', color: '#9AA0A6' }}>
                {formatDateTime(meal.created_at)}
              </p>
            </div>
            <button
              onClick={() => handleDelete(meal.id)}
              disabled={deleting === meal.id}
              style={{
                position: 'absolute',
                top: '10px',
                right: '10px',
                padding: '5px 8px',
                backgroundColor: '#EA4335',
                color: 'white',
                border: 'none',
                borderRadius: '50%',
                cursor: 'pointer',
                fontSize: '14px',
                lineHeight: '1',
                width: '28px',
                height: '28px',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
              }}
            >
              {deleting === meal.id ? '...' : 'X'}
            </button>
          </div>
        ))}
      </div>
    </>
  );
};

export default MealList;
