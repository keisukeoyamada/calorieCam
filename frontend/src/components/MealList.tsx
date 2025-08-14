import React from 'react';

interface Meal {
  id: number;
  meal_type: 'breakfast' | 'lunch' | 'dinner';
  description: string;
  calories: number;
  image_path: string;
  created_at: string;
}

interface MealListProps {
  meals: Meal[];
}

const MealList: React.FC<MealListProps> = ({ meals }) => {
  const getMealTypeLabel = (type: 'breakfast' | 'lunch' | 'dinner') => {
    switch (type) {
      case 'breakfast': return '朝食';
      case 'lunch': return '昼食';
      case 'dinner': return '夕食';
      default: return '';
    }
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px' }}>
      {meals.map((meal) => (
        <div key={meal.id} style={{ border: '1px solid #ddd', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', backgroundColor: 'white' }}>
          <img
            src={`http://localhost:8000/${meal.image_path.replace('/app/', '')}`} // 静的ファイル配信のためにパスを調整
            alt={meal.description || 'Meal image'}
            style={{ width: '100%', height: '200px', objectFit: 'cover', borderBottom: '1px solid #eee' }}
          />
          <div style={{ padding: '15px' }}>
            <h4 style={{ margin: '0 0 10px 0', color: '#333' }}>{getMealTypeLabel(meal.meal_type)}</h4>
            <p style={{ margin: '0 0 5px 0', fontSize: '14px', color: '#555' }}>{meal.description}</p>
            <p style={{ margin: '0', fontSize: '16px', fontWeight: 'bold', color: '#007bff' }}>{meal.calories} kcal</p>
            <p style={{ margin: '10px 0 0 0', fontSize: '12px', color: '#888' }}>
              {new Date(meal.created_at).toLocaleString()}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default MealList;
