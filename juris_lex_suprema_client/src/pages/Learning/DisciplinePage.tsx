import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import type { Discipline } from '../../types/entities';
import { disciplineService } from '../../services/disciplineService';
import { ModuleCard } from '../../components/features/Learning/cards/ModuleCard';
import './DisciplinePage.css';

export const DisciplinePage: React.FC = () => {
    const { disciplineId } = useParams<{ disciplineId: string }>();
    const [discipline, setDiscipline] = useState<Discipline | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let isMounted = true;
        const fetchDiscipline = async () => {
            if (!disciplineId) {
                setError('ID дисциплины не указан');
                setLoading(false);
                return;
            }
            
            try {
                setLoading(true);
                setError(null);
                const data = await disciplineService.getDisciplineById(parseInt(disciplineId));
                if (isMounted) {
                    setDiscipline(data);
                }
            } catch (err) {
                console.error('Error fetching discipline:', err);
                if (isMounted) {
                    if (err instanceof Error) {
                        setError(err.message);
                    } else {
                        setError('Не удалось загрузить информацию о дисциплине. Пожалуйста, попробуйте позже.');
                    }
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        fetchDiscipline();

        return () => {
            isMounted = false;
        };
    }, [disciplineId]);

    if (loading) {
        return (
            <div className="discipline-page loading">
                <div className="loading-spinner">
                    <div className="spinner"></div>
                    <p>Загрузка дисциплины...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="discipline-page error">
                <div className="error-message">
                    <h2>Ошибка загрузки</h2>
                    <p>{error}</p>
                    <button onClick={() => window.location.reload()}>Попробовать снова</button>
                </div>
            </div>
        );
    }

    if (!discipline) {
        return (
            <div className="discipline-page not-found">
                <div className="not-found-message">
                    <h2>Дисциплина не найдена</h2>
                    <p>Запрашиваемая дисциплина не существует или была удалена.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="discipline-page">
            <div className="discipline-header">
                <h1 className="discipline-title">{discipline.title}</h1>
                {discipline.description && (
                    <p className="discipline-description">{discipline.description}</p>
                )}
            </div>

            <div className="modules-section">
                <h2 className="section-title">Модули дисциплины</h2>
                {discipline.modules.length === 0 ? (
                    <div className="empty-modules">
                        <p>В этой дисциплине пока нет модулей.</p>
                    </div>
                ) : (
                    <div className="modules-grid">
                        {discipline.modules.map(module => (
                            <ModuleCard key={module.id} module={module} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}; 