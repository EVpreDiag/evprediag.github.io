import React from 'react';
import { ICEDiagnosticFormData } from '../../../types/iceDiagnosticForm';
import ICEFormSection from './ICEFormSection';
import ICEYesNoQuestion from './ICEYesNoQuestion';

interface ICEElectricalSystemSectionProps {
  data: ICEDiagnosticFormData;
  onChange: (field: keyof ICEDiagnosticFormData, value: string | string[]) => void;
}

const ICEElectricalSystemSection: React.FC<ICEElectricalSystemSectionProps> = ({ data, onChange }) => {
  return (
    <ICEFormSection title="Electrical System">
      <div className="space-y-6">
        <ICEYesNoQuestion
          question="Are there battery issues?"
          value={data.batteryIssues}
          onChange={(value) => onChange('batteryIssues', value)}
          details={data.batteryDetails}
          onDetailsChange={(value) => onChange('batteryDetails', value)}
          detailsPlaceholder="Describe battery problems (won't hold charge, corrosion, age, etc.)"
        />

        <ICEYesNoQuestion
          question="Are there alternator issues?"
          value={data.alternatorIssues}
          onChange={(value) => onChange('alternatorIssues', value)}
          details={data.alternatorDetails}
          onDetailsChange={(value) => onChange('alternatorDetails', value)}
          detailsPlaceholder="Describe alternator problems (not charging, noisy, belt issues, etc.)"
        />

        <ICEYesNoQuestion
          question="Are there starter issues?"
          value={data.starterIssues}
          onChange={(value) => onChange('starterIssues', value)}
          details={data.starterDetails}
          onDetailsChange={(value) => onChange('starterDetails', value)}
          detailsPlaceholder="Describe starter problems (slow cranking, clicking sounds, won't engage, etc.)"
        />

        <ICEYesNoQuestion
          question="Is the check engine light on?"
          value={data.checkEngineLight}
          onChange={(value) => onChange('checkEngineLight', value)}
          details={data.checkEngineDetails}
          onDetailsChange={(value) => onChange('checkEngineDetails', value)}
          detailsPlaceholder="Describe check engine light behavior (constant, flashing, codes retrieved, etc.)"
        />
      </div>
    </ICEFormSection>
  );
};

export default ICEElectricalSystemSection;