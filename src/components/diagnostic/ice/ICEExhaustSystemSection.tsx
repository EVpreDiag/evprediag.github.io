import React from 'react';
import { ICEDiagnosticFormData } from '../../../types/iceDiagnosticForm';
import ICEFormSection from './ICEFormSection';
import ICEYesNoQuestion from './ICEYesNoQuestion';

interface ICEExhaustSystemSectionProps {
  data: ICEDiagnosticFormData;
  onChange: (field: keyof ICEDiagnosticFormData, value: string | string[]) => void;
}

const ICEExhaustSystemSection: React.FC<ICEExhaustSystemSectionProps> = ({ data, onChange }) => {
  return (
    <ICEFormSection title="Exhaust System">
      <div className="space-y-6">
        <ICEYesNoQuestion
          question="Is there abnormal exhaust smoke?"
          value={data.exhaustSmoke}
          onChange={(value) => onChange('exhaustSmoke', value)}
          details={data.exhaustSmokeDetails}
          onDetailsChange={(value) => onChange('exhaustSmokeDetails', value)}
          detailsPlaceholder="Describe exhaust smoke (color: black, blue, white; when it occurs, etc.)"
        />

        <ICEYesNoQuestion
          question="Is there unusual exhaust smell?"
          value={data.exhaustSmell}
          onChange={(value) => onChange('exhaustSmell', value)}
          details={data.exhaustSmellDetails}
          onDetailsChange={(value) => onChange('exhaustSmellDetails', value)}
          detailsPlaceholder="Describe exhaust smell (sweet, burning, fuel, etc.)"
        />

        <ICEYesNoQuestion
          question="Are there catalytic converter issues?"
          value={data.catalyticConverterIssues}
          onChange={(value) => onChange('catalyticConverterIssues', value)}
          details={data.catalyticConverterDetails}
          onDetailsChange={(value) => onChange('catalyticConverterDetails', value)}
          detailsPlaceholder="Describe catalytic converter problems (rotten egg smell, rattling, reduced performance, etc.)"
        />
      </div>
    </ICEFormSection>
  );
};

export default ICEExhaustSystemSection;