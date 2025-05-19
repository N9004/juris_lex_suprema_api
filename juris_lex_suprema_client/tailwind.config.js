// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        'brand-text': '#333333',
        'brand-ivory-bg': '#F4F8F4', // Обновлено на новый светлый оттенок
        'brand-gradient-ivory-center': '#F4F8F4', // Центральный цвет для градиента - новый светлый оттенок
        'brand-gradient-red-edge': 'rgba(185, 28, 28, 0.20)', // Более сдержанный красный
        'brand-gradient-blue-edge': 'rgba(3, 105, 161, 0.20)', // Более сдержанный синий
        'brand-input-bg': 'rgba(51, 51, 51, 0.05)', // Чуть более заметный фон инпута
        'brand-input-border-focus': 'rgba(51, 51, 51, 0.50)',
        'brand-button-dark': '#333333',
        'brand-button-text-light': '#F4F8F4', // Новый светлый оттенок для текста кнопок
        
        // Основные цвета приложения
        primary: '#1e40af', // Синий
        secondary: '#0369a1', // Темно-синий
        success: '#15803d', // Зеленый
        error: '#b91c1c', // Красный
        warning: '#b45309', // Темно-оранжевый
      },
      fontFamily: {
        widock: ['WidockTRIAL-Bold', 'sans-serif'],
        carabine: ['Carabine-Medium', 'sans-serif'],
        liter: ['Liter-Regular', 'sans-serif'],
      },
      animation: {
        'gradient-animation': 'gradientAnimation 15s ease infinite',
      },
      keyframes: {
        gradientAnimation: {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
      },
      gridTemplateColumns: {
        'auto-fit': 'repeat(auto-fit, minmax(300px, 1fr))',
        'auto-fill': 'repeat(auto-fill, minmax(300px, 1fr))',
      },
    },
  },
  plugins: [],
};