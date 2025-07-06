import React from 'react';
import { ICEDiagnosticFormData } from '../../../types/iceDiagnosticForm';
import FormSection from '../FormSection';
import YesNoQuestion from '../YesNoQuestion';

interface ICEEngineNoisesSectionProps {
  data: ICEDiagnosticFormData;
  onChange: (field: keyof ICEDiagnosticFormData, value: string | string[]) => void;
}

const ICEEngineNoisesSection: React.FC<ICEEngineNoisesSectionProps> = ({ data, onChange }) => {
  return (
    <FormSection title="Engine Noises & Vibrations" icon="🔊">
      <div className="space-y-6">
        <YesNoQuestion
          question="Is there engine knocking or pinging?"
          value={data.engineKnocking}
          onChange={(value) => onChange('engineKnocking', value)}
          details={data.engineKnockingDetails}
          onDetailsChange={(value) => onChange('engineKnockingDetails', value)}
          detailsPlaceholder="Describe knocking sounds (when it occurs, intensity, etc.)"
        />

        <YesNoQuestion
          question="Are there unusual engine noises?"
          value={data.unusualNoises}
          onChange={(value) => onChange('unusualNoises', value)}
          details={data.unusualNoisesDetails}
          onDetailsChange={(value) => onChange('unusualNoisesDetails', value)}
          detailsPlaceholder="Describe unusual noises (grinding, whining, clicking, etc.)"
        />

        <YesNoQuestion
          question="Is there excessive vibration?"
          value={data.excessiveVibration}
          onChange={(value) => onChange('excessiveVibration', value)}
          details={data.vibrationDetails}
          onDetailsChange={(value) => onChange('vibrationDetails', value)}
          detailsPlaceholder="Describe vibration issues (when it occurs, intensity, location, etc.)"
        />
      </div>
    </FormSection>
  );
};

export default ICEEngineNoisesSection;