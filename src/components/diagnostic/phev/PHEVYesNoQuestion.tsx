
import React from 'react';
import { PHEVFormData } from '../../../types/phevDiagnosticForm';

interface PHEVYesNoQuestionProps {
  label: string;
  field: keyof PHEVFormData;
  detailsField?: keyof PHEVFormData;
  detailsLabel?: string;
  formData: PHEVFormData;
  onInputChange: (field: keyof PHEVFormData, value: string) => void;
}

const PHEVYesNoQuestion = React.memo(({ 
  label, 
  field, 
  detailsField, 
  detailsLabel = "Please provide details:",
  formData,
  onInputChange
}: PHEVYesNoQuestionProps) => (
  <div className="space-y-3">
    <label className="block text-sm font-medium text-slate-300">{label}</label>
    <div className="flex space-x-4">
      <label className="flex items-center">
        <input
          type="radio"
          name={String(field)}
          value="yes"
          checked={formData[field] === 'yes'}
          onChange={(e) => onInputChange(field, e.target.value)}
          className="mr-2 text-blue-600"
        />
        <span className="text-slate-300">Yes</span>
      </label>
      <label className="flex items-center">
        <input
          type="radio"
          name={String(field)}
          value="no"
          checked={formData[field] === 'no'}
          onChange={(e) => onInputChange(field, e.target.value)}
          className="mr-2 text-blue-600"
        />
        <span className="text-slate-300">No</span>
      </label>
    </div>
    {formData[field] === 'yes' && detailsField && (
      <div>
        <label className="block text-sm font-medium text-slate-400 mb-2">{detailsLabel}</label>
        <textarea
          value={String(formData[detailsField] || '')}
          onChange={(e) => onInputChange(detailsField, e.target.value)}
          className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
          rows={3}
        />
      </div>
    )}
  </div>
));

PHEVYesNoQuestion.displayName = 'PHEVYesNoQuestion';

export default PHEVYesNoQuestion;
