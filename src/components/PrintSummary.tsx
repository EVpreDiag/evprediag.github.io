import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Printer, Download, Battery, AlertTriangle } from 'lucide-react';
import { supabase } from '../integrations/supabase/client';

interface DiagnosticRecord {
  id: string;
  customer_name: string;
  vin: string;
  ro_number: string;
  make_model?: string;
  vehicle_make?: string;
  model?: string;
  mileage: string;
  created_at: string;
  technician_id: string;
  record_type: 'ev' | 'phev';
  [key: string]: any;
}

const PrintSummary = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [record, setRecord] = useState<DiagnosticRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRecord = async () => {
      if (!id) {
        setError('No record ID provided');
        setLoading(false);
        return;
      }

      try {
        console.log('Fetching record with ID:', id);
        const recordType = searchParams.get('type');
        console.log('Record type from URL:', recordType);

        let recordData = null;
        let finalRecordType: 'ev' | 'phev' = 'ev';

        // If type is specified in URL, try that table first
        if (recordType === 'ev') {
          const { data: evRecord, error: evError } = await supabase
            .from('ev_diagnostic_records')
            .select('*')
            .eq('id', id)
            .maybeSingle();

          if (!evError && evRecord) {
            recordData = evRecord;
            finalRecordType = 'ev';
          }
        } else if (recordType === 'phev') {
          const { data: phevRecord, error: phevError } = await supabase
            .from('phev_diagnostic_records')
            .select('*')
            .eq('id', id)
            .maybeSingle();

          if (!phevError && phevRecord) {
            recordData = phevRecord;
            finalRecordType = 'phev';
          }
        }

        // If not found or no type specified, try both tables
        if (!recordData) {
          // Try EV records first
          const { data: evRecord, error: evError } = await supabase
            .from('ev_diagnostic_records')
            .select('*')
            .eq('id', id)
            .maybeSingle();

          if (!evError && evRecord) {
            recordData = evRecord;
            finalRecordType = 'ev';
          } else {
            // Try PHEV records
            const { data: phevRecord, error: phevError } = await supabase
              .from('phev_diagnostic_records')
              .select('*')
              .eq('id', id)
              .maybeSingle();

            if (!phevError && phevRecord) {
              recordData = phevRecord;
              finalRecordType = 'phev';
            }
          }
        }

        if (recordData) {
          const formattedRecord: DiagnosticRecord = {
            ...recordData,
            customer_name: recordData.customer_name,
            make_model: finalRecordType === 'ev' 
              ? recordData.make_model || ''
              : `${recordData.vehicle_make || ''} ${recordData.model || ''}`.trim(),
            created_at: recordData.created_at,
            technician_id: recordData.technician_id || 'Unknown',
            record_type: finalRecordType
          };

          console.log('Record found:', formattedRecord);
          setRecord(formattedRecord);
        } else {
          console.log('No record found with ID:', id);
          setError('Record not found');
        }
      } catch (err) {
        console.error('Error fetching record:', err);
        setError('Failed to fetch record');
      } finally {
        setLoading(false);
      }
    };

    fetchRecord();
  }, [id, searchParams]);

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
    
    if (record.record_type === 'ev') {
      return [
        {
          title: 'Battery & Charging Issues',
          issues: [
            { label: 'Charging Issues at Home', value: record.charging_issues_home },
            { label: 'Charging Issues at Public Stations', value: record.charging_issues_public },
            { label: 'Failed/Incomplete Charges', value: record.failed_charges },
            { label: 'Range Drop', value: record.range_drop },
            { label: 'Battery Warnings', value: record.battery_warnings },
            { label: 'Power Loss/EV Power Limited', value: record.power_loss }
          ]
        },
        {
          title: 'Drivetrain & Performance',
          issues: [
            { label: 'Inconsistent Acceleration', value: record.consistent_acceleration === 'no' ? 'yes' : 'no' },
            { label: 'Whining/Grinding Noises', value: record.whining_noises },
            { label: 'Jerking/Hesitation', value: record.jerking_hesitation }
          ]
        },
        {
          title: 'NVH (Noise, Vibration, Harshness)',
          issues: [
            { label: 'Vibrations', value: record.vibrations },
            { label: 'Noises During Actions', value: record.noises_actions },
            { label: 'Rattles/Thumps', value: record.rattles_roads }
          ]
        },
        {
          title: 'Climate Control',
          issues: [
            { label: 'HVAC Performance Issues', value: record.hvac_performance === 'no' ? 'yes' : 'no' },
            { label: 'Smells/Noises from Vents', value: record.smells_noises },
            { label: 'Defogger Issues', value: record.defogger_performance === 'no' ? 'yes' : 'no' }
          ]
        },
        {
          title: 'Electrical & Software',
          issues: [
            { label: 'Infotainment Glitches', value: record.infotainment_glitches },
            { label: 'Features Broken After Update', value: record.broken_features },
            { label: 'Light Flicker/Abnormal Behavior', value: record.light_flicker }
          ]
        },
        {
          title: 'Regenerative Braking',
          issues: [
            { label: 'Rough Regenerative Braking', value: record.smooth_regen === 'no' ? 'yes' : 'no' },
            { label: 'Regen Strength Different', value: record.regen_strength },
            { label: 'Deceleration Noises', value: record.deceleration_noises }
          ]
        }
      ];
    } else {
      // PHEV sections
      return [
        {
          title: 'Battery & Charging Issues',
          issues: [
            { label: 'Battery Charging Issues', value: record.battery_charging === 'no' ? 'yes' : 'no' },
            { label: 'EV Range Not As Expected', value: record.ev_range_expected === 'no' ? 'yes' : 'no' },
            { label: 'Excessive ICE Operation', value: record.excessive_ice_operation },
            { label: 'Charge Rate Drop', value: record.charge_rate_drop }
          ]
        },
        {
          title: 'Hybrid Operation',
          issues: [
            { label: 'Switching Lags/Delays', value: record.switching_lags },
            { label: 'Engine Start in EV Mode', value: record.engine_start_ev_mode },
            { label: 'Abnormal Vibrations', value: record.abnormal_vibrations }
          ]
        },
        {
          title: 'Engine & Drivetrain',
          issues: [
            { label: 'Acceleration Issues', value: record.acceleration_issues },
            { label: 'Engine Sound Different', value: record.engine_sound },
            { label: 'Burning Smell', value: record.burning_smell },
            { label: 'Misfires/Rough Running', value: record.misfires }
          ]
        },
        {
          title: 'Climate Control',
          issues: [
            { label: 'HVAC Effectiveness Issues', value: record.hvac_effectiveness === 'no' ? 'yes' : 'no' },
            { label: 'Fan Sounds/Noises', value: record.fan_sounds },
            { label: 'Temperature Regulation Issues', value: record.temperature_regulation === 'no' ? 'yes' : 'no' }
          ]
        },
        {
          title: 'Electrical & Software',
          issues: [
            { label: 'Infotainment Glitches', value: record.infotainment_glitches },
            { label: 'Features Broken After Update', value: record.broken_features },
            { label: 'Light Flicker/Abnormal Behavior', value: record.light_flicker }
          ]
        },
        {
          title: 'Regenerative Braking',
          issues: [
            { label: 'Rough Regenerative Braking', value: record.smooth_regen === 'no' ? 'yes' : 'no' },
            { label: 'Regen Strength Different', value: record.regen_strength },
            { label: 'Deceleration Noises', value: record.deceleration_noises }
          ]
        }
      ];
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400 mx-auto mb-4"></div>
          <h2 className="text-xl font-bold text-white mb-2">Loading Record</h2>
          <p className="text-slate-400">Fetching diagnostic record...</p>
        </div>
      </div>
    );
  }

  if (error || !record) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold text-white mb-2">Record Not Found</h2>
          <p className="text-slate-400 mb-4">{error || 'The requested diagnostic record could not be found.'}</p>
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
                <h1 className="text-2xl font-bold text-white print:text-black">
                  {record.record_type === 'ev' ? 'EV' : 'PHEV'} Diagnostic Report
                </h1>
                <p className="text-slate-400 print:text-gray-600">Pre-Check Assessment Summary</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-slate-400 print:text-gray-600">Generated: {formatDate(record.created_at)}</p>
              <p className="text-sm text-slate-400 print:text-gray-600">Technician: {record.technician_id}</p>
            </div>
          </div>

          {/* Vehicle Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 print:grid-cols-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 print:text-gray-600 uppercase tracking-wider mb-1">Customer</label>
              <p className="text-white print:text-black font-medium">{record.customer_name}</p>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 print:text-gray-600 uppercase tracking-wider mb-1">VIN</label>
              <p className="text-white print:text-black font-mono">{record.vin}</p>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 print:text-gray-600 uppercase tracking-wider mb-1">RO Number</label>
              <p className="text-white print:text-black">{record.ro_number}</p>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 print:text-gray-600 uppercase tracking-wider mb-1">Make/Model</label>
              <p className="text-white print:text-black">{record.make_model}</p>
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
              key.includes('_details') && value && value.toString().trim() !== ''
            ).map(([key, value]) => (
              <div key={key} className="border-l-4 border-blue-500 pl-4 print:border-blue-400">
                <h4 className="font-medium text-white print:text-black text-sm mb-1">
                  {key.replace('_details', '').replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
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
