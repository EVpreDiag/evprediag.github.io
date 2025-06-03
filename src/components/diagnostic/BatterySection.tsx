
import React from 'react';
import { FormProps } from '../../types/diagnosticForm';
import YesNoQuestion from './YesNoQuestion';

const BatterySection: React.FC<FormProps> = ({ formData, onInputChange, onCheckboxChange }) => (
  <div className="space-y-6">
    <YesNoQuestion 
      label="Any charging issues at home?" 
      field="chargingIssuesHome" 
      detailsField="chargingIssuesHomeDetails"
      formData={formData}
      onInputChange={onInputChange}
    />
    <YesNoQuestion 
      label="Any charging issues at public stations?" 
      field="chargingIssuesPublic" 
      detailsField="chargingIssuesPublicDetails"
      formData={formData}
      onInputChange={onInputChange}
    />
    
    <div>
      <label className="block text-sm font-medium text-slate-300 mb-2">Type of charger used</label>
      <select
        value={formData.chargerType}
        onChange={(e) => onInputChange('chargerType', e.target.value)}
        className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
      >
        <option value="">Select charger type</option>
        <option value="level1">Level 1 (120V)</option>
        <option value="level2">Level 2 (240V)</option>
        <option value="dcfast">DC Fast Charging</option>
        <option value="tesla">Tesla Supercharger</option>
      </select>
    </div>

    <YesNoQuestion 
      label="Using aftermarket charger?" 
      field="aftermarketCharger" 
      detailsField="aftermarketDetails"
      detailsLabel="Please specify brand, model, kW rating, and certification:"
      formData={formData}
      onInputChange={onInputChange}
    />
    
    <YesNoQuestion 
      label="Recent incomplete or failed charges?" 
      field="failedCharges" 
      detailsField="failedChargesDetails"
      formData={formData}
      onInputChange={onInputChange}
    />
    
    <YesNoQuestion 
      label="Drop in driving range?" 
      field="rangeDrop" 
      detailsField="rangeDropDetails"
      formData={formData}
      onInputChange={onInputChange}
    />
    
    <YesNoQuestion 
      label="Battery dashboard warnings?" 
      field="batteryWarnings" 
      detailsField="batteryWarningsDetails"
      formData={formData}
      onInputChange={onInputChange}
    />
    
    <YesNoQuestion 
      label="Sudden power loss or 'EV Power Limited' messages?" 
      field="powerLoss" 
      detailsField="powerLossDetails"
      formData={formData}
      onInputChange={onInputChange}
    />

    <div>
      <label className="block text-sm font-medium text-slate-300 mb-2">Usual charge level</label>
      <div className="flex space-x-4">
        <label className="flex items-center">
          <input
            type="radio"
            name="usualChargeLevel"
            value="80"
            checked={formData.usualChargeLevel === '80'}
            onChange={(e) => onInputChange('usualChargeLevel', e.target.value)}
            className="mr-2 text-blue-600"
          />
          <span className="text-slate-300">80%</span>
        </label>
        <label className="flex items-center">
          <input
            type="radio"
            name="usualChargeLevel"
            value="100"
            checked={formData.usualChargeLevel === '100'}
            onChange={(e) => onInputChange('usualChargeLevel', e.target.value)}
            className="mr-2 text-blue-600"
          />
          <span className="text-slate-300">100%</span>
        </label>
      </div>
    </div>

    <div>
      <label className="block text-sm font-medium text-slate-300 mb-2">DC fast charging frequency (select all that apply)</label>
      <div className="grid grid-cols-2 gap-2">
        {['Daily', 'Weekly', 'Monthly', 'Rarely', 'Never'].map(freq => (
          <label key={freq} className="flex items-center">
            <input
              type="checkbox"
              checked={formData.dcFastFrequency.includes(freq)}
              onChange={(e) => onCheckboxChange('dcFastFrequency', freq, e.target.checked)}
              className="mr-2 text-blue-600"
            />
            <span className="text-slate-300">{freq}</span>
          </label>
        ))}
      </div>
    </div>

    <YesNoQuestion 
      label="Charge rate drop above/below 50% SOC?" 
      field="chargeRateDrop"
      formData={formData}
      onInputChange={onInputChange}
    />
  </div>
);

export default BatterySection;
