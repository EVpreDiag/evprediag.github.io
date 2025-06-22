
import { supabase } from '../integrations/supabase/client';

export interface StationRegistrationRequest {
  id: string;
  company_name: string;
  contact_person_name: string;
  contact_email: string;
  contact_phone: string | null;
  address: string | null;
  password_hash: string | null;
}

export const createStationUserAccount = async (
  request: StationRegistrationRequest,
  stationId: string,
  approvedBy: string
) => {
  try {
    // Since we can't create users with specific passwords from the frontend,
    // we'll send a signup invitation email instead
    const { data, error } = await supabase.auth.signUp({
      email: request.contact_email,
      password: 'TempPassword123!', // Temporary password - user will need to reset
      options: {
        emailRedirectTo: `${window.location.origin}/auth?setup=true&station=${stationId}`,
        data: {
          full_name: request.contact_person_name,
          station_id: stationId,
          station_name: request.company_name,
          requires_password_setup: true
        }
      }
    });

    if (error) {
      console.error('Failed to create user account:', error);
      throw error;
    }

    // If user creation was successful, we need to wait for the user to confirm their email
    // before we can assign roles. For now, we'll create a pending role assignment.
    if (data.user) {
      console.log('User signup initiated successfully, email confirmation required');
      
      // Note: The role assignment will need to be handled after email confirmation
      // This could be done via a database trigger or webhook when the user confirms their email
      
      return { userData: data.user, success: true };
    }

    return { userData: null, success: false, error: 'User creation failed' };
  } catch (error) {
    console.error('Error creating station user account:', error);
    return { userData: null, success: false, error };
  }
};
