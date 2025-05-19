import React from 'react';
import type { Question } from '../../../types/entities';
import '../../../styles/learning/TrueFalseQuestionDisplay.css';

interface TrueFalseQuestionDisplayProps {
  question: Question;
  userAnswer?: boolean;
  onAnswerChange: (answer: boolean) => void;
  isSubmitted: boolean;
}

const TrueFalseQuestionDisplay: React.FC<TrueFalseQuestionDisplayProps> = ({
  question,
  userAnswer,
  onAnswerChange,
  isSubmitted
}) => {
  const handleAnswerChange = (answer: boolean) => {
    if (!isSubmitted) {
      onAnswerChange(answer);
    }
  };

  const correctAnswer = question.options.find(option => option.is_correct)?.text === 'true';

  return (
    <div className="true-false-question">
      <h3 className="question-text">{question.text}</h3>
      
      <div className="options-list">
        <div
          className={`option-item ${
            isSubmitted
              ? correctAnswer
                ? 'correct'
                : userAnswer === true && !correctAnswer
                ? 'incorrect'
                : ''
              : userAnswer === true
              ? 'selected'
              : ''
          }`}
          onClick={() => handleAnswerChange(true)}
        >
          <input
            type="radio"
            name={`question-${question.id}`}
            checked={userAnswer === true}
            onChange={() => handleAnswerChange(true)}
            disabled={isSubmitted}
          />
          <span className="option-text">Верно</span>
        </div>

        <div
          className={`option-item ${
            isSubmitted
              ? !correctAnswer
                ? 'correct'
                : userAnswer === false && correctAnswer
                ? 'incorrect'
                : ''
              : userAnswer === false
              ? 'selected'
              : ''
          }`}
          onClick={() => handleAnswerChange(false)}
        >
          <input
            type="radio"
            name={`question-${question.id}`}
            checked={userAnswer === false}
            onChange={() => handleAnswerChange(false)}
            disabled={isSubmitted}
          />
          <span className="option-text">Неверно</span>
        </div>
      </div>

      {isSubmitted && (
        <div className="explanation">
          <h4>Объяснение:</h4>
          <p>{question.general_explanation}</p>
        </div>
      )}
    </div>
  );
};

export default TrueFalseQuestionDisplay; 