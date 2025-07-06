import React from 'react';
import { ICEDiagnosticFormData } from '../../../types/iceDiagnosticForm';
import FormSection from '../FormSection';
import YesNoQuestion from '../YesNoQuestion';

interface ICEFuelSystemSectionProps {
  data: ICEDiagnosticFormData;
  onChange: (field: keyof ICEDiagnosticFormData, value: string | string[]) => void;
}

const ICEFuelSystemSection: React.FC<ICEFuelSystemSectionProps> = ({ data, onChange }) => {
  return (
    <FormSection title="Fuel System" icon="⛽">
      <div className="space-y-6">
        <YesNoQuestion
          question="Is there poor fuel consumption/economy?"
          value={data.fuelConsumption}
          onChange={(value) => onChange('fuelConsumption', value)}
          details={data.fuelConsumptionDetails}
          onDetailsChange={(value) => onChange('fuelConsumptionDetails', value)}
          detailsPlaceholder="Describe fuel consumption issues (how much worse than normal, recent changes, etc.)"
        />

        <YesNoQuestion
          question="Are there fuel quality issues?"
          value={data.fuelQualityIssues}
          onChange={(value) => onChange('fuelQualityIssues', value)}
          details={data.fuelQualityDetails}
          onDetailsChange={(value) => onChange('fuelQualityDetails', value)}
          detailsPlaceholder="Describe fuel quality concerns (contamination, water, wrong fuel type, etc.)"
        />

        <YesNoQuestion
          question="Are there fuel pump issues?"
          value={data.fuelPumpIssues}
          onChange={(value) => onChange('fuelPumpIssues', value)}
          details={data.fuelPumpDetails}
          onDetailsChange={(value) => onChange('fuelPumpDetails', value)}
          detailsPlaceholder="Describe fuel pump problems (noise, pressure issues, intermittent operation, etc.)"
        />
      </div>
    </FormSection>
  );
};

export default ICEFuelSystemSection;