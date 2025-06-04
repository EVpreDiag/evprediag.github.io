import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Printer, FileText, Calendar, User, Car, Battery, Settings } from 'lucide-react';
import { supabase } from '../integrations/supabase/client';
import { useTechnicianNames } from '../hooks/useTechnicianNames';

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
  const { recordId } = useParams<{ recordId: string }>();
  const navigate = useNavigate();
  const [record, setRecord] = useState<DiagnosticRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { getTechnicianName } = useTechnicianNames();

  useEffect(() => {
    const fetchRecord = async () => {
      if (!recordId) {
        setError('No record ID provided');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Try to fetch from EV records first
        const { data: evRecord, error: evError } = await supabase
          .from('ev_diagnostic_records')
          .select('*')
          .eq('id', recordId)
          .maybeSingle();

        if (evError && evError.code !== 'PGRST116') {
          throw evError;
        }

        if (evRecord) {
          setRecord({
            ...evRecord,
            record_type: 'ev',
            make_model: evRecord.make_model || ''
          });
          setLoading(false);
          return;
        }

        // If not found in EV records, try PHEV records
        const { data: phevRecord, error: phevError } = await supabase
          .from('phev_diagnostic_records')
          .select('*')
          .eq('id', recordId)
          .maybeSingle();

        if (phevError && phevError.code !== 'PGRST116') {
          throw phevError;
        }

        if (phevRecord) {
          setRecord({
            ...phevRecord,
            record_type: 'phev',
            make_model: `${phevRecord.vehicle_make || ''} ${phevRecord.model || ''}`.trim()
          });
        } else {
          setError('Record not found');
        }

      } catch (err) {
        console.error('Error fetching record:', err);
        setError('Failed to load record');
      } finally {
        setLoading(false);
      }
    };

    fetchRecord();
  }, [recordId]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getDisplayValue = (value: any): string => {
    if (value === null || value === undefined || value === '') {
      return 'Not specified';
    }
    if (Array.isArray(value)) {
      return value.length > 0 ? value.join(', ') : 'Not specified';
    }
    return String(value);
  };

  const renderYesNoField = (label: string, value: any, details?: any) => {
    const displayValue = getDisplayValue(value);
    const hasDetails = details && getDisplayValue(details) !== 'Not specified';
    
    return (
      <div className="mb-4">
        <div className="flex items-center justify-between mb-1">
          <span className="text-slate-300 font-medium">{label}</span>
          <span className={`px-2 py-1 rounded text-sm ${
            displayValue === 'yes' ? 'bg-red-600/20 text-red-400' :
            displayValue === 'no' ? 'bg-green-600/20 text-green-400' :
            'bg-slate-600/20 text-slate-400'
          }`}>
            {displayValue === 'yes' ? 'Yes' : displayValue === 'no' ? 'No' : displayValue}
          </span>
        </div>
        {hasDetails && (
          <div className="ml-4 p-2 bg-slate-700/50 rounded text-sm text-slate-300">
            <strong>Details:</strong> {getDisplayValue(details)}
          </div>
        )}
      </div>
    );
  };

  const renderInfoCard = (title: string, icon: React.ReactNode, children: React.ReactNode) => (
    <div className="bg-slate-800 rounded-lg p-6 border border-slate-700 mb-6">
      <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
        {icon}
        <span className="ml-2">{title}</span>
      </h3>
      {children}
    </div>
  );

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400 mx-auto mb-4"></div>
          <h2 className="text-xl font-bold text-white mb-2">Loading Report</h2>
          <p className="text-slate-400">Fetching diagnostic report...</p>
        </div>
      </div>
    );
  }

  if (error || !record) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <FileText className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Report Not Found</h2>
          <p className="text-slate-400 mb-4">{error || 'The requested report could not be found.'}</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header - Hidden when printing */}
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
              <h1 className="text-xl font-bold text-white">Diagnostic Report Summary</h1>
              <p className="text-sm text-slate-400">Customer: {record.customer_name}</p>
            </div>
          </div>
          <button
            onClick={handlePrint}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            <Printer className="w-5 h-5" />
            <span>Print Report</span>
          </button>
        </div>
      </header>

      {/* Print Header - Only visible when printing */}
      <div className="hidden print:block print:mb-6">
        <div className="text-center border-b-2 border-slate-300 pb-4">
          <h1 className="text-2xl font-bold text-slate-900">EV Diagnostic Report</h1>
          <p className="text-slate-600 mt-2">Generated on {formatDate(new Date().toISOString())}</p>
        </div>
      </div>

      <div className="p-6 print:p-8 print:text-slate-900">
        {/* Basic Information */}
        {renderInfoCard("Vehicle Information", <Car className="w-5 h-5 text-blue-400" />, (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <span className="text-slate-400 print:text-slate-600">Customer Name:</span>
              <p className="text-white print:text-slate-900 font-medium">{record.customer_name}</p>
            </div>
            <div>
              <span className="text-slate-400 print:text-slate-600">VIN:</span>
              <p className="text-white print:text-slate-900 font-mono">{record.vin}</p>
            </div>
            <div>
              <span className="text-slate-400 print:text-slate-600">RO Number:</span>
              <p className="text-white print:text-slate-900 font-medium">{record.ro_number}</p>
            </div>
            <div>
              <span className="text-slate-400 print:text-slate-600">Make/Model:</span>
              <p className="text-white print:text-slate-900 font-medium">{record.make_model}</p>
            </div>
            <div>
              <span className="text-slate-400 print:text-slate-600">Mileage:</span>
              <p className="text-white print:text-slate-900 font-medium">{getDisplayValue(record.mileage)}</p>
            </div>
            <div>
              <span className="text-slate-400 print:text-slate-600">Vehicle Type:</span>
              <p className="text-white print:text-slate-900 font-medium">
                {record.record_type === 'ev' ? 'Electric Vehicle (EV)' : 'Plug-in Hybrid Electric Vehicle (PHEV)'}
              </p>
            </div>
          </div>
        ))}

        {/* Report Information */}
        {renderInfoCard("Report Information", <FileText className="w-5 h-5 text-green-400" />, (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <span className="text-slate-400 print:text-slate-600">Technician:</span>
              <p className="text-white print:text-slate-900 font-medium">{getTechnicianName(record.technician_id)}</p>
            </div>
            <div>
              <span className="text-slate-400 print:text-slate-600">Date Created:</span>
              <p className="text-white print:text-slate-900 font-medium">{formatDate(record.created_at)}</p>
            </div>
          </div>
        ))}

        {/* Battery & Charging Issues */}
        {renderInfoCard("Battery & Charging", <Battery className="w-5 h-5 text-yellow-400" />, (
          <div className="space-y-3">
            {record.record_type === 'ev' ? (
              <>
                {renderYesNoField("Charging issues at home", record.charging_issues_home, record.charging_issues_home_details)}
                {renderYesNoField("Charging issues at public stations", record.charging_issues_public, record.charging_issues_public_details)}
                {renderYesNoField("Failed charging sessions", record.failed_charges, record.failed_charges_details)}
                {renderYesNoField("Range drop issues", record.range_drop, record.range_drop_details)}
                {renderYesNoField("Battery warnings/alerts", record.battery_warnings, record.battery_warnings_details)}
                {renderYesNoField("Power loss during acceleration", record.power_loss, record.power_loss_details)}
              </>
            ) : (
              <>
                {renderYesNoField("Battery charging properly", record.battery_charging, record.battery_charging_details)}
                {renderYesNoField("EV range as expected", record.ev_range_expected, record.ev_range_details)}
                {renderYesNoField("Excessive ICE operation", record.excessive_ice_operation, record.ice_operation_details)}
                {renderYesNoField("Charge rate drop", record.charge_rate_drop, record.charge_rate_details)}
              </>
            )}
          </div>
        ))}

        {/* Performance Issues */}
        {renderInfoCard("Performance & Drivetrain", <Settings className="w-5 h-5 text-purple-400" />, (
          <div className="space-y-3">
            {record.record_type === 'ev' ? (
              <>
                {renderYesNoField("Consistent acceleration", record.consistent_acceleration, record.acceleration_details)}
                {renderYesNoField("Whining noises", record.whining_noises, record.whining_details)}
                {renderYesNoField("Jerking/hesitation", record.jerking_hesitation, record.jerking_details)}
                {renderYesNoField("Vibrations", record.vibrations, record.vibrations_details)}
                {renderYesNoField("Smooth regeneration", record.smooth_regen, record.smooth_regen_details)}
                {renderYesNoField("Deceleration noises", record.deceleration_noises, record.deceleration_noises_details)}
              </>
            ) : (
              <>
                {renderYesNoField("Acceleration issues", record.acceleration_issues, record.acceleration_details)}
                {renderYesNoField("Abnormal vibrations", record.abnormal_vibrations, record.vibrations_details)}
                {renderYesNoField("Engine sound normal", record.engine_sound, record.engine_sound_details)}
                {renderYesNoField("Any misfires", record.misfires, record.misfires_details)}
                {renderYesNoField("Smooth regeneration", record.smooth_regen, record.smooth_regen_details)}
              </>
            )}
          </div>
        ))}

        {/* Additional sections would go here... */}
        
        {/* Print Footer - Only visible when printing */}
        <div className="hidden print:block print:mt-8 print:pt-4 print:border-t print:border-slate-300">
          <div className="text-center text-sm text-slate-600">
            <p>This report was generated electronically and contains diagnostic information as of {formatDate(record.created_at)}</p>
            <p className="mt-1">Report ID: {record.id}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrintSummary;
