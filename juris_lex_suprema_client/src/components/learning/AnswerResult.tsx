import React from 'react';
import type { QuestionAnswerResponse } from '../../types/entities';
import './AnswerResult.css';

interface AnswerResultProps {
    result: QuestionAnswerResponse;
    onClose: () => void;
}

type CorrectAnswerDetails = {
    correct_option_text?: string;
    correct_option_texts?: string[];
    correct_bool_answer?: boolean;
    correct_text_answer?: string;
};

export const AnswerResult: React.FC<AnswerResultProps> = ({ result, onClose }) => {
    const formatCorrectAnswer = () => {
        if (!result.correct_answer_details) return '';

        const details = result.correct_answer_details as CorrectAnswerDetails;

        // Для single_choice
        if (details.correct_option_text) {
            return details.correct_option_text;
        }

        // Для multiple_choice
        if (details.correct_option_texts) {
            return details.correct_option_texts.join(', ');
        }

        // Для true_false
        if (typeof details.correct_bool_answer === 'boolean') {
            return details.correct_bool_answer ? 'Верно' : 'Неверно';
        }

        // Для fill_in_blank
        if (details.correct_text_answer) {
            return details.correct_text_answer;
        }

        return '';
    };

    return (
        <div className={`answer-result ${result.is_correct ? 'correct' : 'incorrect'}`}>
            <div className="answer-result-header">
                <h3>{result.is_correct ? 'Правильно!' : 'Неправильно'}</h3>
                {result.xp_awarded > 0 && (
                    <div className="xp-award">
                        +{result.xp_awarded} XP!
                    </div>
                )}
            </div>

            <div className="answer-result-content">
                {!result.is_correct && (
                    <div className="correct-answer">
                        <h4>Правильный ответ:</h4>
                        <p>{formatCorrectAnswer()}</p>
                    </div>
                )}
                
                {result.explanation && (
                    <div className="explanation">
                        <h4>Объяснение:</h4>
                        <p>{result.explanation}</p>
                    </div>
                )}
            </div>

            <button className="close-button" onClick={onClose}>
                Продолжить
            </button>
        </div>
    );
}; 