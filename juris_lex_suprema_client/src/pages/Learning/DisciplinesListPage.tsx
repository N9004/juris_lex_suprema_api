// src/pages/Learning/DisciplinesListPage.tsx
import React, { useEffect, useState } from 'react';
import type { Discipline } from '../../types/entities';
import { disciplineService } from '../../services/disciplineService';
import { DisciplineCard } from '../../components/features/Learning/cards/DisciplineCard';
import { Fade } from 'react-awesome-reveal';
import './DisciplinesListPage.css';

export const DisciplinesListPage: React.FC = () => {
    const [disciplines, setDisciplines] = useState<Discipline[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let isMounted = true;
        const fetchDisciplines = async () => {
            try {
                setLoading(true);
                setError(null);
                const data = await disciplineService.getAllDisciplines();
                if (isMounted) {
                    setDisciplines(data);
                }
            } catch (err) {
                console.error('Error fetching disciplines:', err);
                if (isMounted) {
                    if (err instanceof Error) {
                        setError(err.message);
                    } else {
                        setError('Не удалось загрузить список дисциплин. Пожалуйста, попробуйте позже.');
                    }
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        // Добавляем таймаут для загрузки
        const timeoutId = setTimeout(() => {
            if (loading) {
                setError('Превышено время ожидания ответа от сервера. Пожалуйста, проверьте ваше подключение к интернету.');
                setLoading(false);
            }
        }, 15000); // 15 секунд таймаут

        fetchDisciplines();

        return () => {
            isMounted = false;
            clearTimeout(timeoutId);
        };
    }, []);

    if (loading) {
        return (
            <div className="disciplines-page loading">
                <div className="loading-container">
                    <div className="loading-spinner">
                        <div className="spinner"></div>
                    </div>
                    <p className="loading-text">Загрузка дисциплин...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="disciplines-page error">
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

    if (disciplines.length === 0) {
        return (
            <div className="disciplines-page empty">
                <div className="empty-container">
                    <svg className="empty-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    <h2 className="empty-title">Дисциплины пока не добавлены</h2>
                    <p className="empty-message">Скоро здесь появятся новые учебные материалы.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="disciplines-page">
            <div className="page-header">
                <Fade direction="down" triggerOnce>
                    <h1 className="page-title">Доступные дисциплины</h1>
                    <p className="page-subtitle">Выберите дисциплину для начала обучения</p>
                </Fade>
            </div>
            
            <div className="disciplines-grid">
                {disciplines.map((discipline, index) => (
                    <Fade key={discipline.id} direction="up" delay={index * 100} triggerOnce>
                        <DisciplineCard discipline={discipline} />
                    </Fade>
                ))}
            </div>
        </div>
    );
}; 