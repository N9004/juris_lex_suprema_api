import React from 'react';
import type { Question, QuestionOption } from '../../../types/entities';
import '../../../styles/learning/SingleChoiceQuestionDisplay.css';

interface SingleChoiceQuestionDisplayProps {
  question: Question;
  userAnswer?: string;
  onAnswerChange: (answer: string) => void;
  isSubmitted: boolean;
}

const SingleChoiceQuestionDisplay: React.FC<SingleChoiceQuestionDisplayProps> = ({
  question,
  userAnswer,
  onAnswerChange,
  isSubmitted
}) => {
  const handleOptionChange = (optionText: string) => {
    if (!isSubmitted) {
      onAnswerChange(optionText);
    }
  };

  return (
    <div className="single-choice-question">
      <h3 className="question-text">{question.text}</h3>
      
      <div className="options-list">
        {question.options.map((option: QuestionOption, index: number) => (
          <div
            key={index}
            className={`option-item ${
              isSubmitted
                ? option.is_correct
                  ? 'correct'
                  : userAnswer === option.text && !option.is_correct
                  ? 'incorrect'
                  : ''
                : userAnswer === option.text
                ? 'selected'
                : ''
            }`}
            onClick={() => handleOptionChange(option.text)}
          >
            <input
              type="radio"
              name={`question-${question.id}`}
              checked={userAnswer === option.text}
              onChange={() => handleOptionChange(option.text)}
              disabled={isSubmitted}
            />
            <span className="option-text">{option.text}</span>
          </div>
        ))}
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

export default SingleChoiceQuestionDisplay; 