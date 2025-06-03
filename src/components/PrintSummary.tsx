
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Printer, Download, Battery, AlertTriangle } from 'lucide-react';

interface DiagnosticRecord {
  id: string;
  customerName: string;
  vin: string;
  roNumber: string;
  makeModel: string;
  mileage: string;
  createdAt: string;
  technician: string;
  [key: string]: any;
}

const PrintSummary = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [record, setRecord] = useState<DiagnosticRecord | null>(null);

  useEffect(() => {
    const savedRecords = JSON.parse(localStorage.getItem('evDiagnosticRecords') || '[]');
    const foundRecord = savedRecords.find((r: DiagnosticRecord) => r.id === id);
    setRecord(foundRecord || null);
  }, [id]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    // In a real application, this would generate and download a PDF
    alert('PDF download functionality would be implemented here');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getYesNoIcon = (value: string) => {
    if (value === 'yes') return <span className="text-red-500 font-bold">⚠ YES</span>;
    if (value === 'no') return <span className="text-green-500">✓ NO</span>;
    return <span className="text-slate-400">-</span>;
  };

  const getSectionSummary = () => {
    if (!record) return [];
    
    const sections = [
      {
        title: 'Battery & Charging Issues',
        issues: [
          { label: 'Charging Issues at Home', value: record.chargingIssuesHome },
          { label: 'Charging Issues at Public Stations', value: record.chargingIssuesPublic },
          { label: 'Failed/Incomplete Charges', value: record.failedCharges },
          { label: 'Range Drop', value: record.rangeDrop },
          { label: 'Battery Warnings', value: record.batteryWarnings },
          { label: 'Power Loss/EV Power Limited', value: record.powerLoss }
        ]
      },
      {
        title: 'Drivetrain & Performance',
        issues: [
          { label: 'Inconsistent Acceleration', value: record.consistentAcceleration === 'no' ? 'yes' : 'no' },
          { label: 'Whining/Grinding Noises', value: record.whiningNoises },
          { label: 'Jerking/Hesitation', value: record.jerkingHesitation }
        ]
      },
      {
        title: 'NVH (Noise, Vibration, Harshness)',
        issues: [
          { label: 'Vibrations', value: record.vibrations },
          { label: 'Noises During Actions', value: record.noisesActions },
          { label: 'Rattles/Thumps', value: record.rattlesRoads }
        ]
      },
      {
        title: 'Climate Control',
        issues: [
          { label: 'HVAC Performance Issues', value: record.hvacPerformance === 'no' ? 'yes' : 'no' },
          { label: 'Smells/Noises from Vents', value: record.smellsNoises },
          { label: 'Defogger Issues', value: record.defoggerPerformance === 'no' ? 'yes' : 'no' }
        ]
      },
      {
        title: 'Electrical & Software',
        issues: [
          { label: 'Infotainment Glitches', value: record.infotainmentGlitches },
          { label: 'Features Broken After Update', value: record.brokenFeatures },
          { label: 'Light Flicker/Abnormal Behavior', value: record.lightFlicker }
        ]
      },
      {
        title: 'Regenerative Braking',
        issues: [
          { label: 'Rough Regenerative Braking', value: record.smoothRegen === 'no' ? 'yes' : 'no' },
          { label: 'Regen Strength Different', value: record.regenStrength },
          { label: 'Deceleration Noises', value: record.decelerationNoises }
        ]
      }
    ];

    return sections;
  };

  if (!record) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold text-white mb-2">Record Not Found</h2>
          <p className="text-slate-400 mb-4">The requested diagnostic record could not be found.</p>
          <button
            onClick={() => navigate('/search-records')}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            Back to Search
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header - Hidden in print */}
      <header className="bg-slate-800 border-b border-slate-700 px-6 py-4 print:hidden">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/search-records')}
              className="flex items-center space-x-2 text-slate-300 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Search</span>
            </button>
            <div>
              <h1 className="text-xl font-bold text-white">Diagnostic Summary</h1>
              <p className="text-sm text-slate-400">Print or download diagnostic report</p>
            </div>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={handleDownload}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
            >
              <Download className="w-5 h-5" />
              <span>Download PDF</span>
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              <Printer className="w-5 h-5" />
              <span>Print</span>
            </button>
          </div>
        </div>
      </header>

      {/* Print Content */}
      <div className="p-6 max-w-4xl mx-auto print:p-8 print:max-w-none">
        {/* Header Info */}
        <div className="bg-slate-800 print:bg-white print:border print:border-gray-300 rounded-lg p-6 mb-6 print:mb-4">
          <div className="flex items-center justify-between mb-6 print:mb-4">
            <div className="flex items-center space-x-3">
              <Battery className="w-8 h-8 text-blue-400 print:text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-white print:text-black">EV Diagnostic Report</h1>
                <p className="text-slate-400 print:text-gray-600">Pre-Check Assessment Summary</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-slate-400 print:text-gray-600">Generated: {formatDate(record.createdAt)}</p>
              <p className="text-sm text-slate-400 print:text-gray-600">Technician: {record.technician}</p>
            </div>
          </div>

          {/* Vehicle Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 print:grid-cols-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 print:text-gray-600 uppercase tracking-wider mb-1">Customer</label>
              <p className="text-white print:text-black font-medium">{record.customerName}</p>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 print:text-gray-600 uppercase tracking-wider mb-1">VIN</label>
              <p className="text-white print:text-black font-mono">{record.vin}</p>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 print:text-gray-600 uppercase tracking-wider mb-1">RO Number</label>
              <p className="text-white print:text-black">{record.roNumber}</p>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 print:text-gray-600 uppercase tracking-wider mb-1">Make/Model</label>
              <p className="text-white print:text-black">{record.makeModel}</p>
            </div>
          </div>
        </div>

        {/* Issues Summary */}
        <div className="bg-slate-800 print:bg-white print:border print:border-gray-300 rounded-lg p-6 mb-6 print:mb-4">
          <h2 className="text-lg font-semibold text-white print:text-black mb-4 flex items-center">
            <AlertTriangle className="w-5 h-5 mr-2 text-orange-400 print:text-orange-600" />
            Issues Summary
          </h2>
          
          <div className="space-y-6 print:space-y-4">
            {getSectionSummary().map((section, index) => {
              const hasIssues = section.issues.some(issue => issue.value === 'yes');
              
              return (
                <div key={index} className={`border rounded-lg p-4 ${hasIssues ? 'border-red-500/30 bg-red-500/5 print:border-red-300 print:bg-red-50' : 'border-slate-700 print:border-gray-300'}`}>
                  <h3 className="font-medium text-white print:text-black mb-3">{section.title}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 print:grid-cols-2">
                    {section.issues.map((issue, issueIndex) => (
                      <div key={issueIndex} className="flex items-center justify-between">
                        <span className="text-sm text-slate-300 print:text-gray-700">{issue.label}</span>
                        {getYesNoIcon(issue.value)}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Detailed Responses */}
        <div className="bg-slate-800 print:bg-white print:border print:border-gray-300 rounded-lg p-6 print:mb-4">
          <h2 className="text-lg font-semibold text-white print:text-black mb-4">Detailed Responses</h2>
          
          <div className="space-y-4 print:space-y-3">
            {/* Show only fields with details */}
            {Object.entries(record).filter(([key, value]) => 
              key.includes('Details') && value && value.trim() !== ''
            ).map(([key, value]) => (
              <div key={key} className="border-l-4 border-blue-500 pl-4 print:border-blue-400">
                <h4 className="font-medium text-white print:text-black text-sm mb-1">
                  {key.replace('Details', '').replace(/([A-Z])/g, ' $1').trim()}
                </h4>
                <p className="text-slate-300 print:text-gray-700 text-sm">{value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-slate-400 print:text-gray-600 pt-6 print:pt-4 border-t border-slate-700 print:border-gray-300">
          <p>This report was generated by the EV Diagnostic Portal</p>
          <p>For technical support, contact your system administrator</p>
        </div>
      </div>
    </div>
  );
};

export default PrintSummary;
