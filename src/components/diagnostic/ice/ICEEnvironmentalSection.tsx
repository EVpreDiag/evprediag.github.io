import React from 'react';
import { ICEDiagnosticFormData } from '../../../types/iceDiagnosticForm';
import ICEFormSection from './ICEFormSection';

interface ICEEnvironmentalSectionProps {
  data: ICEDiagnosticFormData;
  onChange: (field: keyof ICEDiagnosticFormData, value: string | string[]) => void;
}

const ICEEnvironmentalSection: React.FC<ICEEnvironmentalSectionProps> = ({ data, onChange }) => {
  const drivingConditionOptions = [
    'City driving',
    'Highway driving',
    'Stop-and-go traffic',
    'Towing',
    'Mountain/hills',
    'Extreme weather',
    'Short trips',
    'Racing/performance driving'
  ];

  const handleDrivingConditionChange = (condition: string, checked: boolean) => {
    const current = data.drivingConditions || [];
    if (checked) {
      onChange('drivingConditions', [...current, condition]);
    } else {
      onChange('drivingConditions', current.filter(c => c !== condition));
    }
  };

  return (
    <ICEFormSection title="Environmental Conditions & History">
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2 text-white">
            Temperature during issue
          </label>
          <select
            value={data.temperatureDuringIssue}
            onChange={(e) => onChange('temperatureDuringIssue', e.target.value)}
            className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select temperature range</option>
            <option value="Very Cold (Below 32°F)">Very Cold (Below 32°F)</option>
            <option value="Cold (32-50°F)">Cold (32-50°F)</option>
            <option value="Cool (50-70°F)">Cool (50-70°F)</option>
            <option value="Moderate (70-85°F)">Moderate (70-85°F)</option>
            <option value="Hot (85-100°F)">Hot (85-100°F)</option>
            <option value="Very Hot (Above 100°F)">Very Hot (Above 100°F)</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-4 text-white">
            Driving conditions when issues occur (check all that apply)
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {drivingConditionOptions.map((condition) => (
              <label key={condition} className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={data.drivingConditions?.includes(condition) || false}
                  onChange={(e) => handleDrivingConditionChange(condition, e.target.checked)}
                  className="w-4 h-4 text-blue-600 bg-slate-700 border-slate-600 rounded focus:ring-blue-500"
                />
                <span className="text-slate-300 text-sm">{condition}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2 text-white">
            Other driving conditions
          </label>
          <textarea
            value={data.otherDrivingConditions}
            onChange={(e) => onChange('otherDrivingConditions', e.target.value)}
            className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={3}
            placeholder="Describe any other specific driving conditions or circumstances..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2 text-white">
            Maintenance history
          </label>
          <textarea
            value={data.maintenanceHistory}
            onChange={(e) => onChange('maintenanceHistory', e.target.value)}
            className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={4}
            placeholder="Describe recent maintenance (oil changes, tune-ups, repairs, etc.)"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2 text-white">
            Recent repairs
          </label>
          <textarea
            value={data.recentRepairs}
            onChange={(e) => onChange('recentRepairs', e.target.value)}
            className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={4}
            placeholder="Describe any recent repairs or modifications..."
          />
        </div>
      </div>
    </ICEFormSection>
  );
};

export default ICEEnvironmentalSection;