
import { supabase } from '../integrations/supabase/client';
import bcrypt from 'bcryptjs';

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
    // First, try to create the user account
    let userData;
    
    // Since Supabase doesn't allow setting hashed passwords directly,
    // we'll create a user with a temporary password and then they'll need to reset it
    const tempPassword = 'TempSetup' + Math.random().toString(36).substring(2, 15);
    
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: request.contact_email,
      password: tempPassword,
      email_confirm: true,
      user_metadata: {
        full_name: request.contact_person_name,
        station_id: stationId,
        station_name: request.company_name,
        requires_password_setup: true
      }
    });

    if (authError) {
      console.error('Failed to create user with admin API:', authError);
      throw authError;
    }

    userData = authData.user;

    if (userData) {
      // Update the user's profile
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: userData.id,
          station_id: stationId,
          full_name: request.contact_person_name,
          username: request.contact_email
        });

      if (profileError) {
        console.error('Profile update error:', profileError);
      }

      // Assign station_admin role
      const { error: roleError } = await supabase
        .from('user_roles')
        .insert({
          user_id: userData.id,
          role: 'station_admin',
          station_id: stationId,
          assigned_by: approvedBy
        });

      if (roleError) {
        console.error('Role assignment error:', roleError);
      }

      // Send password reset email so they can set their actual password
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(
        request.contact_email,
        {
          redirectTo: `${window.location.origin}/auth?setup=true&station=${stationId}`
        }
      );

      if (resetError) {
        console.error('Password reset email error:', resetError);
      }
    }

    return { userData, success: true };
  } catch (error) {
    console.error('Error creating station user account:', error);
    return { userData: null, success: false, error };
  }
};
