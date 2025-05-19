import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import type { Lesson, QuestionAnswerResponse, LessonCompletionResponse, LessonBlock, Question } from '../../types/entities';
import { QuestionType, LessonBlockType } from '../../types/entities';
import { lessonService } from '../../services/lessonService';
import { AnswerResult } from '../../components/learning/AnswerResult';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import './LessonPage.css';

export const LessonPage: React.FC = () => {
    const { lessonId } = useParams<{ lessonId: string }>();
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();
    const { updateUserXP } = useAuth();
    const { showToast } = useToast();

    const [lesson, setLesson] = useState<Lesson | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [answerResult, setAnswerResult] = useState<QuestionAnswerResponse | null>(null);
    const [completionResult, setCompletionResult] = useState<LessonCompletionResponse | null>(null);
    const [userAnswers, setUserAnswers] = useState<Record<number, any>>({});
    const [currentBlockIndex, setCurrentBlockIndex] = useState(0);

    const mode = searchParams.get('mode') || 'theory';

    useEffect(() => {
        let isMounted = true;
        const fetchLesson = async () => {
            if (!lessonId) {
                setError('ID урока не указан');
                setLoading(false);
                return;
            }
            
            try {
                setLoading(true);
                setError(null);
                const data = await lessonService.getLessonById(parseInt(lessonId));
                if (isMounted) {
                    setLesson(data);
                    // Устанавливаем начальный блок как теорию, если она есть
                    const theoryBlockIndex = data.blocks.findIndex(block => block.block_type === 'theory');
                    if (theoryBlockIndex !== -1) {
                        setCurrentBlockIndex(theoryBlockIndex);
                    }
                }
            } catch (err) {
                console.error('Error fetching lesson:', err);
                if (isMounted) {
                    if (err instanceof Error) {
                        setError(err.message);
                    } else {
                        setError('Не удалось загрузить информацию об уроке. Пожалуйста, попробуйте позже.');
                    }
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        fetchLesson();

        return () => {
            isMounted = false;
        };
    }, [lessonId]);

    const handleAnswerChange = (questionId: number, answer: any, optionId?: number) => {
        setUserAnswers(prev => ({
            ...prev,
            [questionId]: optionId !== undefined ? optionId : answer
        }));
    };

    const handleAnswerSubmit = async (questionId: number) => {
        const answer = userAnswers[questionId];
        if (answer === undefined) {
            showToast('Пожалуйста, выберите ответ', 'error');
            return;
        }

        try {
            const result = await lessonService.submitQuestionAnswer(questionId, { 
                question_id: questionId,
                user_answer: answer 
            });
            setAnswerResult(result);
            
            if (result.xp_awarded > 0) {
                updateUserXP(result.xp_awarded);
                showToast(`+${result.xp_awarded} XP за правильный ответ!`, 'success');
            }
        } catch (err) {
            const errorMessage = 'Не удалось отправить ответ. Пожалуйста, попробуйте позже.';
            setError(errorMessage);
            showToast(errorMessage, 'error');
            console.error('Error submitting answer:', err);
        }
    };

    const handleCompleteLesson = async () => {
        if (!lesson) return;

        try {
            const result = await lessonService.markLessonAsCompleted(lesson.id);
            setCompletionResult(result);
            
            if (result.xp_earned_for_this_completion > 0) {
                updateUserXP(result.xp_earned_for_this_completion);
                showToast(
                    `Поздравляем! Вы заработали ${result.xp_earned_for_this_completion} XP за завершение урока!`,
                    'success'
                );
            }

            setTimeout(() => {
                navigate(`/modules/${lesson.module_id}`);
            }, 3000);
        } catch (err) {
            const errorMessage = 'Не удалось завершить урок. Пожалуйста, попробуйте позже.';
            setError(errorMessage);
            showToast(errorMessage, 'error');
            console.error('Error completing lesson:', err);
        }
    };

    const handleNextBlock = () => {
        if (!lesson) return;
        if (currentBlockIndex < lesson.blocks.length - 1) {
            setCurrentBlockIndex(prev => prev + 1);
            setAnswerResult(null);
            setUserAnswers({});
        }
    };

    const handlePrevBlock = () => {
        if (currentBlockIndex > 0) {
            setCurrentBlockIndex(prev => prev - 1);
            setAnswerResult(null);
            setUserAnswers({});
        }
    };

    const renderQuestionInput = (question: Question) => {
        switch (question.question_type) {
            case QuestionType.SINGLE_CHOICE:
                return (
                    <div className="question-options">
                        {question.options.map(option => (
                            <label key={option.id} className="option">
                                <input
                                    type="radio"
                                    name={`question-${question.id}`}
                                    value={option.text}
                                    checked={userAnswers[question.id] === option.id}
                                    onChange={() => handleAnswerChange(question.id, option.text, option.id)}
                                />
                                {option.text}
                            </label>
                        ))}
                    </div>
                );
            case QuestionType.MULTIPLE_CHOICE:
                return (
                    <div className="question-options">
                        {question.options.map(option => (
                            <label key={option.id} className="option">
                                <input
                                    type="checkbox"
                                    checked={userAnswers[question.id]?.includes(option.id) || false}
                                    onChange={(e) => {
                                        const currentAnswers = userAnswers[question.id] || [];
                                        const newAnswers = e.target.checked
                                            ? [...currentAnswers, option.id]
                                            : currentAnswers.filter((id: number) => id !== option.id);
                                        handleAnswerChange(question.id, newAnswers);
                                    }}
                                />
                                {option.text}
                            </label>
                        ))}
                    </div>
                );
            case QuestionType.TRUE_FALSE:
                return (
                    <div className="question-options">
                        <label className="option">
                            <input
                                type="radio"
                                name={`question-${question.id}`}
                                checked={userAnswers[question.id] === true}
                                onChange={() => handleAnswerChange(question.id, true)}
                            />
                            Верно
                        </label>
                        <label className="option">
                            <input
                                type="radio"
                                name={`question-${question.id}`}
                                checked={userAnswers[question.id] === false}
                                onChange={() => handleAnswerChange(question.id, false)}
                            />
                            Неверно
                        </label>
                    </div>
                );
            case QuestionType.FILL_IN_BLANK:
                return (
                    <input
                        type="text"
                        value={userAnswers[question.id] || ''}
                        onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                        placeholder="Введите ваш ответ"
                        className="fill-in-blank-input"
                    />
                );
            default:
                return null;
        }
    };

    if (loading) {
        return (
            <div className="lesson-page loading">
                <div className="loading-spinner">
                    <div className="spinner"></div>
                    <p>Загрузка урока...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="lesson-page error">
                <div className="error-message">
                    <h2>Ошибка загрузки</h2>
                    <p>{error}</p>
                    <button onClick={() => window.location.reload()}>Попробовать снова</button>
                </div>
            </div>
        );
    }

    if (!lesson) {
        return (
            <div className="lesson-page not-found">
                <div className="not-found-message">
                    <h2>Урок не найден</h2>
                    <p>Запрашиваемый урок не существует или был удален.</p>
                </div>
            </div>
        );
    }

    const currentBlock = lesson.blocks[currentBlockIndex];

    return (
        <div className="lesson-page">
            <div className="lesson-header">
                <h1 className="lesson-title">{lesson.title}</h1>
                {lesson.description && (
                    <p className="lesson-description">{lesson.description}</p>
                )}
            </div>

            {completionResult ? (
                <div className="completion-message">
                    <h2>Поздравляем!</h2>
                    <p>Вы успешно завершили урок и заработали {completionResult.xp_earned_for_this_completion} XP!</p>
                    <p>Сейчас вы будете перенаправлены на страницу модуля...</p>
                </div>
            ) : (
                <div className="lesson-content">
                    <div className="lesson-block">
                        <div className="block-header">
                            <h3 className="block-title">
                                {currentBlock.block_type === LessonBlockType.THEORY ? 'Теоретический материал' : 'Практическое задание'} {currentBlockIndex + 1}
                            </h3>
                            <div className={`block-type-badge ${currentBlock.block_type}`}>
                                {currentBlock.block_type === LessonBlockType.THEORY ? 'Теория' : 'Практика'}
                            </div>
                        </div>
                        
                        {currentBlock.block_type === LessonBlockType.THEORY && (
                            <div className="theory-content">
                                {currentBlock.theory_text}
                            </div>
                        )}
                        
                        {currentBlock.block_type === LessonBlockType.EXERCISE && currentBlock.questions && currentBlock.questions.length > 0 && (
                            <div className="practice-content">
                                {currentBlock.questions.map(question => (
                                    <div key={question.id} className="question-card">
                                        <div className="question-header">
                                            <h4>{question.text}</h4>
                                            <div className="question-type-badge">
                                                {question.question_type === QuestionType.SINGLE_CHOICE && 'Один ответ'}
                                                {question.question_type === QuestionType.MULTIPLE_CHOICE && 'Несколько ответов'}
                                                {question.question_type === QuestionType.TRUE_FALSE && 'Верно/Неверно'}
                                                {question.question_type === QuestionType.FILL_IN_BLANK && 'Ввод ответа'}
                                            </div>
                                        </div>
                                        
                                        <div className="question-body">
                                            {renderQuestionInput(question)}
                                        </div>
                                        
                                        <div className="question-actions">
                                            <button 
                                                className="submit-answer-button"
                                                onClick={() => handleAnswerSubmit(question.id)}
                                                disabled={!!answerResult}
                                            >
                                                Проверить ответ
                                            </button>
                                        </div>
                                        
                                        {answerResult && (
                                            <AnswerResult 
                                                result={answerResult}
                                                onClose={() => setAnswerResult(null)}
                                            />
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="lesson-navigation">
                        <button 
                            className="nav-button prev"
                            onClick={handlePrevBlock}
                            disabled={currentBlockIndex === 0}
                        >
                            ← Назад
                        </button>
                        
                        <div className="block-progress">
                            Блок {currentBlockIndex + 1} из {lesson.blocks.length}
                        </div>
                        
                        <button 
                            className="nav-button next"
                            onClick={handleNextBlock}
                            disabled={currentBlockIndex === lesson.blocks.length - 1}
                        >
                            Далее →
                        </button>
                    </div>

                    {currentBlockIndex === lesson.blocks.length - 1 && (
                        <div className="lesson-actions">
                            <button 
                                className="complete-lesson-button"
                                onClick={handleCompleteLesson}
                                disabled={!!completionResult}
                            >
                                Завершить урок
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}; 