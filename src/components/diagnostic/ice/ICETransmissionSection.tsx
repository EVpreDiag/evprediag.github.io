import React from 'react';
import { ICEDiagnosticFormData } from '../../../types/iceDiagnosticForm';
import ICEFormSection from './ICEFormSection';
import ICEYesNoQuestion from './ICEYesNoQuestion';

interface ICETransmissionSectionProps {
  data: ICEDiagnosticFormData;
  onChange: (field: keyof ICEDiagnosticFormData, value: string | string[]) => void;
}

const ICETransmissionSection: React.FC<ICETransmissionSectionProps> = ({ data, onChange }) => {
  return (
    <ICEFormSection title="Transmission">
      <div className="space-y-6">
        <ICEYesNoQuestion
          question="Are there transmission issues?"
          value={data.transmissionIssues}
          onChange={(value) => onChange('transmissionIssues', value)}
          details={data.transmissionDetails}
          onDetailsChange={(value) => onChange('transmissionDetails', value)}
          detailsPlaceholder="Describe transmission problems (slipping, leaking, overheating, etc.)"
        />

        <ICEYesNoQuestion
          question="Are there gear shifting problems?"
          value={data.gearShifting}
          onChange={(value) => onChange('gearShifting', value)}
          details={data.gearShiftingDetails}
          onDetailsChange={(value) => onChange('gearShiftingDetails', value)}
          detailsPlaceholder="Describe shifting issues (hard shifts, delayed shifts, won't shift, etc.)"
        />

        <ICEYesNoQuestion
          question="Are there clutch issues? (Manual transmission)"
          value={data.clutchIssues}
          onChange={(value) => onChange('clutchIssues', value)}
          details={data.clutchDetails}
          onDetailsChange={(value) => onChange('clutchDetails', value)}
          detailsPlaceholder="Describe clutch problems (slipping, hard to engage, noise, etc.)"
        />
      </div>
    </ICEFormSection>
  );
};

export default ICETransmissionSection;