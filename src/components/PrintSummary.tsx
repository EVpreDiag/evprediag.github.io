import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Printer, Download, Battery, AlertTriangle, CheckCircle } from 'lucide-react';
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
  const { type, id } = useParams<{ type?: string; id?: string }>();
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
        const recordType = type;
        console.log('Record type from URL params:', recordType);

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
  }, [id, type]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = async () => {
    const element = document.getElementById('print-section');
    if (!element) return;
    const html2pdf = (await import('html2pdf.js')).default;
    html2pdf()
      .from(element)
      .set({
        margin: 0.5,
        filename: `diagnostic-report-${record?.id ?? 'report'}.pdf`,
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
      })
      .save();
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
    if (value === 'yes') return <span className="text-red-500 print:text-red-600 font-bold text-xs">⚠ YES</span>;
    if (value === 'no') return <span className="text-green-500 print:text-green-600 text-xs">✓ NO</span>;
    return <span className="text-slate-400 print:text-gray-500 text-xs">-</span>;
  };

  const formatFieldName = (fieldName: string) => {
    return fieldName
      .replace(/_/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase())
      .replace(/Hvac/g, 'HVAC')
      .replace(/Nvh/g, 'NVH')
      .replace(/Ev/g, 'EV')
      .replace(/Ice/g, 'ICE')
      .replace(/Ota/g, 'OTA')
      .replace(/Dc/g, 'DC');
  };

  const renderQuestionAnswer = (question: string, value: any, detailsField?: string) => {
    if (!value && value !== 0 && !detailsField) return null;
    
    const hasDetails = detailsField && record?.[detailsField];
    
    return (
      <div className="border-l-2 border-blue-400 print:border-blue-300 pl-2 py-1 print:py-0.5 mb-2 print:mb-1">
        <div className="flex items-center justify-between">
          <h4 className="font-medium text-white print:text-black text-xs print:text-[10px] leading-tight">{question}</h4>
          <div className="flex items-center space-x-1 ml-2">
            {(value === 'yes' || value === 'no') ? getYesNoIcon(value) : (
              <span className="text-slate-300 print:text-gray-700 text-xs print:text-[10px]">
                {Array.isArray(value) ? value.join(', ') : value || 'Not specified'}
              </span>
            )}
          </div>
        </div>
        {hasDetails && (
          <div className="mt-1 p-1 bg-slate-700/30 print:bg-gray-50 rounded text-xs print:text-[9px]">
            <p className="text-slate-300 print:text-gray-700 font-medium">Details:</p>
            <p className="text-slate-300 print:text-gray-600">{record[detailsField]}</p>
          </div>
        )}
      </div>
    );
  };

  const renderSection = (title: string, questions: Array<{question: string, field: string, detailsField?: string}>) => {
    const hasAnyContent = questions.some(q => record?.[q.field] || (q.detailsField && record?.[q.detailsField]));
    
    if (!hasAnyContent) return null;

    return (
      <div className="mb-3 print:mb-2 break-inside-avoid">
        <h3 className="text-sm print:text-xs font-semibold text-white print:text-black mb-2 print:mb-1 border-b border-slate-600 print:border-gray-300 pb-1">
          {title}
        </h3>
        <div className="space-y-1 print:space-y-0.5">
          {questions.map(({ question, field, detailsField }, index) => (
            <div key={index}>
              {renderQuestionAnswer(question, record?.[field], detailsField)}
            </div>
          )).filter(Boolean)}
        </div>
      </div>
    );
  };

  const getEVQuestions = () => [
    {
      title: "Battery & Charging",
      questions: [
        { question: "Charging Issues at Home", field: "charging_issues_home", detailsField: "charging_issues_home_details" },
        { question: "Charging Issues at Public Stations", field: "charging_issues_public", detailsField: "charging_issues_public_details" },
        { question: "Charger Type", field: "charger_type" },
        { question: "Aftermarket Charger", field: "aftermarket_charger", detailsField: "aftermarket_details" },
        { question: "Failed/Incomplete Charges", field: "failed_charges", detailsField: "failed_charges_details" },
        { question: "Range Drop", field: "range_drop", detailsField: "range_drop_details" },
        { question: "Battery Warnings", field: "battery_warnings", detailsField: "battery_warnings_details" },
        { question: "Power Loss/EV Power Limited", field: "power_loss", detailsField: "power_loss_details" },
        { question: "Usual Charge Level", field: "usual_charge_level" },
        { question: "DC Fast Charging Frequency", field: "dc_fast_frequency" },
        { question: "Charge Rate Drop", field: "charge_rate_drop" }
      ]
    },
    {
      title: "Drivetrain & Performance",
      questions: [
        { question: "Consistent Acceleration", field: "consistent_acceleration", detailsField: "acceleration_details" },
        { question: "Whining/Grinding Noises", field: "whining_noises", detailsField: "whining_details" },
        { question: "Jerking/Hesitation", field: "jerking_hesitation", detailsField: "jerking_details" }
      ]
    },
    {
      title: "NVH (Noise, Vibration, Harshness)",
      questions: [
        { question: "Vibrations", field: "vibrations", detailsField: "vibrations_details" },
        { question: "Noises During Actions", field: "noises_actions", detailsField: "noises_actions_details" },
        { question: "Rattles/Thumps", field: "rattles_roads", detailsField: "rattles_details" }
      ]
    },
    {
      title: "Climate Control",
      questions: [
        { question: "HVAC Performance", field: "hvac_performance", detailsField: "hvac_details" },
        { question: "Smells/Noises from Vents", field: "smells_noises", detailsField: "smells_noises_details" },
        { question: "Defogger Performance", field: "defogger_performance", detailsField: "defogger_details" }
      ]
    },
    {
      title: "Electrical & Software",
      questions: [
        { question: "Infotainment Glitches", field: "infotainment_glitches", detailsField: "infotainment_details" },
        { question: "OTA Updates", field: "ota_updates" },
        { question: "Features Broken After Update", field: "broken_features", detailsField: "broken_features_details" },
        { question: "Light Flicker/Abnormal Behavior", field: "light_flicker", detailsField: "light_flicker_details" }
      ]
    },
    {
      title: "Regenerative Braking",
      questions: [
        { question: "Smooth Regenerative Braking", field: "smooth_regen", detailsField: "smooth_regen_details" },
        { question: "Regen Strength Different", field: "regen_strength", detailsField: "regen_strength_details" },
        { question: "Deceleration Noises", field: "deceleration_noises", detailsField: "deceleration_noises_details" }
      ]
    },
    {
      title: "Driving Conditions",
      questions: [
        { question: "Issue Conditions", field: "issue_conditions" },
        { question: "Other Conditions", field: "other_conditions" },
        { question: "Towing/High Load", field: "towing_high_load" }
      ]
    },
    {
      title: "Driving Mode",
      questions: [
        { question: "Primary Mode", field: "primary_mode" },
        { question: "Modes Differences", field: "modes_differences", detailsField: "modes_differences_details" },
        { question: "Specific Mode Issues", field: "specific_mode_issues", detailsField: "specific_mode_details" },
        { question: "Mode Switching Lags", field: "mode_switching_lags", detailsField: "mode_switching_details" }
      ]
    },
    {
      title: "Environmental",
      questions: [
        { question: "Temperature During Issue", field: "temperature_during_issue" },
        { question: "Vehicle Parked", field: "vehicle_parked" },
        { question: "Time of Day", field: "time_of_day" },
        { question: "HVAC Weather Difference", field: "hvac_weather_difference", detailsField: "hvac_weather_details" },
        { question: "Range/Regen vs Temperature", field: "range_regen_temp" },
        { question: "Moisture in Charging Port", field: "moisture_charging_port" }
      ]
    }
  ];

  const getPHEVQuestions = () => [
    {
      title: "Fuel Type & Usage",
      questions: [
        { question: "Fuel Type", field: "fuel_type" },
        { question: "Fuel Source", field: "fuel_source" },
        { question: "Petrol vs EV Usage", field: "petrol_vs_ev_usage" },
        { question: "Fuel Economy Change", field: "fuel_economy_change", detailsField: "fuel_economy_details" }
      ]
    },
    {
      title: "Battery & Charging",
      questions: [
        { question: "Battery Charging", field: "battery_charging", detailsField: "battery_charging_details" },
        { question: "Charger Type", field: "charger_type" },
        { question: "Aftermarket Charger", field: "aftermarket_charger", detailsField: "aftermarket_details" },
        { question: "EV Range as Expected", field: "ev_range_expected", detailsField: "ev_range_details" },
        { question: "Excessive ICE Operation", field: "excessive_ice_operation", detailsField: "ice_operation_details" },
        { question: "Usual Charge Level", field: "usual_charge_level" },
        { question: "DC Fast Frequency", field: "dc_fast_frequency" },
        { question: "DC Fast Duration", field: "dc_fast_duration" },
        { question: "Charge Rate Drop", field: "charge_rate_drop", detailsField: "charge_rate_details" }
      ]
    },
    {
      title: "Hybrid Operation",
      questions: [
        { question: "Switching Lags/Delays", field: "switching_lags", detailsField: "switching_details" },
        { question: "Engine Start in EV Mode", field: "engine_start_ev_mode", detailsField: "engine_start_details" },
        { question: "Abnormal Vibrations", field: "abnormal_vibrations", detailsField: "vibrations_details" }
      ]
    },
    {
      title: "Engine & Drivetrain",
      questions: [
        { question: "Acceleration Issues", field: "acceleration_issues", detailsField: "acceleration_details" },
        { question: "Engine Sound Different", field: "engine_sound", detailsField: "engine_sound_details" },
        { question: "Burning Smell", field: "burning_smell", detailsField: "burning_smell_details" },
        { question: "Misfires/Rough Running", field: "misfires", detailsField: "misfires_details" }
      ]
    },
    {
      title: "NVH & Ride Quality",
      questions: [
        { question: "Underbody Noise", field: "underbody_noise", detailsField: "underbody_details" },
        { question: "Road Condition Noises", field: "road_condition_noises", detailsField: "road_condition_details" }
      ]
    },
    {
      title: "Climate Control",
      questions: [
        { question: "HVAC Effectiveness", field: "hvac_effectiveness", detailsField: "hvac_details" },
        { question: "Fan Sounds/Noises", field: "fan_sounds", detailsField: "fan_details" },
        { question: "Temperature Regulation", field: "temperature_regulation", detailsField: "temperature_details" }
      ]
    },
    {
      title: "Efficiency",
      questions: [
        { question: "Fuel Consumption", field: "fuel_consumption", detailsField: "fuel_consumption_details" },
        { question: "Average Electric Range", field: "average_electric_range" }
      ]
    },
    {
      title: "Software & Instrument Cluster",
      questions: [
        { question: "Infotainment Glitches", field: "infotainment_glitches", detailsField: "infotainment_details" },
        { question: "OTA Updates", field: "ota_updates" },
        { question: "Features Broken After Update", field: "broken_features", detailsField: "broken_features_details" },
        { question: "Light Flicker/Abnormal Behavior", field: "light_flicker", detailsField: "light_flicker_details" }
      ]
    },
    {
      title: "Regenerative Braking",
      questions: [
        { question: "Smooth Regenerative Braking", field: "smooth_regen", detailsField: "smooth_regen_details" },
        { question: "Regen Strength Different", field: "regen_strength", detailsField: "regen_strength_details" },
        { question: "Deceleration Noises", field: "deceleration_noises", detailsField: "deceleration_noises_details" }
      ]
    },
    {
      title: "Driving Load & Towing",
      questions: [
        { question: "Towing Issues", field: "towing_issues", detailsField: "towing_details" },
        { question: "Heavy Load Behavior", field: "heavy_load_behavior", detailsField: "heavy_load_details" }
      ]
    },
    {
      title: "Driving-Mode Behavior",
      questions: [
        { question: "Regular Modes", field: "regular_modes" },
        { question: "Inconsistent Performance", field: "inconsistent_performance", detailsField: "inconsistent_details" },
        { question: "Sport Mode Power", field: "sport_mode_power", detailsField: "sport_mode_details" },
        { question: "Eco/EV Mode Limit", field: "eco_ev_mode_limit", detailsField: "eco_ev_mode_details" },
        { question: "Mode Noise", field: "mode_noise", detailsField: "mode_noise_details" },
        { question: "Mode Warnings", field: "mode_warnings", detailsField: "mode_warnings_details" }
      ]
    },
    {
      title: "Environmental & Climate Conditions",
      questions: [
        { question: "Temperature During Issue", field: "temperature_during_issue" },
        { question: "Vehicle Parked", field: "vehicle_parked" },
        { question: "Time of Day", field: "time_of_day" },
        { question: "HVAC Weather Difference", field: "hvac_weather_difference", detailsField: "hvac_weather_details" },
        { question: "Range/Regen vs Temperature", field: "range_regen_temp", detailsField: "range_regen_details" },
        { question: "Moisture in Charging Port", field: "moisture_charging_port" }
      ]
    }
  ];

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
            onClick={() => navigate('/search')}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            Back to Search
          </button>
        </div>
      </div>
    );
  }

  const questionSections = record.record_type === 'ev' ? getEVQuestions() : getPHEVQuestions();

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
              <p className="text-sm text-slate-400">Complete diagnostic report with all questions and answers</p>
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

      {/* Print Content - Optimized Layout */}
      <div id="print-section" className="p-6 max-w-6xl mx-auto print:p-4 print:max-w-none print:text-[10px]">
        {/* Header Info - Compact */}
        <div className="bg-slate-800 print:bg-white print:border print:border-gray-300 rounded-lg p-6 print:p-3 mb-6 print:mb-3">
          <div className="flex items-center justify-between mb-4 print:mb-2">
            <div className="flex items-center space-x-3 print:space-x-2">
              <Battery className="w-8 h-8 print:w-4 print:h-4 text-blue-400 print:text-blue-600" />
              <div>
                <h1 className="text-2xl print:text-base font-bold text-white print:text-black">
                  {record.record_type === 'ev' ? 'EV' : 'PHEV'} Diagnostic Report
                </h1>
                <p className="text-slate-400 print:text-gray-600 print:text-xs">Complete Pre-Check Assessment</p>
              </div>
            </div>
            <div className="text-right print:text-xs">
              <p className="text-sm print:text-[9px] text-slate-400 print:text-gray-600">Generated: {formatDate(record.created_at)}</p>
              <p className="text-sm print:text-[9px] text-slate-400 print:text-gray-600">Technician: {record.technician_id}</p>
            </div>
          </div>

          {/* Vehicle Info - Compact Grid */}
          <div className="grid grid-cols-2 print:grid-cols-4 gap-4 print:gap-2">
            <div>
              <label className="block text-xs print:text-[8px] font-medium text-slate-400 print:text-gray-600 uppercase tracking-wider mb-1">Customer</label>
              <p className="text-white print:text-black font-medium text-sm print:text-[10px]">{record.customer_name}</p>
            </div>
            <div>
              <label className="block text-xs print:text-[8px] font-medium text-slate-400 print:text-gray-600 uppercase tracking-wider mb-1">VIN</label>
              <p className="text-white print:text-black font-mono text-sm print:text-[10px]">{record.vin}</p>
            </div>
            <div>
              <label className="block text-xs print:text-[8px] font-medium text-slate-400 print:text-gray-600 uppercase tracking-wider mb-1">RO Number</label>
              <p className="text-white print:text-black text-sm print:text-[10px]">{record.ro_number}</p>
            </div>
            <div>
              <label className="block text-xs print:text-[8px] font-medium text-slate-400 print:text-gray-600 uppercase tracking-wider mb-1">Make/Model</label>
              <p className="text-white print:text-black text-sm print:text-[10px]">{record.make_model}</p>
            </div>
          </div>
        </div>

        {/* Complete Q&A Sections - Multi-column print layout */}
        <div className="bg-slate-800 print:bg-white print:border print:border-gray-300 rounded-lg p-6 print:p-3">
          <h2 className="text-xl print:text-sm font-semibold text-white print:text-black mb-6 print:mb-3 flex items-center">
            <CheckCircle className="w-6 h-6 print:w-3 print:h-3 mr-2 text-blue-400 print:text-blue-600" />
            Complete Diagnostic Assessment
          </h2>
          
          {/* Multi-column layout for print */}
          <div className="print:columns-2 print:gap-4 space-y-4 print:space-y-2">
            {questionSections.map((section, index) => 
              renderSection(section.title, section.questions)
            )}
          </div>
        </div>

        {/* Footer - Compact */}
        <div className="text-center text-sm print:text-[8px] text-slate-400 print:text-gray-600 pt-4 print:pt-2 border-t border-slate-700 print:border-gray-300 print:mt-3">
          <p>This comprehensive report was generated by the EV Diagnostic Portal</p>
          <p>Report ID: {record.id} | Generated on {formatDate(record.created_at)}</p>
          <p>For technical support, contact your system administrator</p>
        </div>
      </div>

      {/* Print-specific styles */}
      <style>{`
        @media print {
          @page {
            margin: 0.5in;
            size: letter;
          }
          
          body {
            font-size: 10px !important;
            line-height: 1.2 !important;
          }
          
          /* allow page breaks but keep sections intact within columns */
          .break-inside-avoid {
            page-break-inside: auto;
            break-inside: avoid-column;
          }
          
          .print\\:columns-2 {
            column-count: 2;
            column-gap: 1rem;
          }
        }
      `}</style>
    </div>
  );
};

export default PrintSummary;
