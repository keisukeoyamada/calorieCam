import React, { useState, useRef } from 'react';
import { meals } from '../services/api';
import { useAuth } from '../context/AuthContext';

interface MealUploadProps {
  onMealUploaded: () => void;
}

const MealUpload: React.FC<MealUploadProps> = ({ onMealUploaded }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [mealType, setMealType] = useState<'breakfast' | 'lunch' | 'dinner'>('lunch');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { token } = useAuth();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setError(null);
      setSuccess(null);
    }
    // Reset the input value to allow selecting the same file again
    if (fileInputRef.current) {
        fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      setError('ファイルを選択してください。');
      return;
    }
    if (!token) {
      setError('ログインしていません。');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await meals.uploadMeal(mealType, selectedFile);
      setSuccess('食事を記録しました！');
      setSelectedFile(null);
      onMealUploaded();
    } catch (err: any) {
      console.error('Meal upload error:', err);
      setError(err.response?.data?.detail || '食事の記録に失敗しました。');
    } finally {
      setLoading(false);
    }
  };

  const triggerFileInput = (capture: boolean) => {
    if (fileInputRef.current) {
      if (capture) {
        fileInputRef.current.setAttribute('capture', 'environment');
      } else {
        fileInputRef.current.removeAttribute('capture');
      }
      fileInputRef.current.click();
    }
  };

  return (
    <div style={{
      border: 'none',
      padding: '25px',
      borderRadius: '8px',
      marginBottom: '30px',
      backgroundColor: 'white',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)'
    }}>
      <h3 style={{ textAlign: 'center', color: '#3C4043', marginBottom: '25px' }}>食事を記録する</h3>
      {error && <p style={{ color: '#EA4335', textAlign: 'center', marginBottom: '15px' }}>{error}</p>}
      {success && <p style={{ color: '#34A853', textAlign: 'center', marginBottom: '15px' }}>{success}</p>}
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '8px', color: '#5F6368', fontWeight: 'bold' }}>食事の種類:</label>
          <select
            value={mealType}
            onChange={(e) => setMealType(e.target.value as 'breakfast' | 'lunch' | 'dinner')}
            style={{
              width: '100%',
              padding: '10px',
              borderRadius: '4px',
              border: '1px solid #E0E0E0',
              backgroundColor: 'white',
              boxSizing: 'border-box',
              color: '#3C4043'
            }}
          >
            <option value="breakfast">朝食</option>
            <option value="lunch">昼食</option>
            <option value="dinner">夕食</option>
          </select>
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '8px', color: '#5F6368', fontWeight: 'bold' }}>写真:</label>
          {/* Hidden file input */}
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            ref={fileInputRef}
            style={{ display: 'none' }}
          />
          {/* Custom buttons */}
          <div style={{ display: 'flex', gap: '10px' }}>
            <button type="button" onClick={() => triggerFileInput(true)} style={{
              flex: 1,
              padding: '12px',
              border: '1px solid #E0E0E0',
              borderRadius: '4px',
              backgroundColor: 'white',
              color: '#5F6368',
              cursor: 'pointer',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)'
            }}>
              カメラで撮影
            </button>
            <button type="button" onClick={() => triggerFileInput(false)} style={{
              flex: 1,
              padding: '12px',
              border: '1px solid #E0E0E0',
              borderRadius: '4px',
              backgroundColor: 'white',
              color: '#5F6368',
              cursor: 'pointer',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)'
            }}>
              ライブラリから選択
            </button>
          </div>
          {selectedFile && <p style={{ marginTop: '15px', fontSize: '14px', color: '#5F6368' }}>選択中のファイル: {selectedFile.name}</p>}
        </div>
        <button type="submit" disabled={loading || !selectedFile} style={{
          padding: '12px 25px',
          backgroundColor: '#4285F4',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '16px',
          fontWeight: 'bold',
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.15)'
        }}>
          {loading ? 'アップロード中...' : '記録して分析'}
        </button>
      </form>
    </div>
  );
};

export default MealUpload;
