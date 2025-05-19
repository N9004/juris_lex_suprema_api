import React from 'react';
import { Link } from 'react-router-dom';
import type { Lesson } from '../../types/entities';
import './LessonCard.css';

interface LessonCardProps {
    lesson: Lesson;
}

export const LessonCard: React.FC<LessonCardProps> = ({ lesson }) => {
    const getStatusIcon = () => {
        if (lesson.is_completed_by_user) {
            return '✅'; // Пройден
        }
        return '📚'; // Не начат
    };

    const getStatusText = () => {
        if (lesson.is_completed_by_user) {
            return 'Пройден';
        }
        return 'Не начат';
    };

    const getActionButton = () => {
        if (lesson.is_completed_by_user) {
            return (
                <div className="lesson-actions">
                    <Link 
                        to={`/lessons/${lesson.id}?mode=theory`} 
                        className="lesson-action-button theory"
                    >
                        Теория
                    </Link>
                    <Link 
                        to={`/lessons/${lesson.id}?mode=practice`} 
                        className="lesson-action-button practice"
                    >
                        Практика
                    </Link>
                </div>
            );
        }
        return (
            <Link 
                to={`/lessons/${lesson.id}`} 
                className="lesson-action-button start"
            >
                Начать урок
            </Link>
        );
    };

    return (
        <div className="lesson-card">
            <div className="lesson-card-content">
                <div className="lesson-card-header">
                    <div className="lesson-status">
                        <span className="status-icon">{getStatusIcon()}</span>
                        <span className="status-text">{getStatusText()}</span>
                    </div>
                    <h3 className="lesson-title">{lesson.title}</h3>
                </div>
                
                {lesson.description && (
                    <p className="lesson-description">{lesson.description}</p>
                )}
                
                {getActionButton()}
            </div>
        </div>
    );
}; 