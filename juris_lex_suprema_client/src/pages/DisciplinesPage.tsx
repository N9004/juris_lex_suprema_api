// src/pages/DisciplinesPage.tsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { disciplineService } from '@/services/disciplineService'; 
import type { Discipline } from '@/types/entities';
import PageContainer from '@/components/layout/PageContainer';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { Fade, Zoom } from 'react-awesome-reveal';

// Иконки для дисциплин (можно добавить больше)
const disciplineIcons = [
  '⚖️', '📚', '🏛️', '📋', '📝', '👨‍⚖️', '📜', '🔍', '🔒', '💼'
];

// Функция для получения иконки по индексу или ID
const getDisciplineIcon = (index: number) => {
  return disciplineIcons[index % disciplineIcons.length];
};

const DisciplinesPage: React.FC = () => {
  const [disciplines, setDisciplines] = useState<Discipline[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDisciplines = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await disciplineService.getAllDisciplines();
        setDisciplines(data);
      } catch (err: any) {
        console.error('Failed to fetch disciplines:', err);
        setError(err.response?.data?.detail || err.message || 'Не удалось загрузить дисциплины.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDisciplines();
  }, []);

  if (isLoading) {
    return (
      <PageContainer>
        <div className="flex justify-center items-center min-h-[50vh]">
          <Fade>
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-button-dark mb-4"></div>
              <p className="text-xl font-carabine">Загрузка дисциплин...</p>
            </div>
          </Fade>
        </div>
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer>
        <div className="flex flex-col justify-center items-center min-h-[50vh]">
          <Fade>
            <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-lg max-w-md">
              <h3 className="font-carabine text-xl mb-2">Ошибка загрузки</h3>
              <p>{error}</p>
              <Button 
                variant="primary" 
                className="mt-4" 
                onClick={() => window.location.reload()}
              >
                Попробовать снова
              </Button>
            </div>
          </Fade>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer 
      title={<Fade cascade damping={0.1}><span>Юридические дисциплины</span></Fade>}
      subtitle={<Fade delay={300}><span>Выберите дисциплину для начала обучения</span></Fade>}
    >
      {disciplines.length === 0 ? (
        <Fade>
          <div className="text-center py-12">
            <p className="mb-4 text-lg">На данный момент дисциплины не добавлены.</p>
            <p>Пожалуйста, вернитесь позже.</p>
          </div>
        </Fade>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-8">
          {disciplines.map((discipline, index) => (
            <Zoom key={discipline.id} delay={100 + index * 50} fraction={0.2} triggerOnce>
              <Card 
                title={discipline.title}
                icon={<span className="text-2xl">{getDisciplineIcon(index)}</span>}
                hover
                shadow="md"
                bordered
                gradient
                className="h-full"
              >
                <div className="mb-6 font-liter">
                  {discipline.description || 'Описание отсутствует'}
                </div>
                
                {discipline.progress && (
                  <div className="mb-6">
                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                      <span>Прогресс выполнения:</span>
                      <span className="font-medium">{discipline.progress.progress_percent}%</span>
                    </div>
                    <div className="w-full bg-gray-200/50 rounded-full h-2.5 overflow-hidden">
                      <div 
                        className="bg-brand-button-dark h-2.5 rounded-full transition-all duration-1000" 
                        style={{ width: `${discipline.progress.progress_percent}%` }}
                      ></div>
                    </div>
                  </div>
                )}

                <Button 
                  variant="primary" 
                  as={Link} 
                  to={`/disciplines/${discipline.id}`}
                  className="w-full mt-4"
                  rounded
                >
                  Перейти к дисциплине
                </Button>
              </Card>
            </Zoom>
          ))}
        </div>
      )}
    </PageContainer>
  );
};

export default DisciplinesPage;