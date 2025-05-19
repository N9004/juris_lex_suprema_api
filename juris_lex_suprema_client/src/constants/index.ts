export const API_ENDPOINTS = {
  AUTH: '/auth',
  DISCIPLINES: '/disciplines',
  MODULES: '/modules',
  LESSONS: '/lessons',
  QUESTIONS: '/questions',
  PROGRESS: '/progress',
  USERS: '/users'
} as const;

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  DISCIPLINES: '/disciplines',
  MODULES: '/modules',
  LESSONS: '/lessons',
  PROGRESS: '/progress',
  PROFILE: '/profile'
} as const;

export const THEME = {
  COLORS: {
    PRIMARY: '#4F46E5',
    PRIMARY_DARK: '#4338CA',
    PRIMARY_LIGHT: '#EEF2FF',
    SECONDARY: '#10B981',
    SECONDARY_DARK: '#059669',
    TEXT: '#1F2937',
    TEXT_LIGHT: '#6B7280',
    BACKGROUND: '#F9FAFB',
    ERROR: '#EF4444',
    SUCCESS: '#10B981',
    WARNING: '#F59E0B'
  }
} as const; 