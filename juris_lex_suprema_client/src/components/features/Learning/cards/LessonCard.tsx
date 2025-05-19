import React from 'react';
import { Link } from 'react-router-dom';
import type { Lesson } from '@/types/entities';
// import './LessonCard.css';
import '@/components/learning/LessonCard.css';

interface LessonCardProps {
  lesson: Lesson;
}

export const LessonCard: React.FC<LessonCardProps> = ({ lesson }) => {
  return (
    <Link to={`/lessons/${lesson.id}`} className="lesson-card">
      <div className="card-gradient"></div>
      <div className="card-content">
        <div className="card-header">
          <svg xmlns="http://www.w3.org/2000/svg" className="card-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
          <h3 className="card-title">{lesson.title}</h3>
        </div>
        
        {lesson.description && (
          <p className="card-description">{lesson.description}</p>
        )}
        
        <div className="lesson-status">
          {lesson.is_completed_by_user ? (
            <div className="status-completed">
              <svg xmlns="http://www.w3.org/2000/svg" className="status-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Завершено</span>
            </div>
          ) : (
            <div className="status-not-completed">
              <svg xmlns="http://www.w3.org/2000/svg" className="status-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Не завершено</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}; 