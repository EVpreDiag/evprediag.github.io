
import React from 'react';
import { FormProps } from '../../types/diagnosticForm';
import YesNoQuestion from './YesNoQuestion';

const DrivetrainSection: React.FC<FormProps> = ({ formData, onInputChange }) => (
  <div className="space-y-6">
    <YesNoQuestion 
      label="Consistent acceleration?" 
      field="consistentAcceleration" 
      detailsField="accelerationDetails"
      formData={formData}
      onInputChange={onInputChange}
    />
    <YesNoQuestion 
      label="Whining or grinding noises?" 
      field="whiningNoises" 
      detailsField="whiningDetails"
      formData={formData}
      onInputChange={onInputChange}
    />
    <YesNoQuestion 
      label="Jerking or hesitation under acceleration?" 
      field="jerkingHesitation" 
      detailsField="jerkingDetails"
      formData={formData}
      onInputChange={onInputChange}
    />
  </div>
);

export default DrivetrainSection;
