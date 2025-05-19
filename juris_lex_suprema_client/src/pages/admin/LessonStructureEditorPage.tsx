import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import type { LessonBlock, Lesson } from '../../types/entities';
import { LessonBlockType } from '../../types/entities';
import { adminLessonService } from '../../services/adminLessonService';
import { useToast } from '../../contexts/ToastContext';
import Button from '../../components/ui/Button';
import LessonBlockForm from '../../components/features/Admin/LessonBlockForm';
import ExerciseBlockForm from '../../components/features/Admin/ExerciseBlockForm';
import { cn } from '../../utils/cn';

const LessonStructureEditorPage: React.FC = () => {
  const { lessonId } = useParams<{ lessonId: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [lessonData, setLessonData] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [addingBlock, setAddingBlock] = useState(false);
  const [addingBlockType, setAddingBlockType] = useState<LessonBlockType | null>(null);
  const [editingBlock, setEditingBlock] = useState<LessonBlock | null>(null);

  useEffect(() => {
    fetchLessonData();
  }, [lessonId]);

  const fetchLessonData = async () => {
    try {
      setLoading(true);
      const data = await adminLessonService.getLesson(Number(lessonId));
      setLessonData(data);
      setError(null);
    } catch (err) {
      setError('Ошибка при загрузке данных урока');
      console.error('Error fetching lesson data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTheoryBlock = () => {
    setAddingBlockType(LessonBlockType.THEORY);
    setAddingBlock(true);
  };

  const handleAddExerciseBlock = () => {
    setAddingBlockType(LessonBlockType.EXERCISE);
    setAddingBlock(true);
  };

  const handleEditBlock = (block: LessonBlock) => {
    setEditingBlock(block);
    setAddingBlockType(block.block_type);
    setAddingBlock(true);
  };

  const handleCancelBlock = () => {
    setAddingBlock(false);
    setAddingBlockType(null);
    setEditingBlock(null);
  };

  const handleBlockSubmit = async (blockData: {
    order_in_lesson: number;
    block_type: LessonBlockType;
    theory_text?: string;
    questions?: Array<{
      text: string;
      question_type: string;
      general_explanation: string;
      correct_answer_text: string;
      options: Array<{
        text: string;
        is_correct: boolean;
      }>;
    }>;
  }) => {
    try {
      if (editingBlock) {
        await adminLessonService.updateLessonBlock(Number(lessonId), editingBlock.id, blockData);
        showToast('Блок успешно обновлен', 'success');
      } else {
        await adminLessonService.createLessonBlock(Number(lessonId), blockData);
        showToast('Новый блок успешно создан', 'success');
      }
      await fetchLessonData();
      handleCancelBlock();
    } catch (err) {
      const errorMessage = 'Ошибка при сохранении блока';
      setError(errorMessage);
      showToast(errorMessage, 'error');
      console.error('Error saving block:', err);
    }
  };

  const handleDeleteBlock = async (blockId: number) => {
    if (window.confirm('Вы уверены, что хотите удалить этот блок? Все связанные материалы также будут удалены.')) {
      try {
        await adminLessonService.deleteLessonBlock(Number(lessonId), blockId);
        await fetchLessonData();
        showToast('Блок успешно удален', 'success');
      } catch (err) {
        const errorMessage = 'Ошибка при удалении блока';
        setError(errorMessage);
        showToast(errorMessage, 'error');
        console.error('Error deleting block:', err);
      }
    }
  };

  const handleMoveBlockUp = async (blockId: number, currentOrder: number) => {
    if (currentOrder <= 1) return; // Can't move up if already at the top
    
    try {
      // Найти блок, который нужно обновить
      const blockToUpdate = lessonData?.blocks.find(b => b.id === blockId);
      if (!blockToUpdate) return;

      // Создать обновленный объект со всеми необходимыми полями
      // Обратите внимание: API ожидает order_in_lesson, хотя в типах используется order
      const updatedBlockData = {
        order_in_lesson: currentOrder - 1,
        block_type: blockToUpdate.block_type,
        theory_text: blockToUpdate.theory_text,
        questions: blockToUpdate.questions
      };

      await adminLessonService.updateLessonBlock(Number(lessonId), blockId, updatedBlockData);
      await fetchLessonData();
      showToast('Порядок блоков обновлен', 'success');
    } catch (err) {
      const errorMessage = 'Ошибка при изменении порядка блоков';
      setError(errorMessage);
      showToast(errorMessage, 'error');
      console.error('Error reordering blocks:', err);
    }
  };

  const handleMoveBlockDown = async (blockId: number, currentOrder: number) => {
    if (!lessonData || currentOrder >= lessonData.blocks.length) return; // Can't move down if already at the bottom
    
    try {
      // Найти блок, который нужно обновить
      const blockToUpdate = lessonData?.blocks.find(b => b.id === blockId);
      if (!blockToUpdate) return;

      // Создать обновленный объект со всеми необходимыми полями
      // Обратите внимание: API ожидает order_in_lesson, хотя в типах используется order
      const updatedBlockData = {
        order_in_lesson: currentOrder + 1,
        block_type: blockToUpdate.block_type,
        theory_text: blockToUpdate.theory_text,
        questions: blockToUpdate.questions
      };

      await adminLessonService.updateLessonBlock(Number(lessonId), blockId, updatedBlockData);
      await fetchLessonData();
      showToast('Порядок блоков обновлен', 'success');
    } catch (err) {
      const errorMessage = 'Ошибка при изменении порядка блоков';
      setError(errorMessage);
      showToast(errorMessage, 'error');
      console.error('Error reordering blocks:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="rounded-md bg-red-50 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">{error}</h3>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!lessonData) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="rounded-md bg-yellow-50 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">Урок не найден</h3>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{lessonData.title}</h1>
          <p className="mt-2 text-sm text-gray-600">
            Редактирование структуры урока
          </p>
        </div>
        <div className="flex space-x-4">
          <Button
            onClick={handleAddTheoryBlock}
            variant="primary"
            icon={
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            }
          >
            Добавить теорию
          </Button>
          <Button
            onClick={handleAddExerciseBlock}
            variant="primary"
            icon={
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            }
          >
            Добавить упражнение
          </Button>
        </div>
      </div>

      {addingBlock && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          {addingBlockType === LessonBlockType.THEORY ? (
            <LessonBlockForm
              lessonId={Number(lessonId)}
              blockOrder={lessonData.blocks.length + 1}
              initialData={editingBlock}
              onSubmit={handleBlockSubmit}
              onCancel={handleCancelBlock}
            />
          ) : (
            <ExerciseBlockForm
              lessonId={Number(lessonId)}
              blockOrder={lessonData.blocks.length + 1}
              initialData={editingBlock}
              onSubmit={handleBlockSubmit}
              onCancel={handleCancelBlock}
            />
          )}
        </div>
      )}

      <div className="space-y-6">
        {lessonData.blocks.map((block: LessonBlock) => (
          <div
            key={block.id}
            className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
          >
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <span className={cn(
                    'px-2 py-1 text-xs font-semibold rounded-full',
                    block.block_type === LessonBlockType.THEORY
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-green-100 text-green-800'
                  )}>
                    {block.block_type === LessonBlockType.THEORY ? 'Теория' : 'Упражнение'}
                  </span>
                  <span className="ml-2 text-sm text-gray-500">
                    Порядок: {block.order}
                  </span>
                </div>
                <div className="flex space-x-3">
                  <div className="flex space-x-1 mr-4">
                    <Button
                      onClick={() => handleMoveBlockUp(block.id, block.order)}
                      variant="text"
                      size="sm"
                      disabled={block.order <= 1}
                      icon={
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                        </svg>
                      }
                    />
                    <Button
                      onClick={() => handleMoveBlockDown(block.id, block.order)}
                      variant="text"
                      size="sm"
                      disabled={!lessonData || block.order >= lessonData.blocks.length}
                      icon={
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      }
                    />
                  </div>
                  <Button
                    onClick={() => handleEditBlock(block)}
                    variant="text"
                    size="sm"
                  >
                    Редактировать
                  </Button>
                  <Button
                    onClick={() => handleDeleteBlock(block.id)}
                    variant="text"
                    size="sm"
                    className="text-red-600 hover:text-red-900"
                  >
                    Удалить
                  </Button>
                </div>
              </div>
            </div>
            <div className="px-6 py-4">
              {block.block_type === LessonBlockType.THEORY ? (
                <div className="prose max-w-none">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Текст теории:</h3>
                  <div className="text-gray-600 whitespace-pre-wrap">{block.theory_text}</div>
                </div>
              ) : (
                <div className="space-y-6">
                  {block.questions?.map((question, index) => (
                    <div key={index} className="border-b border-gray-200 last:border-0 pb-6 last:pb-0">
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        Вопрос {index + 1}:
                      </h3>
                      <p className="text-gray-600 mb-4">{question.text}</p>
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-2">
                          Варианты ответов:
                        </h4>
                        <ul className="space-y-2">
                          {question.options.map((option, optionIndex) => (
                            <li
                              key={optionIndex}
                              className={cn(
                                'flex items-center px-3 py-2 rounded-md',
                                option.is_correct
                                  ? 'bg-green-50 text-green-700'
                                  : 'bg-gray-50 text-gray-700'
                              )}
                            >
                              <span className="flex-1">{option.text}</span>
                              {option.is_correct && (
                                <svg className="h-5 w-5 text-green-500 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                              )}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LessonStructureEditorPage; 