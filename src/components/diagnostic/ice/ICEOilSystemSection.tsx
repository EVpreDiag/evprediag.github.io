import React from 'react';
import { ICEDiagnosticFormData } from '../../../types/iceDiagnosticForm';
import ICEFormSection from './ICEFormSection';
import ICEYesNoQuestion from './ICEYesNoQuestion';

interface ICEOilSystemSectionProps {
  data: ICEDiagnosticFormData;
  onChange: (field: keyof ICEDiagnosticFormData, value: string | string[]) => void;
}

const ICEOilSystemSection: React.FC<ICEOilSystemSectionProps> = ({ data, onChange }) => {
  return (
    <ICEFormSection title="Oil System">
      <div className="space-y-6">
        <ICEYesNoQuestion
          question="Are there oil pressure issues?"
          value={data.oilPressureIssues}
          onChange={(value) => onChange('oilPressureIssues', value)}
          details={data.oilPressureDetails}
          onDetailsChange={(value) => onChange('oilPressureDetails', value)}
          detailsPlaceholder="Describe oil pressure problems (low pressure warning, gauge readings, etc.)"
        />

        <ICEYesNoQuestion
          question="Are there oil leaks?"
          value={data.oilLeaks}
          onChange={(value) => onChange('oilLeaks', value)}
          details={data.oilLeakDetails}
          onDetailsChange={(value) => onChange('oilLeakDetails', value)}
          detailsPlaceholder="Describe oil leaks (location, severity, type of leak, etc.)"
        />

        <ICEYesNoQuestion
          question="Is there excessive oil consumption?"
          value={data.oilConsumption}
          onChange={(value) => onChange('oilConsumption', value)}
          details={data.oilConsumptionDetails}
          onDetailsChange={(value) => onChange('oilConsumptionDetails', value)}
          detailsPlaceholder="Describe oil consumption issues (how often oil needs to be added, blue smoke, etc.)"
        />
      </div>
    </ICEFormSection>
  );
};

export default ICEOilSystemSection;