import React from 'react';
import { Combobox } from './combobox';
import { getAllMakes, getModelsForMake } from '../../data/vehicleData';

interface VehicleComboboxProps {
  make: string;
  model: string;
  onMakeChange: (make: string) => void;
  onModelChange: (model: string) => void;
  className?: string;
}

export const VehicleCombobox: React.FC<VehicleComboboxProps> = ({
  make,
  model,
  onMakeChange,
  onModelChange,
  className
}) => {
  const makeOptions = getAllMakes().map(m => ({ value: m, label: m }));
  const modelOptions = getModelsForMake(make).map(m => ({ value: m, label: m }));

  const handleMakeChange = (newMake: string) => {
    onMakeChange(newMake);
    // Clear model when make changes to avoid invalid combinations
    if (make !== newMake) {
      onModelChange('');
    }
  };

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 gap-6 ${className}`}>
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">Vehicle Make</label>
        <Combobox
          value={make}
          onValueChange={handleMakeChange}
          options={makeOptions}
          placeholder="Search or enter make..."
          searchPlaceholder="Search makes..."
          emptyText="No makes found."
          allowCustom={true}
          className="w-full"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">Model</label>
        <Combobox
          value={model}
          onValueChange={onModelChange}
          options={modelOptions}
          placeholder="Search or enter model..."
          searchPlaceholder="Search models..."
          emptyText={make ? "No models found for this make." : "Select a make first."}
          allowCustom={true}
          className="w-full"
        />
      </div>
    </div>
  );
};