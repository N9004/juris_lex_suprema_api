import React from 'react';
import type { Question, QuestionOption } from '../../../types/entities';
import '../../../styles/learning/MultipleChoiceQuestionDisplay.css';

interface MultipleChoiceQuestionDisplayProps {
  question: Question;
  userAnswers?: string[];
  onAnswerChange: (answers: string[]) => void;
  isSubmitted: boolean;
}

const MultipleChoiceQuestionDisplay: React.FC<MultipleChoiceQuestionDisplayProps> = ({
  question,
  userAnswers = [],
  onAnswerChange,
  isSubmitted
}) => {
  const handleOptionChange = (optionText: string) => {
    if (!isSubmitted) {
      const newAnswers = userAnswers.includes(optionText)
        ? userAnswers.filter(answer => answer !== optionText)
        : [...userAnswers, optionText];
      onAnswerChange(newAnswers);
    }
  };

  return (
    <div className="multiple-choice-question">
      <h3 className="question-text">{question.text}</h3>
      
      <div className="options-list">
        {question.options.map((option: QuestionOption, index: number) => (
          <div
            key={index}
            className={`option-item ${
              isSubmitted
                ? option.is_correct
                  ? 'correct'
                  : userAnswers.includes(option.text) && !option.is_correct
                  ? 'incorrect'
                  : ''
                : userAnswers.includes(option.text)
                ? 'selected'
                : ''
            }`}
            onClick={() => handleOptionChange(option.text)}
          >
            <input
              type="checkbox"
              checked={userAnswers.includes(option.text)}
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

export default MultipleChoiceQuestionDisplay; 