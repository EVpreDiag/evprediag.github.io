
import React from 'react';
import { PHEVFormProps } from '../../../types/phevDiagnosticForm';

const PHEVGeneralInfoSection: React.FC<PHEVFormProps> = ({ formData, onInputChange }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
    <div>
      <label className="block text-sm font-medium text-slate-300 mb-2">Customer Name</label>
      <input
        type="text"
        value={formData.customerName}
        onChange={(e) => onInputChange('customerName', e.target.value)}
        className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
        required
      />
    </div>
    <div>
      <label className="block text-sm font-medium text-slate-300 mb-2">VIN</label>
      <input
        type="text"
        value={formData.vin}
        onChange={(e) => onInputChange('vin', e.target.value)}
        className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
        required
      />
    </div>
    <div>
      <label className="block text-sm font-medium text-slate-300 mb-2">RO Number</label>
      <input
        type="text"
        value={formData.roNumber}
        onChange={(e) => onInputChange('roNumber', e.target.value)}
        className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
        required
      />
    </div>
    <div>
      <label className="block text-sm font-medium text-slate-300 mb-2">Vehicle Make</label>
      <input
        type="text"
        value={formData.vehicleMake}
        onChange={(e) => onInputChange('vehicleMake', e.target.value)}
        className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
        required
      />
    </div>
    <div>
      <label className="block text-sm font-medium text-slate-300 mb-2">Model</label>
      <input
        type="text"
        value={formData.model}
        onChange={(e) => onInputChange('model', e.target.value)}
        className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
        required
      />
    </div>
    <div>
      <label className="block text-sm font-medium text-slate-300 mb-2">Mileage</label>
      <input
        type="text"
        value={formData.mileage}
        onChange={(e) => onInputChange('mileage', e.target.value)}
        className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
        required
      />
    </div>
  </div>
);

export default PHEVGeneralInfoSection;
