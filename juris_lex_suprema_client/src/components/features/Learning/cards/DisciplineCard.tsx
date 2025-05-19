import React from 'react';
import { Link } from 'react-router-dom';
import type { Discipline } from '@/types/entities';
// import './DisciplineCard.css';
import '@/components/learning/DisciplineCard.css';

interface DisciplineCardProps {
  discipline: Discipline;
}

export const DisciplineCard: React.FC<DisciplineCardProps> = ({ discipline }) => {
  const progress = discipline.progress || {
    completed_modules_count: 0,
    total_modules_count: discipline.modules.length,
    progress_percent: 0
  };

  // Функция для выбора иконки на основе названия дисциплины
  const getDisciplineIcon = (title: string) => {
    const lowerTitle = title.toLowerCase();

    if (lowerTitle.includes('уголовн')) {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="card-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 6l9-4 9 4v12l-9 4-9-4V6z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 22V12M3 10l9 4 9-4" />
        </svg>
      );
    } else if (lowerTitle.includes('гражданск')) {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="card-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7H5a2 2 0 00-2 2v10a2 2 0 002 2h14a2 2 0 002-2v-5" />
        </svg>
      );
    } else if (lowerTitle.includes('конститу')) {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="card-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 6l9-4 9 4v12l-9 4-9-4V6z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 22V12M3 10l9 4 9-4" />
        </svg>
      );
    } else {
      // Иконка книги по умолчанию
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="card-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      );
    }
  };

  return (
    <Link to={`/disciplines/${discipline.id}`} className="discipline-card">
      <div className="card-gradient"></div>
      <div className="card-content">
        <div className="card-header">
          {getDisciplineIcon(discipline.title)}
          <h3 className="card-title">{discipline.title}</h3>
        </div>
        
        {discipline.description && (
          <p className="card-description">{discipline.description}</p>
        )}
        
        <div className="progress-container">
          <div className="progress-info">
            <span className="progress-label">Прогресс</span>
            <span className="progress-percentage">{progress.progress_percent}%</span>
          </div>
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${progress.progress_percent}%` }}
            />
          </div>
          <div className="progress-stats">
            <span className="progress-text">
              {progress.completed_modules_count} из {progress.total_modules_count} модулей
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}; 