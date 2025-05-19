import React from 'react';
import { Link } from 'react-router-dom';
import type { Module } from '@/types/entities';
// import './ModuleCard.css';
import '@/components/learning/ModuleCard.css';

interface ModuleCardProps {
  module: Module;
}

export const ModuleCard: React.FC<ModuleCardProps> = ({ module }) => {
  const progress = module.progress || {
    completed_lessons_count: 0,
    total_lessons_count: module.lessons.length,
    progress_percent: 0
  };

  return (
    <Link to={`/modules/${module.id}`} className="module-card">
      <div className="card-content">
        <h3 className="card-title">{module.title}</h3>
        {module.description && (
          <p className="card-description">{module.description}</p>
        )}
        <div className="progress-info">
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${progress.progress_percent}%` }}
            />
          </div>
          <span className="progress-text">
            {progress.completed_lessons_count} из {progress.total_lessons_count} уроков
          </span>
        </div>
      </div>
    </Link>
  );
}; 