import React from 'react';
import { Link } from 'react-router-dom';
import type { Module } from '../../types/entities';
import './ModuleCard.css';

interface ModuleCardProps {
    module: Module;
}

export const ModuleCard: React.FC<ModuleCardProps> = ({ module }) => {
    const progress = module.progress;
    const progressPercent = progress ? progress.progress_percent : 0;
    const progressText = progress 
        ? `${progress.completed_lessons_count} из ${progress.total_lessons_count}`
        : '0 из 0';

    return (
        <Link to={`/modules/${module.id}`} className="module-card">
            <div className="module-card-content">
                <div className="module-card-header">
                    <h3 className="module-title">{module.title}</h3>
                    <div className="module-icon">📖</div>
                </div>
                
                {module.description && (
                    <p className="module-description">{module.description}</p>
                )}
                
                <div className="module-progress">
                    <div className="progress-bar">
                        <div 
                            className="progress-fill"
                            style={{ width: `${progressPercent}%` }}
                        />
                    </div>
                    <span className="progress-text">
                        Пройдено уроков: {progressText}
                    </span>
                </div>
            </div>
        </Link>
    );
}; 