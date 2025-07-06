import React from 'react';

interface ICEYesNoQuestionProps {
  question: string;
  value: string;
  onChange: (value: string) => void;
  details?: string;
  onDetailsChange?: (value: string) => void;
  detailsPlaceholder?: string;
}

const ICEYesNoQuestion: React.FC<ICEYesNoQuestionProps> = ({
  question,
  value,
  onChange,
  details,
  onDetailsChange,
  detailsPlaceholder = "Please provide details..."
}) => {
  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-white mb-3">{question}</label>
      <div className="flex space-x-6">
        <label className="flex items-center cursor-pointer">
          <input
            type="radio"
            name={question.replace(/\s+/g, '_')}
            value="yes"
            checked={value === 'yes'}
            onChange={(e) => onChange(e.target.value)}
            className="mr-2 w-4 h-4 text-blue-600 bg-slate-700 border-slate-600 focus:ring-blue-500"
          />
          <span className="text-slate-300">Yes</span>
        </label>
        <label className="flex items-center cursor-pointer">
          <input
            type="radio"
            name={question.replace(/\s+/g, '_')}
            value="no"
            checked={value === 'no'}
            onChange={(e) => onChange(e.target.value)}
            className="mr-2 w-4 h-4 text-blue-600 bg-slate-700 border-slate-600 focus:ring-blue-500"
          />
          <span className="text-slate-300">No</span>
        </label>
      </div>
      {value === 'yes' && details !== undefined && onDetailsChange && (
        <div className="mt-4">
          <label className="block text-sm font-medium text-slate-400 mb-2">Details:</label>
          <textarea
            value={details}
            onChange={(e) => onDetailsChange(e.target.value)}
            className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={3}
            placeholder={detailsPlaceholder}
          />
        </div>
      )}
    </div>
  );
};

export default ICEYesNoQuestion;