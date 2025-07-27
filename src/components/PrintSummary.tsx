// File: PrintSummary.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Printer, Download } from 'lucide-react';
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

interface QuestionSection {
  title: string;
  questions: Array<{
    label: string;
    field: string;
    detailsField?: string;
  }>;
}

const getEVQuestions = (): QuestionSection[] => [
  {
    title: "Vehicle Information",
    questions: [
      { label: "Make/Model", field: "make_model" },
      { label: "Mileage", field: "mileage" },
    ]
  },
  {
    title: "Charging Issues",
    questions: [
      { label: "Charging Issues at Home", field: "charging_issues_home", detailsField: "charging_issues_home_details" },
      { label: "Charging Issues at Public Stations", field: "charging_issues_public", detailsField: "charging_issues_public_details" },
      { label: "Failed Charging Attempts", field: "failed_charges", detailsField: "failed_charges_details" },
      { label: "Aftermarket Charger", field: "aftermarket_charger", detailsField: "aftermarket_details" },
    ]
  },
  {
    title: "Battery Performance",
    questions: [
      { label: "Range Drop", field: "range_drop", detailsField: "range_drop_details" },
      { label: "Battery Warnings", field: "battery_warnings", detailsField: "battery_warnings_details" },
      { label: "Power Loss", field: "power_loss", detailsField: "power_loss_details" },
      { label: "Charge Rate Drop", field: "charge_rate_drop" },
    ]
  },
  {
    title: "Drivetrain",
    questions: [
      { label: "Consistent Acceleration", field: "consistent_acceleration", detailsField: "acceleration_details" },
      { label: "Whining Noises", field: "whining_noises", detailsField: "whining_details" },
      { label: "Jerking/Hesitation", field: "jerking_hesitation", detailsField: "jerking_details" },
      { label: "Vibrations", field: "vibrations", detailsField: "vibrations_details" },
    ]
  }
];

const getPHEVQuestions = (): QuestionSection[] => [
  {
    title: "Vehicle Information",
    questions: [
      { label: "Vehicle Make", field: "vehicle_make" },
      { label: "Model", field: "model" },
      { label: "Mileage", field: "mileage" },
      { label: "Fuel Type", field: "fuel_type" },
    ]
  },
  {
    title: "Fuel Usage",
    questions: [
      { label: "Fuel Source", field: "fuel_source" },
      { label: "Petrol vs EV Usage", field: "petrol_vs_ev_usage" },
      { label: "Fuel Economy Change", field: "fuel_economy_change", detailsField: "fuel_economy_details" },
      { label: "Fuel Consumption", field: "fuel_consumption", detailsField: "fuel_consumption_details" },
    ]
  },
  {
    title: "Battery & Charging",
    questions: [
      { label: "Battery Charging Issues", field: "battery_charging", detailsField: "battery_charging_details" },
      { label: "EV Range as Expected", field: "ev_range_expected", detailsField: "ev_range_details" },
      { label: "Charge Rate Drop", field: "charge_rate_drop", detailsField: "charge_rate_details" },
    ]
  },
  {
    title: "Engine Performance",
    questions: [
      { label: "Excessive ICE Operation", field: "excessive_ice_operation", detailsField: "ice_operation_details" },
      { label: "Engine Start in EV Mode", field: "engine_start_ev_mode", detailsField: "engine_start_details" },
      { label: "Abnormal Vibrations", field: "abnormal_vibrations", detailsField: "vibrations_details" },
    ]
  }
];

