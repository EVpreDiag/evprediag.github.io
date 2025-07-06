import React from 'react';

interface ICEFormSectionProps {
  title: string;
  children: React.ReactNode;
}

const ICEFormSection: React.FC<ICEFormSectionProps> = ({ title, children }) => {
  return (
    <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
      <h3 className="text-lg font-semibold text-white mb-6">{title}</h3>
      {children}
    </div>
  );
};

export default ICEFormSection;