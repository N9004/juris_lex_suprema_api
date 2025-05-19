// src/pages/ModuleDetailPage.tsx
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { disciplineService } from '../services/disciplineService'; 
import type { Module, Lesson } from '../types/entities'; 

const ModuleDetailPage: React.FC = () => {
  const { moduleId } = useParams<{ moduleId: string }>(); 
  const [module, setModule] = useState<Module | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (moduleId) {
      const fetchModuleDetails = async () => {
        try {
          setIsLoading(true);
          setError(null);
          const numericId = parseInt(moduleId, 10);
          if (isNaN(numericId)) {
            setError("Неверный ID модуля.");
            setIsLoading(false);
            return;
          }
          const data = await disciplineService.getModuleById(numericId); 
          setModule(data);
        } catch (err: any) {
          console.error('Failed to fetch module details:', err);
          if (err.response && err.response.status === 404) {
            setError('Модуль не найден.');
          } else {
            setError(err.message || 'Не удалось загрузить данные модуля.');
          }
        } finally {
          setIsLoading(false);
        }
      };
      fetchModuleDetails();
    } else {
        setError("ID модуля не указан.");
        setIsLoading(false);
    }
  }, [moduleId]);

  if (isLoading) {
    return <p>Загрузка данных модуля...</p>;
  }

  if (error) {
    return <p style={{ color: 'red' }}>Ошибка: {error}</p>;
  }

  if (!module) {
    return <p>Данные о модуле не найдены.</p>;
  }

  return (
    <div>
      <h2>Модуль: {module.title}</h2>
      {module.description && <p>{module.description}</p>}
      
      <h3>Уроки модуля:</h3>
      {module.lessons && module.lessons.length > 0 ? (
        <ul>
          {module.lessons.map((lesson: Lesson) => ( // Убедитесь, что lesson имеет тип Lesson
            <li key={lesson.id}>
              {/* Ссылка на страницу урока */}
              <Link to={`/lessons/${lesson.id}`}>{lesson.title} (Порядок: {lesson.order})</Link>
            </li>
          ))}
        </ul>
      ) : (
        <p>В этом модуле пока нет уроков. (Не забудьте создать их через API)</p>
      )}
    </div>
  );
};

export default ModuleDetailPage; // Экспорт по умолчанию