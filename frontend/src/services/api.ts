import axios from 'axios';
import type { InternalAxiosRequestConfig, AxiosError } from 'axios';

// Viteの環境変数からAPIのベースURLを取得。デフォルトはローカル開発用
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// リクエストインターセプターを追加して、各種ヘッダーを付与する
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // 認証トークンをヘッダーに含める
    const token = localStorage.getItem('token');
    if (token) {
      if (config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    // ブラウザの言語設定をAccept-Languageヘッダーに含める
    if (typeof window !== 'undefined' && window.navigator) {
        if (config.headers) {
            config.headers['Accept-Language'] = navigator.language;
        }
    }

    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

export const auth = {
  login: (username: string, password: string) => {
    const form_data = new URLSearchParams();
    form_data.append('username', username);
    form_data.append('password', password);
    return api.post('/auth/login/token', form_data, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
  },
  signup: (username: string, password: string, daily_calorie_limit: number) => {
    return api.post('/auth/signup', { username, password, daily_calorie_limit });
  },
};

export const users = {
  getMe: () => api.get('/users/me'),
  updateMe: (daily_calorie_limit: number) => api.put('/users/me', { daily_calorie_limit }),
};

export const meals = {
  uploadMeal: (mealType: string, file: File) => {
    const formData = new FormData();
    formData.append('meal_type', mealType);
    formData.append('file', file);
    return api.post('/meals', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  getTodayMeals: () => api.get('/meals/today'),
};

export default api;