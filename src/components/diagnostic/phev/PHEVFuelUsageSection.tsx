
import React from 'react';
import { PHEVFormProps } from '../../../types/phevDiagnosticForm';
import PHEVYesNoQuestion from './PHEVYesNoQuestion';

const PHEVFuelUsageSection: React.FC<PHEVFormProps> = ({ formData, onInputChange }) => (
  <div className="space-y-6">
    <div>
      <label className="block text-sm font-medium text-slate-300 mb-2">What type of fuel is being used?</label>
      <div className="flex space-x-4">
        {['91 RON', '95 RON', '98 RON'].map(fuel => (
          <label key={fuel} className="flex items-center">
            <input
              type="radio"
              name="fuelType"
              value={fuel}
              checked={formData.fuelType === fuel}
              onChange={(e) => onInputChange('fuelType', e.target.value)}
              className="mr-2 text-blue-600"
            />
            <span className="text-slate-300">{fuel}</span>
          </label>
        ))}
      </div>
    </div>

    <PHEVYesNoQuestion 
      label="Is the fuel from a known reliable source?" 
      field="fuelSource"
      formData={formData}
      onInputChange={onInputChange}
    />

    <div>
      <label className="block text-sm font-medium text-slate-300 mb-2">How often is the vehicle driven in petrol vs EV mode?</label>
      <textarea
        value={formData.petrolVsEvUsage}
        onChange={(e) => onInputChange('petrolVsEvUsage', e.target.value)}
        className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
        rows={3}
        placeholder="Describe usage pattern..."
      />
    </div>

    <PHEVYesNoQuestion 
      label="Has fuel economy changed noticeably?" 
      field="fuelEconomyChange" 
      detailsField="fuelEconomyDetails"
      formData={formData}
      onInputChange={onInputChange}
    />
  </div>
);

export default PHEVFuelUsageSection;
