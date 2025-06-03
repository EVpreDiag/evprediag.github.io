
import React, { useCallback } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface FormSectionProps {
  title: string;
  children: React.ReactNode;
  sectionKey: string;
  expandedSections: string[];
  onToggleSection: (section: string) => void;
}

const FormSection = React.memo(({ 
  title, 
  children, 
  sectionKey,
  expandedSections,
  onToggleSection
}: FormSectionProps) => {
  const handleSectionToggle = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onToggleSection(sectionKey);
  }, [sectionKey, onToggleSection]);

  return (
    <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
      <button
        type="button"
        onClick={handleSectionToggle}
        className="w-full px-6 py-4 bg-slate-700/50 flex items-center justify-between text-left hover:bg-slate-700/70 transition-colors"
      >
        <h3 className="text-lg font-semibold text-white">{title}</h3>
        {expandedSections.includes(sectionKey) ? (
          <ChevronUp className="w-5 h-5 text-slate-400" />
        ) : (
          <ChevronDown className="w-5 h-5 text-slate-400" />
        )}
      </button>
      {expandedSections.includes(sectionKey) && (
        <div className="p-6 space-y-6">
          {children}
        </div>
      )}
    </div>
  );
});

FormSection.displayName = 'FormSection';

export default FormSection;
