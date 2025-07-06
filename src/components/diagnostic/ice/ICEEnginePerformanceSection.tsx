import React from 'react';
import { ICEDiagnosticFormData } from '../../../types/iceDiagnosticForm';
import ICEFormSection from './ICEFormSection';
import ICEYesNoQuestion from './ICEYesNoQuestion';

interface ICEEnginePerformanceSectionProps {
  data: ICEDiagnosticFormData;
  onChange: (field: keyof ICEDiagnosticFormData, value: string | string[]) => void;
}

const ICEEnginePerformanceSection: React.FC<ICEEnginePerformanceSectionProps> = ({ data, onChange }) => {
  return (
    <ICEFormSection title="Engine Performance">
      <div className="space-y-6">
        <ICEYesNoQuestion
          question="Does the engine have trouble starting?"
          value={data.engineStarting}
          onChange={(value) => onChange('engineStarting', value)}
          details={data.engineStartingDetails}
          onDetailsChange={(value) => onChange('engineStartingDetails', value)}
          detailsPlaceholder="Describe starting issues (hard to start, cranks but won't start, etc.)"
        />

        <ICEYesNoQuestion
          question="Is there poor idle quality?"
          value={data.idleQuality}
          onChange={(value) => onChange('idleQuality', value)}
          details={data.idleQualityDetails}
          onDetailsChange={(value) => onChange('idleQualityDetails', value)}
          detailsPlaceholder="Describe idle issues (rough idle, high/low idle speed, stalling, etc.)"
        />

        <ICEYesNoQuestion
          question="Are there acceleration issues?"
          value={data.accelerationIssues}
          onChange={(value) => onChange('accelerationIssues', value)}
          details={data.accelerationDetails}
          onDetailsChange={(value) => onChange('accelerationDetails', value)}
          detailsPlaceholder="Describe acceleration problems (hesitation, lack of power, jerking, etc.)"
        />

        <ICEYesNoQuestion
          question="Is there noticeable power loss?"
          value={data.powerLoss}
          onChange={(value) => onChange('powerLoss', value)}
          details={data.powerLossDetails}
          onDetailsChange={(value) => onChange('powerLossDetails', value)}
          detailsPlaceholder="Describe power loss (gradual or sudden, under what conditions, etc.)"
        />

        <ICEYesNoQuestion
          question="Does the engine stall unexpectedly?"
          value={data.engineStalling}
          onChange={(value) => onChange('engineStalling', value)}
          details={data.engineStallingDetails}
          onDetailsChange={(value) => onChange('engineStallingDetails', value)}
          detailsPlaceholder="Describe stalling incidents (when it happens, frequency, etc.)"
        />

        <ICEYesNoQuestion
          question="Does the engine run rough?"
          value={data.roughRunning}
          onChange={(value) => onChange('roughRunning', value)}
          details={data.roughRunningDetails}
          onDetailsChange={(value) => onChange('roughRunningDetails', value)}
          detailsPlaceholder="Describe rough running (misfiring, uneven running, etc.)"
        />
      </div>
    </ICEFormSection>
  );
};

export default ICEEnginePerformanceSection;