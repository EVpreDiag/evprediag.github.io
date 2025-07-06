import React from 'react';
import { ICEDiagnosticFormData } from '../../../types/iceDiagnosticForm';
import ICEFormSection from './ICEFormSection';
import ICEYesNoQuestion from './ICEYesNoQuestion';

interface ICEEngineNoisesSectionProps {
  data: ICEDiagnosticFormData;
  onChange: (field: keyof ICEDiagnosticFormData, value: string | string[]) => void;
}

const ICEEngineNoisesSection: React.FC<ICEEngineNoisesSectionProps> = ({ data, onChange }) => {
  return (
    <ICEFormSection title="Engine Noises & Vibrations">
      <div className="space-y-6">
        <ICEYesNoQuestion
          question="Is there engine knocking or pinging?"
          value={data.engineKnocking}
          onChange={(value) => onChange('engineKnocking', value)}
          details={data.engineKnockingDetails}
          onDetailsChange={(value) => onChange('engineKnockingDetails', value)}
          detailsPlaceholder="Describe knocking sounds (when it occurs, intensity, etc.)"
        />

        <ICEYesNoQuestion
          question="Are there unusual engine noises?"
          value={data.unusualNoises}
          onChange={(value) => onChange('unusualNoises', value)}
          details={data.unusualNoisesDetails}
          onDetailsChange={(value) => onChange('unusualNoisesDetails', value)}
          detailsPlaceholder="Describe unusual noises (grinding, whining, clicking, etc.)"
        />

        <ICEYesNoQuestion
          question="Is there excessive vibration?"
          value={data.excessiveVibration}
          onChange={(value) => onChange('excessiveVibration', value)}
          details={data.vibrationDetails}
          onDetailsChange={(value) => onChange('vibrationDetails', value)}
          detailsPlaceholder="Describe vibration issues (when it occurs, intensity, location, etc.)"
        />
      </div>
    </ICEFormSection>
  );
};

export default ICEEngineNoisesSection;