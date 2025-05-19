import React from 'react';
import { Link } from 'react-router-dom';
import type { Discipline } from '../../types/entities';
import { disciplineService } from '../../services/disciplineService';
import './DisciplineCard.css';

interface DisciplineCardProps {
    discipline: Discipline;
}

export const DisciplineCard: React.FC<DisciplineCardProps> = ({ discipline }) => {
    const progress = discipline.progress;
    const progressPercent = progress ? progress.progress_percent : 0;
    const progressText = progress 
        ? disciplineService.formatProgress(progress.completed_modules_count, progress.total_modules_count)
        : '0 из 0';

    return (
        <Link to={`/disciplines/${discipline.id}`} className="discipline-card">
            <div className="discipline-card-content">
                <div className="discipline-card-header">
                    <h3 className="discipline-title">{discipline.title}</h3>
                    {/* TODO: Добавить иконку дисциплины */}
                    <div className="discipline-icon">📚</div>
                </div>
                
                {discipline.description && (
                    <p className="discipline-description">{discipline.description}</p>
                )}
                
                <div className="discipline-progress">
                    <div className="progress-bar">
                        <div 
                            className="progress-fill"
                            style={{ width: `${progressPercent}%` }}
                        />
                    </div>
                    <span className="progress-text">
                        Пройдено: {progressText}
                    </span>
                </div>
            </div>
        </Link>
    );
}; 