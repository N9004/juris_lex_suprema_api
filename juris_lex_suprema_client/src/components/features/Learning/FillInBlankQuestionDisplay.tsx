import React, { useState } from 'react';
import type { Question } from '../../../types/entities';
import '../../../styles/learning/FillInBlankQuestionDisplay.css';

interface FillInBlankQuestionDisplayProps {
  question: Question;
  userAnswer?: string;
  onAnswerChange: (answer: string) => void;
  isSubmitted: boolean;
}

const FillInBlankQuestionDisplay: React.FC<FillInBlankQuestionDisplayProps> = ({
  question,
  userAnswer = '',
  onAnswerChange,
  isSubmitted
}) => {
  const [inputValue, setInputValue] = useState(userAnswer);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isSubmitted) {
      const newValue = e.target.value;
      setInputValue(newValue);
      onAnswerChange(newValue);
    }
  };

  const isCorrect = inputValue.toLowerCase().trim() === question.correct_answer_text.toLowerCase().trim();

  return (
    <div className="fill-in-blank-question">
      <h3 className="question-text">{question.text}</h3>
      
      <div className="answer-input">
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          disabled={isSubmitted}
          placeholder="Введите ваш ответ..."
          className={isSubmitted ? (isCorrect ? 'correct' : 'incorrect') : ''}
        />
      </div>

      {isSubmitted && (
        <div className="feedback">
          <div className={`result ${isCorrect ? 'correct' : 'incorrect'}`}>
            {isCorrect ? 'Правильно!' : 'Неправильно!'}
          </div>
          <div className="correct-answer">
            <strong>Правильный ответ:</strong> {question.correct_answer_text}
          </div>
          <div className="explanation">
            <h4>Объяснение:</h4>
            <p>{question.general_explanation}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default FillInBlankQuestionDisplay; 