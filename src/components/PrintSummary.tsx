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
    if (value === 'yes') return <span className="text-red-500 print:text-black font-bold text-xs">⚠ YES</span>;
    if (value === 'no') return <span className="text-green-500 print:text-black text-xs">✓ NO</span>;
    return <span className="text-slate-400 print:text-gray-600 text-xs">-</span>;
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
      <div className="mb-2 print:mb-1">
        <div className="flex items-center justify-between print:py-1 py-2">
          <h4 className="font-medium text-white print:text-gray-800 text-sm print:text-xs leading-tight flex-1 pr-4">
            {question}
          </h4>
          <div className="flex items-center ml-2 flex-shrink-0">
            {(value === 'yes' || value === 'no') ? getYesNoIcon(value) : (
              <span className="text-slate-300 print:text-gray-700 text-sm print:text-xs">
                {Array.isArray(value) ? value.join(', ') : value || 'Not specified'}
              </span>
            )}
          </div>
        </div>
        {hasDetails && (
          <div className="mt-1 print:mt-1 pl-4 print:pl-2 bg-slate-700/30 print:bg-gray-100 print:p-2 rounded print:text-xs">
            <p className="text-slate-300 print:text-gray-700 font-medium text-xs print:font-semibold mb-1 print:mb-0">Details:</p>
            <p className="text-slate-300 print:text-gray-600 text-xs print:leading-tight">{record[detailsField]}</p>
          </div>
        )}
      </div>
    );
  };

  const renderSection = (title: string, questions: Array<{question: string, field: string, detailsField?: string}>) => {
    const hasAnyContent = questions.some(q => record?.[q.field] || (q.detailsField && record?.[q.detailsField]));
    
    if (!hasAnyContent) return null;

    return (
      <div className="mb-4 print:mb-3 break-inside-avoid print:bg-white print:border print:border-gray-200 print:rounded print:p-3">
        <h3 className="text-lg print:text-xs font-bold text-white print:text-white print:bg-gray-600 mb-3 print:mb-2 print:p-2 print:rounded print:font-bold print:uppercase">
          {title}
        </h3>
        <div className="space-y-1 print:space-y-0">
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
            onClick={() => navigate('/search-records')}
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
              onClick={() => navigate('/modify-reports')}
              className="flex items-center space-x-2 text-slate-300 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Modify Reports</span>
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

      {/* Print Content - Professional Layout */}
      <div id="print-section" className="p-6 max-w-6xl mx-auto print:p-0 print:max-w-none">
        {/* Professional Header */}
        <div className="bg-slate-800 print:bg-white rounded-lg p-6 print:p-6 mb-6 print:mb-8 print:border-b-4 print:border-blue-600">
          <div className="flex items-center justify-between mb-6 print:mb-4">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 print:w-16 print:h-16 bg-blue-600 print:bg-blue-600 rounded-lg flex items-center justify-center">
                <Battery className="w-6 h-6 print:w-8 print:h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl print:text-2xl font-bold text-white print:text-gray-900 print:font-black">
                  {record.record_type.toUpperCase()} DIAGNOSTIC REPORT
                </h1>
                <p className="text-lg print:text-base text-slate-400 print:text-gray-600 font-medium">Complete Pre-Check Assessment</p>
              </div>
            </div>
            <div className="text-right">
              <div className="print:bg-gray-50 print:p-3 print:rounded-lg print:border">
                <p className="text-sm print:text-sm text-slate-400 print:text-gray-700 font-semibold">Generated</p>
                <p className="text-lg print:text-base text-white print:text-gray-900 font-bold">{formatDate(record.created_at)}</p>
                <p className="text-sm print:text-sm text-slate-400 print:text-gray-600">Tech: {record.technician_id}</p>
              </div>
            </div>
          </div>

          {/* Vehicle Information Card */}
          <div className="print:bg-gray-50 print:p-4 print:rounded-lg print:border">
            <h2 className="text-lg print:text-base font-bold text-white print:text-gray-900 mb-4 print:mb-3 print:border-b print:border-gray-300 print:pb-2">
              VEHICLE INFORMATION
            </h2>
            <div className="grid grid-cols-2 print:grid-cols-4 gap-6 print:gap-4">
              <div>
                <label className="block text-xs print:text-xs font-bold text-slate-400 print:text-gray-600 uppercase tracking-wider mb-2 print:mb-1">Customer Name</label>
                <p className="text-white print:text-gray-900 font-semibold text-base print:text-sm">{record.customer_name}</p>
              </div>
              <div>
                <label className="block text-xs print:text-xs font-bold text-slate-400 print:text-gray-600 uppercase tracking-wider mb-2 print:mb-1">Vehicle VIN</label>
                <p className="text-white print:text-gray-900 font-mono font-bold text-base print:text-sm">{record.vin}</p>
              </div>
              <div>
                <label className="block text-xs print:text-xs font-bold text-slate-400 print:text-gray-600 uppercase tracking-wider mb-2 print:mb-1">RO Number</label>
                <p className="text-white print:text-gray-900 font-semibold text-base print:text-sm">{record.ro_number}</p>
              </div>
              <div>
                <label className="block text-xs print:text-xs font-bold text-slate-400 print:text-gray-600 uppercase tracking-wider mb-2 print:mb-1">Make & Model</label>
                <p className="text-white print:text-gray-900 font-semibold text-base print:text-sm">{record.make_model}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Diagnostic Assessment Sections */}
        <div className="bg-slate-800 print:bg-white rounded-lg p-6 print:p-6 print:border">
          <div className="mb-6 print:mb-6 print:border-b-2 print:border-blue-600 print:pb-3">
            <h2 className="text-2xl print:text-xl font-bold text-white print:text-gray-900 flex items-center">
              <CheckCircle className="w-6 h-6 print:w-6 print:h-6 mr-3 text-blue-400 print:text-blue-600" />
              COMPLETE DIAGNOSTIC ASSESSMENT
            </h2>
          </div>
          
          {/* Professional 2-column grid layout */}
          <div className="print:grid print:grid-cols-2 print:gap-8 space-y-6 print:space-y-0">
            {questionSections.map((section, index) => (
              <div key={index} className="print:break-inside-avoid print:mb-6">
                {renderSection(section.title, section.questions)}
              </div>
            ))}
          </div>
        </div>

        {/* Professional Footer */}
        <div className="print:mt-8 print:pt-4 print:border-t-2 print:border-gray-300">
          <div className="text-center print:text-center">
            <div className="print:bg-gray-50 print:p-4 print:rounded-lg print:border">
              <p className="text-sm print:text-sm text-slate-400 print:text-gray-700 font-semibold">EV Diagnostic Portal - Professional Assessment Report</p>
              <p className="text-xs print:text-xs text-slate-400 print:text-gray-600 mt-1">
                Report ID: {record.id} | Generated: {formatDate(record.created_at)}
              </p>
              <p className="text-xs print:text-xs text-slate-400 print:text-gray-600">
                For technical support and inquiries, contact your system administrator
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Print-specific styles */}
      <style>{`
        @media print {
          @page {
            margin: 0.4in;
            size: letter;
          }
          
          body {
            font-family: 'Arial', 'Helvetica', sans-serif !important;
            font-size: 11px !important;
            line-height: 1.3 !important;
            color: #000 !important;
          }
          
          /* Force grid layout for consistent 2-column printing */
          .print\\:grid {
            display: grid !important;
          }
          
          .print\\:grid-cols-2 {
            grid-template-columns: 1fr 1fr !important;
          }
          
          .print\\:gap-8 {
            gap: 1rem !important;
          }
          
          .print\\:gap-4 {
            gap: 0.5rem !important;
          }
          
          /* Prevent sections from breaking across columns/pages */
          .print\\:break-inside-avoid {
            break-inside: avoid !important;
            page-break-inside: avoid !important;
          }
          
          /* Professional header styling */
          .print\\:border-b-4 {
            border-bottom: 4px solid #2563eb !important;
          }
          
          .print\\:bg-blue-600 {
            background-color: #2563eb !important;
          }
          
          .print\\:text-white {
            color: #ffffff !important;
          }
          
          .print\\:text-gray-900 {
            color: #111827 !important;
          }
          
          .print\\:text-gray-700 {
            color: #374151 !important;
          }
          
          .print\\:text-gray-600 {
            color: #4b5563 !important;
          }
          
          .print\\:bg-gray-50 {
            background-color: #f9fafb !important;
          }
          
          .print\\:bg-blue-50 {
            background-color: #eff6ff !important;
          }
          
          .print\\:border-blue-400 {
            border-color: #60a5fa !important;
          }
          
          .print\\:border-blue-600 {
            border-color: #2563eb !important;
          }
          
          .print\\:border-gray-200 {
            border-color: #e5e7eb !important;
          }
          
          .print\\:border-gray-300 {
            border-color: #d1d5db !important;
          }
          
          /* Ensure consistent layout across devices */
          * {
            -webkit-print-color-adjust: exact !important;
            color-adjust: exact !important;
          }
          
          /* Typography improvements */
          .print\\:font-black {
            font-weight: 900 !important;
          }
          
          .print\\:font-bold {
            font-weight: 700 !important;
          }
          
          .print\\:font-semibold {
            font-weight: 600 !important;
          }
          
          .print\\:uppercase {
            text-transform: uppercase !important;
          }
          
          .print\\:tracking-wide {
            letter-spacing: 0.025em !important;
          }
        }
      `}</style>
    </div>
  );
};

export default PrintSummary;
