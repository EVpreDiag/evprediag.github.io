import React from 'react';
import { ICEDiagnosticFormData } from '../../../types/iceDiagnosticForm';
import ICEFormSection from './ICEFormSection';
import ICEYesNoQuestion from './ICEYesNoQuestion';

interface ICECoolingSystemSectionProps {
  data: ICEDiagnosticFormData;
  onChange: (field: keyof ICEDiagnosticFormData, value: string | string[]) => void;
}

const ICECoolingSystemSection: React.FC<ICECoolingSystemSectionProps> = ({ data, onChange }) => {
  return (
    <ICEFormSection title="Cooling System">
      <div className="space-y-6">
        <ICEYesNoQuestion
          question="Is the engine overheating?"
          value={data.overheating}
          onChange={(value) => onChange('overheating', value)}
          details={data.overheatingDetails}
          onDetailsChange={(value) => onChange('overheatingDetails', value)}
          detailsPlaceholder="Describe overheating issues (temperature gauge reading, when it occurs, etc.)"
        />

        <ICEYesNoQuestion
          question="Are there coolant leaks?"
          value={data.coolantLeaks}
          onChange={(value) => onChange('coolantLeaks', value)}
          details={data.coolantLeakDetails}
          onDetailsChange={(value) => onChange('coolantLeakDetails', value)}
          detailsPlaceholder="Describe coolant leaks (location, severity, color of coolant, etc.)"
        />

        <ICEYesNoQuestion
          question="Are there radiator issues?"
          value={data.radiatorIssues}
          onChange={(value) => onChange('radiatorIssues', value)}
          details={data.radiatorDetails}
          onDetailsChange={(value) => onChange('radiatorDetails', value)}
          detailsPlaceholder="Describe radiator problems (clogged, damaged, fan issues, etc.)"
        />
      </div>
    </ICEFormSection>
  );
};

export default ICECoolingSystemSection;