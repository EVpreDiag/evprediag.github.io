import React from 'react';
import { ICEDiagnosticFormData } from '../../../types/iceDiagnosticForm';
import ICEFormSection from './ICEFormSection';
import { VehicleCombobox } from '../../ui/vehicle-combobox';

interface ICEGeneralInfoSectionProps {
  data: ICEDiagnosticFormData;
  onChange: (field: keyof ICEDiagnosticFormData, value: string | string[]) => void;
}

const ICEGeneralInfoSection: React.FC<ICEGeneralInfoSectionProps> = ({ data, onChange }) => {
  return (
    <ICEFormSection title="General Information">
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-2 text-white">
              Customer Name *
            </label>
            <input
              type="text"
              value={data.customerName}
              onChange={(e) => onChange('customerName', e.target.value)}
              className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter customer name"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-white">
              VIN *
            </label>
            <input
              type="text"
              value={data.vin}
              onChange={(e) => onChange('vin', e.target.value.toUpperCase())}
              className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter VIN"
              maxLength={17}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-white">
              RO Number *
            </label>
            <input
              type="text"
              value={data.roNumber}
              onChange={(e) => onChange('roNumber', e.target.value)}
              className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter repair order number"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-white">
              Year
            </label>
            <input
              type="text"
              value={data.year}
              onChange={(e) => onChange('year', e.target.value)}
              className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., 2020"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-white">
              Mileage
            </label>
            <input
              type="text"
              value={data.mileage}
              onChange={(e) => onChange('mileage', e.target.value)}
              className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., 75,000 miles"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-white">
              Engine Size
            </label>
            <input
              type="text"
              value={data.engineSize}
              onChange={(e) => onChange('engineSize', e.target.value)}
              className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., 2.0L, 3.5L V6, 5.0L V8"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-white">
              Fuel Type
            </label>
            <select
              value={data.fuelType}
              onChange={(e) => onChange('fuelType', e.target.value)}
              className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select fuel type</option>
              <option value="Regular Gasoline">Regular Gasoline</option>
              <option value="Premium Gasoline">Premium Gasoline</option>
              <option value="Diesel">Diesel</option>
              <option value="E85">E85</option>
              <option value="CNG">CNG</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>
        
        <VehicleCombobox
          make={data.vehicleMake || ''}
          model={data.model || ''}
          onMakeChange={(make) => onChange('vehicleMake', make)}
          onModelChange={(model) => onChange('model', model)}
        />
      </div>
    </ICEFormSection>
  );
};

export default ICEGeneralInfoSection;