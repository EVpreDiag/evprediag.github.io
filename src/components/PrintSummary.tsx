import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Printer, Download } from 'lucide-react';
import { supabase } from '../integrations/supabase/client';

/**
 * DiagnosticRecord describes the shape of a diagnostic record in both the EV
 * and PHEV tables.  Additional keys may be present depending on the record
 * type, so we allow arbitrary string keys as well.
 */
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

/**
 * PrintSummary component displays a single EV or PHEV diagnostic record in a
 * printable format.  It loads the record based on the URL parameters, and
 * provides print and PDF download actions.  When printing, the layout
 * switches to a light theme and a two-column layout for better legibility.
 */
const PrintSummary = () => {
  const { type, id } = useParams<{ type?: string; id?: string }>();
  const navigate = useNavigate();
  const [record, setRecord] = useState<DiagnosticRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Store the technician's human-readable name (if available).
  const [technicianName, setTechnicianName] = useState<string | null>(null);

  // Fetch the record when the component mounts or when the id/type params change.
  useEffect(() => {
    const fetchRecord = async () => {
      if (!id) {
        setError('No record ID provided');
        setLoading(false);
        return;
      }
      try {
        let recordData: any = null;
        let finalRecordType: 'ev' | 'phev' = 'ev';

        // If a type was specified, try that table first
        if (type === 'ev') {
          const { data: evRecord, error: evError } = await supabase
            .from('ev_diagnostic_records')
            .select('*')
            .eq('id', id)
            .maybeSingle();
          if (!evError && evRecord) {
            recordData = evRecord;
            finalRecordType = 'ev';
          }
        } else if (type === 'phev') {
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

        // If no record was found in the specified table, try both tables
        if (!recordData) {
          const { data: evRecord, error: evError } = await supabase
            .from('ev_diagnostic_records')
            .select('*')
            .eq('id', id)
            .maybeSingle();
          if (!evError && evRecord) {
            recordData = evRecord;
            finalRecordType = 'ev';
          } else {
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
          // Normalise the record so both EV and PHEV types share common fields
          const formattedRecord: DiagnosticRecord = {
            ...recordData,
            customer_name: recordData.customer_name,
            make_model:
              finalRecordType === 'ev'
                ? recordData.make_model || ''
                : `${recordData.vehicle_make || ''} ${recordData.model || ''}`.trim(),
            created_at: recordData.created_at,
            technician_id: recordData.technician_id || 'Unknown',
            record_type: finalRecordType
          };
          setRecord(formattedRecord);

          // For now, just display the technician_id directly
          // TODO: Implement proper technician name lookup when schema is confirmed
        } else {
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

  // Print handler simply calls window.print
  const handlePrint = () => {
    window.print();
  };

  // Download handler uses html2pdf to convert the print section to a PDF
  const handleDownload = async () => {
    const element = document.getElementById('print-section');
    if (!element) return;
    // Import html2pdf lazily so it isn't loaded until needed
    const html2pdf = (await import('html2pdf.js')).default;
    // Temporarily apply the `pdf-mode` class to the print section to inline
    // print styles during PDF generation.  This class forces white
    // backgrounds and dark text for all children.  After the PDF is saved
    // the class is removed to restore normal rendering.
    element.classList.add('pdf-mode');
    try {
      await html2pdf()
        .from(element)
        .set({
          margin: 0.5,
          filename: `diagnostic-report-${record?.id ?? 'report'}.pdf`,
          html2canvas: { scale: 2, backgroundColor: '#fff' },
          jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
        })
        .save();
    } finally {
      element.classList.remove('pdf-mode');
    }
  };

  // Format a date string into a readable format for both screen and print
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Render a YES/NO indicator.  In print we avoid coloured icons and use black text.
  const getYesNoIcon = (value: string) => {
    if (value === 'yes')
      return (
        <span className="text-red-500 print:text-black font-bold text-xs">
          ⚠ YES
        </span>
      );
    if (value === 'no')
      return (
        <span className="text-green-500 print:text-black text-xs">✓ NO</span>
      );
    return (
      <span className="text-slate-400 print:text-gray-600 text-xs">-</span>
    );
  };

  /**
   * Render a single question/answer pair.  If a details field is present and has
   * a value, it is rendered in a light grey box underneath the answer.
   */
  const renderQuestionAnswer = (
    question: string,
    value: any,
    detailsField?: string
  ) => {
    if (!value && value !== 0 && !detailsField) return null;
    const hasDetails = detailsField && record?.[detailsField];
    return (
      <div className="mb-1 print:mb-0">
        {/* Use a grid instead of flex to prevent overlap between question and answer. */}
        <div className="grid grid-cols-2 gap-x-2 print:grid-cols-2 print:gap-x-1 items-start py-1 print:py-0">
          <h4 className="font-medium text-white print:text-gray-800 text-sm print:text-xs leading-tight">
            {question}
          </h4>
          <div className="text-right">
            {(value === 'yes' || value === 'no') ? getYesNoIcon(value) : (
              <span className="text-slate-300 print:text-gray-700 text-sm print:text-xs">
                {Array.isArray(value) ? value.join(', ') : value || 'Not specified'}
              </span>
            )}
          </div>
          {hasDetails && (
            <div className="col-span-2 mt-1 print:mt-0 pl-3 print:pl-1 bg-slate-700/30 print:bg-gray-50 print:p-1 rounded print:text-xs">
              <p className="text-slate-300 print:text-gray-600 font-medium text-xs print:font-normal mb-1 print:mb-0">
                Details:
              </p>
              <p className="text-slate-300 print:text-gray-600 text-xs print:leading-tight">
                {record![detailsField!]}
              </p>
            </div>
          )}
        </div>
      </div>
    );
  };

  /**
   * Render a section consisting of a title and a list of questions.  In print
   * mode sections have a light border and rounded corners, and their headers
   * use a light background for better contrast.
   */
  const renderSection = (
    title: string,
    questions: Array<{ question: string; field: string; detailsField?: string }>
  ) => {
    const hasAnyContent = questions.some(
      q => record?.[q.field] || (q.detailsField && record?.[q.detailsField!])
    );
    if (!hasAnyContent) return null;
    return (
      <div className="mb-3 print:mb-2 break-inside-avoid print:border print:border-gray-200 print:rounded print:p-2">
        <h3 className="text-lg print:text-xs font-bold text-white print:text-gray-900 print:bg-gray-200 mb-2 print:mb-1 print:p-1 print:rounded print:font-bold print:uppercase print:text-center">
          {title}
        </h3>
        <div className="space-y-1 print:space-y-0">
          {questions
            .map(({ question, field, detailsField }, index) => (
              <div key={index}>{renderQuestionAnswer(question, record?.[field], detailsField)}</div>
            ))
            .filter(Boolean)}
        </div>
      </div>
    );
  };

  // Define the question sets for EV and PHEV records.  These arrays drive
  // rendering of each diagnostic section.
  const getEVQuestions = () => [
    {
      title: 'Battery & Charging',
      questions: [
        { question: 'Charging Issues at Home', field: 'charging_issues_home', detailsField: 'charging_issues_home_details' },
        { question: 'Charging Issues at Public Stations', field: 'charging_issues_public', detailsField: 'charging_issues_public_details' },
        { question: 'Charger Type', field: 'charger_type' },
        { question: 'Aftermarket Charger', field: 'aftermarket_charger', detailsField: 'aftermarket_details' },
        { question: 'Failed/Incomplete Charges', field: 'failed_charges', detailsField: 'failed_charges_details' },
        { question: 'Range Drop', field: 'range_drop', detailsField: 'range_drop_details' },
        { question: 'Battery Warnings', field: 'battery_warnings', detailsField: 'battery_warnings_details' },
        { question: 'Power Loss/EV Power Limited', field: 'power_loss', detailsField: 'power_loss_details' },
        { question: 'Usual Charge Level', field: 'usual_charge_level' },
        { question: 'DC Fast Charging Frequency', field: 'dc_fast_frequency' },
        { question: 'Charge Rate Drop', field: 'charge_rate_drop' }
      ]
    },
    {
      title: 'Drivetrain & Performance',
      questions: [
        { question: 'Consistent Acceleration', field: 'consistent_acceleration', detailsField: 'acceleration_details' },
        { question: 'Whining/Grinding Noises', field: 'whining_noises', detailsField: 'whining_details' },
        { question: 'Jerking/Hesitation', field: 'jerking_hesitation', detailsField: 'jerking_details' }
      ]
    },
    {
      title: 'NVH (Noise, Vibration, Harshness)',
      questions: [
        { question: 'Vibrations', field: 'vibrations', detailsField: 'vibrations_details' },
        { question: 'Noises During Actions', field: 'noises_actions', detailsField: 'noises_actions_details' },
        { question: 'Rattles/Thumps', field: 'rattles_roads', detailsField: 'rattles_details' }
      ]
    },
    {
      title: 'Climate Control',
      questions: [
        { question: 'HVAC Performance', field: 'hvac_performance', detailsField: 'hvac_details' },
        { question: 'Smells/Noises from Vents', field: 'smells_noises', detailsField: 'smells_noises_details' },
        { question: 'Defogger Performance', field: 'defogger_performance', detailsField: 'defogger_details' }
      ]
    },
    {
      title: 'Electrical & Software',
      questions: [
        { question: 'Infotainment Glitches', field: 'infotainment_glitches', detailsField: 'infotainment_details' },
        { question: 'OTA Updates', field: 'ota_updates' },
        { question: 'Features Broken After Update', field: 'broken_features', detailsField: 'broken_features_details' },
        { question: 'Light Flicker/Abnormal Behavior', field: 'light_flicker', detailsField: 'light_flicker_details' }
      ]
    },
    {
      title: 'Regenerative Braking',
      questions: [
        { question: 'Smooth Regenerative Braking', field: 'smooth_regen', detailsField: 'smooth_regen_details' },
        { question: 'Regen Strength Different', field: 'regen_strength', detailsField: 'regen_strength_details' },
        { question: 'Deceleration Noises', field: 'deceleration_noises', detailsField: 'deceleration_noises_details' }
      ]
    },
    {
      title: 'Driving Conditions',
      questions: [
        { question: 'Issue Conditions', field: 'issue_conditions' },
        { question: 'Other Conditions', field: 'other_conditions' },
        { question: 'Towing/High Load', field: 'towing_high_load' }
      ]
    },
    {
      title: 'Driving Mode',
      questions: [
        { question: 'Primary Mode', field: 'primary_mode' },
        { question: 'Modes Differences', field: 'modes_differences', detailsField: 'modes_differences_details' },
        { question: 'Specific Mode Issues', field: 'specific_mode_issues', detailsField: 'specific_mode_details' },
        { question: 'Mode Switching Lags', field: 'mode_switching_lags', detailsField: 'mode_switching_details' }
      ]
    },
    {
      title: 'Environmental',
      questions: [
        { question: 'Temperature During Issue', field: 'temperature_during_issue' },
        { question: 'Vehicle Parked', field: 'vehicle_parked' },
        { question: 'Time of Day', field: 'time_of_day' },
        { question: 'HVAC Weather Difference', field: 'hvac_weather_difference', detailsField: 'hvac_weather_details' },
        { question: 'Range/Regen vs Temperature', field: 'range_regen_temp' },
        { question: 'Moisture in Charging Port', field: 'moisture_charging_port' }
      ]
    }
  ];

  const getPHEVQuestions = () => [
    {
      title: 'Fuel Type & Usage',
      questions: [
        { question: 'Fuel Type', field: 'fuel_type' },
        { question: 'Fuel Source', field: 'fuel_source' },
        { question: 'Petrol vs EV Usage', field: 'petrol_vs_ev_usage' },
        { question: 'Fuel Economy Change', field: 'fuel_economy_change', detailsField: 'fuel_economy_details' }
      ]
    },
    {
      title: 'Battery & Charging',
      questions: [
        { question: 'Battery Charging', field: 'battery_charging', detailsField: 'battery_charging_details' },
        { question: 'Charger Type', field: 'charger_type' },
        { question: 'Aftermarket Charger', field: 'aftermarket_charger', detailsField: 'aftermarket_details' },
        { question: 'EV Range as Expected', field: 'ev_range_expected', detailsField: 'ev_range_details' },
        { question: 'Excessive ICE Operation', field: 'excessive_ice_operation', detailsField: 'ice_operation_details' },
        { question: 'Usual Charge Level', field: 'usual_charge_level' },
        { question: 'DC Fast Frequency', field: 'dc_fast_frequency' },
        { question: 'DC Fast Duration', field: 'dc_fast_duration' },
        { question: 'Charge Rate Drop', field: 'charge_rate_drop', detailsField: 'charge_rate_details' }
      ]
    },
    {
      title: 'Hybrid Operation',
      questions: [
        { question: 'Switching Lags/Delays', field: 'switching_lags', detailsField: 'switching_details' },
        { question: 'Engine Start in EV Mode', field: 'engine_start_ev_mode', detailsField: 'engine_start_details' },
        { question: 'Abnormal Vibrations', field: 'abnormal_vibrations', detailsField: 'vibrations_details' }
      ]
    },
    {
      title: 'Engine & Drivetrain',
      questions: [
        { question: 'Acceleration Issues', field: 'acceleration_issues', detailsField: 'acceleration_details' },
        { question: 'Engine Sound Different', field: 'engine_sound', detailsField: 'engine_sound_details' },
        { question: 'Burning Smell', field: 'burning_smell', detailsField: 'burning_smell_details' },
        { question: 'Misfires/Rough Running', field: 'misfires', detailsField: 'misfires_details' }
      ]
    },
    {
      title: 'NVH & Ride Quality',
      questions: [
        { question: 'Underbody Noise', field: 'underbody_noise', detailsField: 'underbody_details' },
        { question: 'Road Condition Noises', field: 'road_condition_noises', detailsField: 'road_condition_details' }
      ]
    },
    {
      title: 'Climate Control',
      questions: [
        { question: 'HVAC Effectiveness', field: 'hvac_effectiveness', detailsField: 'hvac_details' },
        { question: 'Fan Sounds/Noises', field: 'fan_sounds', detailsField: 'fan_details' },
        { question: 'Temperature Regulation', field: 'temperature_regulation', detailsField: 'temperature_details' }
      ]
    },
    {
      title: 'Efficiency',
      questions: [
        { question: 'Fuel Consumption', field: 'fuel_consumption', detailsField: 'fuel_consumption_details' },
        { question: 'Average Electric Range', field: 'average_electric_range' }
      ]
    },
    {
      title: 'Software & Instrument Cluster',
      questions: [
        { question: 'Infotainment Glitches', field: 'infotainment_glitches', detailsField: 'infotainment_details' },
        { question: 'OTA Updates', field: 'ota_updates' },
        { question: 'Features Broken After Update', field: 'broken_features', detailsField: 'broken_features_details' },
        { question: 'Light Flicker/Abnormal Behavior', field: 'light_flicker', detailsField: 'light_flicker_details' }
      ]
    },
    {
      title: 'Regenerative Braking',
      questions: [
        { question: 'Smooth Regenerative Braking', field: 'smooth_regen', detailsField: 'smooth_regen_details' },
        { question: 'Regen Strength Different', field: 'regen_strength', detailsField: 'regen_strength_details' },
        { question: 'Deceleration Noises', field: 'deceleration_noises', detailsField: 'deceleration_noises_details' }
      ]
    },
    {
      title: 'Driving Load & Towing',
      questions: [
        { question: 'Towing Issues', field: 'towing_issues', detailsField: 'towing_details' },
        { question: 'Heavy Load Behavior', field: 'heavy_load_behavior', detailsField: 'heavy_load_details' }
      ]
    },
    {
      title: 'Driving‑Mode Behavior',
      questions: [
        { question: 'Regular Modes', field: 'regular_modes' },
        { question: 'Inconsistent Performance', field: 'inconsistent_performance', detailsField: 'inconsistent_details' },
        { question: 'Sport Mode Power', field: 'sport_mode_power', detailsField: 'sport_mode_details' },
        { question: 'Eco/EV Mode Limit', field: 'eco_ev_mode_limit', detailsField: 'eco_ev_mode_details' },
        { question: 'Mode Noise', field: 'mode_noise', detailsField: 'mode_noise_details' },
        { question: 'Mode Warnings', field: 'mode_warnings', detailsField: 'mode_warnings_details' }
      ]
    },
    {
      title: 'Environmental & Climate Conditions',
      questions: [
        { question: 'Temperature During Issue', field: 'temperature_during_issue' },
        { question: 'Vehicle Parked', field: 'vehicle_parked' },
        { question: 'Time of Day', field: 'time_of_day' },
        { question: 'HVAC Weather Difference', field: 'hvac_weather_difference', detailsField: 'hvac_weather_details' },
        { question: 'Range/Regen vs Temperature', field: 'range_regen_temp', detailsField: 'range_regen_details' },
        { question: 'Moisture in Charging Port', field: 'moisture_charging_port' }
      ]
    }
  ];

  // If the record is still loading, show a simple spinner/placeholder
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white" />
          <p className="mt-2 text-white">Loading Record...</p>
        </div>
      </div>
    );
  }

  // If there was an error or no record, show an error message with a back button
  if (error || !record) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold text-white mb-2">Record Not Found</h2>
          <p className="text-slate-400 mb-4">
            {error || 'The requested diagnostic record could not be found.'}
          </p>
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

  // Choose the appropriate question set based on the record type
  const questionSections = record.record_type === 'ev' ? getEVQuestions() : getPHEVQuestions();

  return (
    <div className="min-h-screen bg-slate-900 print:bg-white print:text-black">
      {/* Header (hidden when printing) */}
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
              <h1 className="text-xl font-bold text-white">Diagnostic Questions Summary</h1>
              <p className="text-sm text-slate-400">Complete diagnostic report with all questions and answers</p>
            </div>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={handleDownload}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Download PDF</span>
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span>Print</span>
            </button>
          </div>
        </div>
      </header>

      {/* Print Content */}
      <div id="print-section" className="px-6 py-4 print:px-0 print:py-0 print:m-0">
        {/* Report Header */}
        <div className="mb-6 print:mb-2 text-center print:border-b print:border-gray-300 print:pb-2">
          <h1 className="text-2xl print:text-lg font-bold text-white print:text-black mb-2 print:mb-1">
            {record.record_type.toUpperCase()} Diagnostic Questions Report
          </h1>
          <div className="grid grid-cols-2 gap-4 print:gap-2 text-sm print:text-xs max-w-2xl mx-auto">
            <div className="text-left">
              <p className="text-slate-300 print:text-gray-600"><span className="font-medium">Customer:</span> {record.customer_name}</p>
              <p className="text-slate-300 print:text-gray-600"><span className="font-medium">VIN:</span> {record.vin}</p>
            </div>
            <div className="text-right">
              <p className="text-slate-300 print:text-gray-600"><span className="font-medium">RO#:</span> {record.ro_number}</p>
              <p className="text-slate-300 print:text-gray-600"><span className="font-medium">Date:</span> {formatDate(record.created_at)}</p>
            </div>
            <div className="col-span-2 text-center border-t print:border-gray-300 pt-2 print:pt-1">
              <p className="text-slate-300 print:text-gray-600"><span className="font-medium">Vehicle:</span> {record.make_model}</p>
              <p className="text-slate-300 print:text-gray-600"><span className="font-medium">Mileage:</span> {record.mileage}</p>
              <p className="text-slate-300 print:text-gray-600"><span className="font-medium">Technician:</span> {technicianName || record.technician_id}</p>
            </div>
          </div>
        </div>

        {/* Questions and Answers */}
        <div className="print:columns-2 print:gap-4 space-y-4 print:space-y-2">
          {questionSections.map((section, index) => (
            <div key={index}>
              {renderSection(section.title, section.questions)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PrintSummary;
