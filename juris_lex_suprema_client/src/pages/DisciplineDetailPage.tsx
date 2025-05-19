// src/pages/DisciplineDetailPage.tsx
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom'; // useParams для получения ID из URL
import { disciplineService } from '../services/disciplineService'; // Уточните путь
import type { Discipline, Module } from '../types/entities'; // Уточните путь

const DisciplineDetailPage: React.FC = () => {
  // useParams() вернет объект, где ключом будет имя параметра из маршрута (например, disciplineId)
  const { disciplineId } = useParams<{ disciplineId: string }>(); 
  const [discipline, setDiscipline] = useState<Discipline | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (disciplineId) { // Убедимся, что disciplineId есть
      const fetchDisciplineDetails = async () => {
        try {
          setIsLoading(true);
          setError(null);
          // Преобразуем disciplineId в число, так как useParams возвращает строку
          const numericId = parseInt(disciplineId, 10); 
          if (isNaN(numericId)) {
            setError("Неверный ID дисциплины.");
            setIsLoading(false);
            return;
          }
          const data = await disciplineService.getDisciplineById(numericId);
          setDiscipline(data);
        } catch (err: any) {
          console.error('Failed to fetch discipline details:', err);
          if (err.response && err.response.status === 404) {
            setError('Дисциплина не найдена.');
          } else {
            setError(err.message || 'Не удалось загрузить данные дисциплины.');
          }
        } finally {
          setIsLoading(false);
        }
      };
      fetchDisciplineDetails();
    } else {
        setError("ID дисциплины не указан.");
        setIsLoading(false);
    }
  }, [disciplineId]); // Перезапускаем эффект, если disciplineId изменился

  if (isLoading) {
    return <p>Загрузка данных дисциплины...</p>;
  }

  if (error) {
    return <p style={{ color: 'red' }}>Ошибка: {error}</p>;
  }

  if (!discipline) {
    // Это состояние не должно достигаться, если isLoading=false и error=null,
    // но на всякий случай для полноты
    return <p>Данные о дисциплине не найдены.</p>; 
  }

  return (
    <div>
      <h2>{discipline.title}</h2>
      {discipline.description && <p>{discipline.description}</p>}
      
      <h3>Модули курса:</h3>
      {discipline.modules && discipline.modules.length > 0 ? (
        <ul>
          {discipline.modules.map((module: Module) => ( // Явно указываем тип Module
            <li key={module.id}>
              {/* TODO: Сделать ссылку на /modules/${module.id} */}
              <Link to={`/modules/${module.id}`}>{module.title} (Порядок: {module.order})</Link>
              {module.description && <p><small>{module.description}</small></p>}
            </li>
          ))}
        </ul>
      ) : (
        <p>В этой дисциплине пока нет модулей. (Не забудьте создать их через API)</p>
      )}
    </div>
  );
};

export default DisciplineDetailPage;