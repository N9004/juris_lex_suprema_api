// src/pages/HomePage.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import PageContainer from '@/components/layout/PageContainer';
import ModernGrid from '@/components/layout/ModernGrid';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { FadeInUp, SlideInUp, ZoomIn } from '@/components/ui/RevealAnimations';

const HomePage: React.FC = () => {
  const { user } = useAuth();
  const userName = user?.full_name || user?.email || 'пользователь';

  return (
    <div className="min-h-screen py-12">
      <PageContainer title={
        <FadeInUp>
          <span>Добро пожаловать в Juris Lex Suprema</span>
        </FadeInUp>
      } subtitle={
        <FadeInUp delay={100}>
          <span>Интерактивная платформа для изучения юриспруденции</span>
        </FadeInUp>
      }>
        <SlideInUp delay={200}>
          <div className="mt-8 mb-12 text-center">
            <p className="text-xl font-liter mb-6">
              Здравствуйте, {userName}! Выберите раздел для начала обучения.
            </p>
            <Button 
              variant="primary" 
              size="lg"
              rounded 
              as={Link} 
              to="/disciplines"
            >
              Перейти к обучению
            </Button>
          </div>
        </SlideInUp>
        
        <ModernGrid cols="auto-fit" gap={6} minWidth="280px" className="mt-10">
          <ZoomIn delay={300} cascade damping={0.3}>
            <Card 
              title="Дисциплины" 
              hover 
              shadow="md" 
              bordered
              className="h-full"
            >
              <p className="mb-4 font-liter">Изучайте юридические дисциплины в интерактивном формате с помощью современных учебных материалов.</p>
              <Button variant="outline" as={Link} to="/disciplines">
                Просмотреть все дисциплины
              </Button>
            </Card>
          </ZoomIn>
          
          <ZoomIn delay={350} cascade damping={0.3}>
            <Card 
              title="Прогресс обучения" 
              hover 
              shadow="md" 
              bordered
              className="h-full"
            >
              <p className="mb-4 font-liter">Отслеживайте свой прогресс обучения по всем дисциплинам и модулям.</p>
              <Button variant="outline" as={Link} to="/profile">
                Перейти к профилю
              </Button>
            </Card>
          </ZoomIn>
          
          <ZoomIn delay={400} cascade damping={0.3}>
            <Card 
              title="Последние обновления" 
              hover 
              shadow="md" 
              bordered
              className="h-full"
            >
              <p className="mb-4 font-liter">Мы регулярно обновляем материалы курсов и добавляем новые интерактивные элементы.</p>
              <div className="bg-gray-50 p-3 rounded text-sm">
                <p>Последнее обновление: 15.05.2023</p>
                <p>Добавлены новые интерактивные упражнения.</p>
              </div>
            </Card>
          </ZoomIn>
        </ModernGrid>
      </PageContainer>
    </div>
  );
};

export default HomePage;