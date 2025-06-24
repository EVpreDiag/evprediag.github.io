
import { supabase } from '../integrations/supabase/client';

export const approveStationRegistration = async (requestId: string, approvedBy: string) => {
  try {
    console.log('Starting station registration approval for request:', requestId);
    
    // Call the Edge Function to handle the approval
    const { data, error } = await supabase.functions.invoke('approve-station-registration', {
      body: {
        requestId,
        approvedBy
      }
    });

    if (error) {
      console.error('Error calling approval function:', error);
      throw new Error(error.message || 'Failed to approve registration');
    }

    if (!data.success) {
      throw new Error(data.error || 'Registration approval failed');
    }

    console.log('Station registration approved successfully');
    return data;

  } catch (error) {
    console.error('Error in station registration approval:', error);
    throw error;
  }
};

export const rejectStationRegistration = async (requestId: string, rejectedBy: string, reason: string) => {
  const { error } = await supabase
    .from('station_registration_requests')
    .update({
      status: 'rejected',
      approved_by: rejectedBy,
      approved_at: new Date().toISOString(),
      rejection_reason: reason
    })
    .eq('id', requestId);

  if (error) {
    throw new Error('Failed to reject registration request');
  }

  return { success: true, message: 'Registration request rejected' };
};
