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

const PrintSummary = () => {
  const { type, id } = useParams<{ type?: string; id?: string }>();
  const navigate = useNavigate();
  const [record, setRecord] = useState<DiagnosticRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [technicianName, setTechnicianName] = useState<string | null>(null);

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

  const handlePrint = () => {
    window.print();
  };

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

  const renderQuestionAnswer = (
    question: string,
    value: any,
    detailsField?: string
  ) => {
    if (!value && value !== 0 && !detailsField) return null;
    const hasDetails = detailsField && record?.[detailsField];
    return (
      <div className="mb-1 print:mb-0">
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
          {questions.map(({ question, field, detailsField }, index) => (
            <div key={index}>{renderQuestionAnswer(question, record?.[field], detailsField)}</div>
          )).filter(Boolean)}
        </div>
      </div>
    );
  };

  const getEVQuestions = () => [/* ... same as before ... */];
  const getPHEVQuestions = () => [/* ... same as before ... */];

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
      {/* Additional print and PDF styles */}
      <style>{`
        @media print {
          @page {
            margin: 0.3in;
            size: letter;
          }
          body {
            font-family: 'Arial', 'Helvetica', sans-serif !important;
            font-size: 10px !important;
            line-height: 1.2 !important;
            color: #000 !important;
          }
          * {
            background-color: transparent !important;
          }
          #print-section {
            background-color: white !important;
          }
          .print\\:grid { display: grid !important; }
          .print\\:grid-cols-2 { grid-template-columns: 1fr 1fr !important; }
          .print\\:gap-4 { gap: 0.3rem !important; }
          .print\\:gap-2 { gap: 0.5rem !important; }
          .print\\:break-inside-avoid { break-inside: avoid !important; page-break-inside: avoid !important; }
          .print\\:columns-2 { column-count: 2 !important; }
          .print\\:space-y-2 > * + * { margin-top: 0.5rem !important; }
          * {
            -webkit-print-color-adjust: exact !important;
            color-adjust: exact !important;
          }
        }
        .pdf-mode {
          background-color: #ffffff !important;
          color: #000000 !important;
        }
        .pdf-mode * {
          background-color: transparent !important;
          color: #000000 !important;
        }
        .pdf-mode #print-section {
          background-color: #ffffff !important;
        }
        .pdf-mode [class*="bg-slate-700"] {
          background-color: #f9fafb !important;
          color: #374151 !important;
        }
        .pdf-mode h3 {
          background-color: #e5e7eb !important;
          color: #111827 !important;
        }
        .pdf-mode .print\\:grid { display: grid !important; }
        .pdf-mode .print\\:grid-cols-2 { grid-template-columns: 1fr 1fr !important; }
        .pdf-mode .print\\:gap-4 { gap: 0.3rem !important; }
        .pdf-mode .print\\:gap-2 { gap: 0.5rem !important; }
        .pdf-mode .print\\:columns-2 { column-count: 2 !important; }
        .pdf-mode .print\\:space-y-2 > * + * { margin-top: 0.5rem !important; }
        .pdf-mode .print\\:border { border-width: 1px !important; }
        .pdf-mode .print\\:border-gray-300 { border-color: #d1d5db !important; }
        .pdf-mode .print\\:border-gray-200 { border-color: #e5e7eb !important; }
        .pdf-mode .print\\:rounded { border-radius: 0.25rem !important; }
        .pdf-mode .print\\:p-2 { padding: 0.5rem !important; }
        .pdf-mode .print\\:p-1 { padding: 0.25rem !important; }
        .pdf-mode .print\\:p-4 { padding: 1rem !important; }
        .pdf-mode .print\\:mb-4 { margin-bottom: 1rem !important; }
        .pdf-mode .print\\:mb-3 { margin-bottom: 0.75rem !important; }
        .pdf-mode .print\\:mb-2 { margin-bottom: 0.5rem !important; }
        .pdf-mode .print\\:mb-1 { margin-bottom: 0.25rem !important; }
        .pdf-mode .print\\:mt-0 { margin-top: 0 !important; }
        .pdf-mode .print\\:pt-3 { padding-top: 0.75rem !important; }
        .pdf-mode .print\\:pb-2 { padding-bottom: 0.5rem !important; }
        .pdf-mode .print\\:pt-1 { padding-top: 0.25rem !important; }
        .pdf-mode .print\\:text-xs { font-size: 0.75rem !important; }
        .pdf-mode .print\\:text-sm { font-size: 0.875rem !important; }
        .pdf-mode .print\\:text-gray-900 { color: #111827 !important; }
        .pdf-mode .print\\:text-gray-700 { color: #374151 !important; }
        .pdf-mode .print\\:text-gray-600 { color: #4b5563 !important; }
        .pdf-mode .print\\:bg-gray-200 { background-color: #e5e7eb !important; }
        .pdf-mode .print\\:bg-gray-50 { background-color: #f9fafb !important; }
        .pdf-mode .print\\:border-t { border-top-width: 1px !important; }
        .pdf-mode .print\\:border-b { border-bottom-width: 1px !important; }
        .pdf-mode .print\\:pb-2 { padding-bottom: 0.5rem !important; }
        .pdf-mode .print\\:pt-1 { padding-top: 0.25rem !important; }
      `}</style>
    </div>
  );
};

export default PrintSummary;
