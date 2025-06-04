
import { supabase } from '@/integrations/supabase/client';

// Security utility functions
export const sanitizeInput = (input: string): string => {
  // Basic input sanitization to prevent XSS
  return input
    .replace(/[<>]/g, '') // Remove angle brackets
    .trim()
    .substring(0, 1000); // Limit length
};

export const validateVIN = (vin: string): boolean => {
  // VIN validation - 17 alphanumeric characters
  const vinRegex = /^[A-HJ-NPR-Z0-9]{17}$/i;
  return vinRegex.test(vin);
};

export const validateRONumber = (roNumber: string): boolean => {
  // RO number validation - alphanumeric, reasonable length
  const roRegex = /^[A-Z0-9-]{1,20}$/i;
  return roRegex.test(roNumber);
};

export const secureLog = (message: string, level: 'info' | 'warn' | 'error' = 'info', data?: any) => {
  // Only log errors in production, and sanitize sensitive data
  if (process.env.NODE_ENV === 'production' && level !== 'error') {
    return;
  }
  
  // Remove sensitive data from logs
  const sanitizedData = data ? JSON.parse(JSON.stringify(data, (key, value) => {
    // Remove potential sensitive fields
    if (key.toLowerCase().includes('password') || 
        key.toLowerCase().includes('token') || 
        key.toLowerCase().includes('secret')) {
      return '[REDACTED]';
    }
    return value;
  })) : undefined;
  
  console[level](`[${new Date().toISOString()}] ${message}`, sanitizedData);
};

export const checkRecordOwnership = async (recordId: string, tableName: 'ev_diagnostic_records' | 'phev_diagnostic_records'): Promise<boolean> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;
    
    const { data, error } = await supabase
      .from(tableName)
      .select('technician_id')
      .eq('id', recordId)
      .single();
    
    if (error) {
      secureLog('Error checking record ownership', 'error', { error: error.message, recordId });
      return false;
    }
    
    return data?.technician_id === user.id;
  } catch (error) {
    secureLog('Exception in checkRecordOwnership', 'error', error);
    return false;
  }
};
