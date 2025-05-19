import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import type { Module } from '../../types/entities';
import { moduleService } from '../../services/moduleService';
import { LessonCard } from '../../components/features/Learning/cards/LessonCard';
import { Fade } from 'react-awesome-reveal';
import './ModulePage.css';

export const ModulePage: React.FC = () => {
    const { moduleId } = useParams<{ moduleId: string }>();
    const [module, setModule] = useState<Module | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let isMounted = true;
        const fetchModule = async () => {
            if (!moduleId) {
                setError('ID модуля не указан');
                setLoading(false);
                return;
            }
            
            try {
                setLoading(true);
                setError(null);
                const data = await moduleService.getModuleById(parseInt(moduleId));
                if (isMounted) {
                    setModule(data);
                }
            } catch (err) {
                console.error('Error fetching module:', err);
                if (isMounted) {
                    if (err instanceof Error) {
                        setError(err.message);
                    } else {
                        setError('Не удалось загрузить информацию о модуле. Пожалуйста, попробуйте позже.');
                    }
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        fetchModule();

        return () => {
            isMounted = false;
        };
    }, [moduleId]);

    if (loading) {
        return (
            <div className="module-page loading">
                <div className="loading-container">
                    <div className="loading-spinner">
                        <div className="spinner"></div>
                    </div>
                    <p className="loading-text">Загрузка модуля...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="module-page error">
                <div className="error-container">
                    <svg className="error-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <h2 className="error-title">Ошибка загрузки</h2>
                    <p className="error-message">{error}</p>
                    <button className="error-button" onClick={() => window.location.reload()}>
                        Попробовать снова
                    </button>
                </div>
            </div>
        );
    }

    if (!module) {
        return (
            <div className="module-page not-found">
                <div className="not-found-container">
                    <svg className="not-found-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h2 className="not-found-title">Модуль не найден</h2>
                    <p className="not-found-message">Запрашиваемый модуль не существует или был удален.</p>
                    <Link to="/disciplines" className="not-found-button">
                        Вернуться к дисциплинам
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="module-page">
            <div className="module-header">
                <Fade direction="down" triggerOnce>
                    <div className="header-content">
                        <div className="breadcrumbs">
                            <Link to="/disciplines" className="breadcrumb-link">Дисциплины</Link>
                            <span className="breadcrumb-separator">›</span>
                            <span className="breadcrumb-current">{module.title}</span>
                        </div>
                        <h1 className="module-title">{module.title}</h1>
                        {module.description && (
                            <p className="module-description">{module.description}</p>
                        )}
                        
                        {module.progress && (
                            <div className="module-progress">
                                <div className="progress-info">
                                    <span className="progress-label">Прогресс модуля</span>
                                    <span className="progress-percentage">{module.progress.progress_percent}%</span>
                                </div>
                                <div className="progress-bar">
                                    <div 
                                        className="progress-fill" 
                                        style={{ width: `${module.progress.progress_percent}%` }}
                                    />
                                </div>
                                <div className="progress-stats">
                                    <span className="progress-text">
                                        {module.progress.completed_lessons_count} из {module.progress.total_lessons_count} уроков
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>
                </Fade>
            </div>

            <div className="lessons-section">
                <Fade direction="up" triggerOnce>
                    <h2 className="section-title">Уроки модуля</h2>
                    {module.lessons.length === 0 ? (
                        <div className="empty-lessons">
                            <svg className="empty-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                            <p className="empty-message">В этом модуле пока нет уроков.</p>
                        </div>
                    ) : (
                        <div className="lessons-grid">
                            {module.lessons.map((lesson, index) => (
                                <Fade key={lesson.id} direction="up" delay={index * 100} triggerOnce>
                                    <LessonCard lesson={lesson} />
                                </Fade>
                            ))}
                        </div>
                    )}
                </Fade>
            </div>
        </div>
    );
}; 