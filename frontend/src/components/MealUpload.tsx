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
    <div style={{ border: '1px solid #eee', padding: '20px', borderRadius: '8px', marginBottom: '30px', backgroundColor: '#f9f9f9' }}>
      <h3 style={{ textAlign: 'center', color: '#333', marginBottom: '20px' }}>食事を記録する</h3>
      {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}
      {success && <p style={{ color: 'green', textAlign: 'center' }}>{success}</p>}
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '5px' }}>食事の種類:</label>
          <select
            value={mealType}
            onChange={(e) => setMealType(e.target.value as 'breakfast' | 'lunch' | 'dinner')}
            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
          >
            <option value="breakfast">朝食</option>
            <option value="lunch">昼食</option>
            <option value="dinner">夕食</option>
          </select>
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '5px' }}>写真:</label>
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
            <button type="button" onClick={() => triggerFileInput(true)} style={{ flex: 1, padding: '10px', border: '1px solid #ddd', borderRadius: '4px', backgroundColor: 'white', color: '#333', cursor: 'pointer' }}>
              カメラで撮影
            </button>
            <button type="button" onClick={() => triggerFileInput(false)} style={{ flex: 1, padding: '10px', border: '1px solid #ddd', borderRadius: '4px', backgroundColor: 'white', color: '#333', cursor: 'pointer' }}>
              ライブラリから選択
            </button>
          </div>
          {selectedFile && <p style={{ marginTop: '10px', fontSize: '14px', color: '#555' }}>選択中のファイル: {selectedFile.name}</p>}
        </div>
        <button type="submit" disabled={loading || !selectedFile} style={{ padding: '10px 20px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '16px' }}>
          {loading ? 'アップロード中...' : '記録して分析'}
        </button>
      </form>
    </div>
  );
};

export default MealUpload;