const PrintSummary = () => {
  const { type, id } = useParams<{ type?: string; id?: string }>();
  const navigate = useNavigate();
  const [record, setRecord] = useState<DiagnosticRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [technicianName, setTechnicianName] = useState<string | null>(null);

  const renderSection = (title: string, questions: Array<{ label: string; field: string; detailsField?: string }>) => (
    <div className="mb-4 print:mb-2 break-inside-avoid">
      <h3 className="text-lg font-semibold text-white print:text-gray-900 mb-2 print:mb-1 border-b border-slate-600 print:border-gray-300 pb-1">
        {title}
      </h3>
      <div className="space-y-1">
        {questions.map((q, idx) => 
          renderQuestionAnswer(q.label, record?.[q.field], q.detailsField)
        )}
      </div>
    </div>
  );

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

        const tryFetch = async (table: 'ev_diagnostic_records' | 'phev_diagnostic_records') =>
          await supabase.from(table).select('*').eq('id', id).maybeSingle();

        if (type === 'ev') {
          const { data, error } = await tryFetch('ev_diagnostic_records');
          if (data) {
            recordData = data;
            finalRecordType = 'ev';
          }
        } else if (type === 'phev') {
          const { data, error } = await tryFetch('phev_diagnostic_records');
          if (data) {
            recordData = data;
            finalRecordType = 'phev';
          }
        }

        if (!recordData) {
          const ev = await tryFetch('ev_diagnostic_records');
          const phev = await tryFetch('phev_diagnostic_records');
          if (ev.data) {
            recordData = ev.data;
            finalRecordType = 'ev';
          } else if (phev.data) {
            recordData = phev.data;
            finalRecordType = 'phev';
          }
        }

        if (recordData) {
          setRecord({
            ...recordData,
            make_model:
              finalRecordType === 'ev'
                ? recordData.make_model || ''
                : `${recordData.vehicle_make || ''} ${recordData.model || ''}`.trim(),
            technician_id: recordData.technician_id || 'Unknown',
            record_type: finalRecordType
          });
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

  const handlePrint = () => window.print();

  const handleDownload = async () => {
    const element = document.getElementById('print-section');
    if (!element) return;
    const html2pdf = (await import('html2pdf.js')).default;
    element.classList.add('pdf-mode');
    try {
      await html2pdf()
        .from(element)
        .set({
          margin: 12.7,
          filename: `diagnostic-report-${record?.id ?? 'report'}.pdf`,
          html2canvas: { scale: 2, backgroundColor: '#fff' },
          jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        })
        .save();
    } finally {
      element.classList.remove('pdf-mode');
    }
  };

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

  const getYesNoIcon = (value: string) => {
    if (value === 'yes') {
      return (
        <span className="yes-indicator font-bold text-xs">⚠ YES</span>
      );
    }
    if (value === 'no') {
      return (
        <span className="no-indicator text-xs">✓ NO</span>
      );
    }
    return (
      <span className="text-slate-400 print:text-gray-600 text-xs">-</span>
    );
  };

  const renderQuestionAnswer = (
    question: string,
    value: any,
    detailsField?: string
  ) => {
    if (!value && value !== 0 && !detailsField) return null;
    const hasDetails = detailsField && record?.[detailsField];
    return (
      <div className="mb-1 print:mb-0">
        <div className="grid grid-cols-2 gap-x-2 items-start py-1 print:py-0">
          <h4 className="font-medium text-white print:text-gray-800 text-sm print:text-xs leading-tight">
            {question}
          </h4>
          <div className="text-right">
            {(value === 'yes' || value === 'no')
              ? getYesNoIcon(value)
              : <span className="text-slate-300 print:text-gray-700 text-sm print:text-xs">{Array.isArray(value) ? value.join(', ') : value || 'Not specified'}</span>}
          </div>
          {hasDetails && (
            <div className="col-span-2 mt-1 pl-3 print:pl-1 bg-slate-700/30 print:bg-gray-50 print:p-1 rounded print:text-xs">
              <p className="text-slate-300 print:text-gray-600 font-medium text-xs print:font-normal mb-1 print:mb-0">Details:</p>
              <p className="text-slate-300 print:text-gray-600 text-xs print:leading-tight">{record![detailsField!]}</p>
            </div>
          )}
        </div>
      </div>
    );
  };

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
    <div className="min-h-screen bg-slate-900 print:bg-white print:text-black">
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

      <div id="print-section" className="px-6 py-4 print:px-0 print:py-0 print:m-0">
        {/* Header omitted for brevity */}
        <div className="print:columns-2 print:gap-4 space-y-4 print:space-y-2">
          {questionSections.map((section, index) => (
            <div key={index}>{renderSection(section.title, section.questions)}</div>
          ))}
        </div>
      </div>

      <style>{`
        .yes-indicator {
          color: #ef4444; /* red-500 */
        }
        .pdf-mode .yes-indicator {
          color: #ef4444 !important;
        }

        .no-indicator {
          color: #22c55e; /* green-500 */
        }
        .pdf-mode .no-indicator {
          color: #22c55e !important;
        }

        .pdf-mode {
          background-color: white !important;
        }

        .pdf-mode #print-section {
          background-color: white !important;
        }
      `}</style>
    </div>
  );
};

export default PrintSummary;
