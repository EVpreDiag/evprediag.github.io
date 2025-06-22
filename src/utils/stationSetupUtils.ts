
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
    // Create user account with the actual password from registration
    // We'll need to use a temporary password since we can't use the hashed one directly
    const tempPassword = generateTempPassword();
    
    const { data, error } = await supabase.auth.signUp({
      email: request.contact_email,
      password: tempPassword,
      options: {
        emailRedirectTo: `${window.location.origin}/auth?setup=true&station=${stationId}&email=${encodeURIComponent(request.contact_email)}`,
        data: {
          full_name: request.contact_person_name,
          station_id: stationId,
          station_name: request.company_name,
          requires_password_setup: true,
          temp_password: tempPassword // Include temp password in metadata
        }
      }
    });

    if (error) {
      console.error('Failed to create user account:', error);
      throw error;
    }

    if (data.user) {
      console.log('User signup initiated successfully, email confirmation required');
      
      // Store the temporary password information for the user to reference
      // This will be used when they confirm their email
      return { 
        userData: data.user, 
        success: true, 
        tempPassword: tempPassword,
        message: 'Invitation sent successfully. User will receive an email with login instructions.'
      };
    }

    return { userData: null, success: false, error: 'User creation failed' };
  } catch (error) {
    console.error('Error creating station user account:', error);
    return { userData: null, success: false, error };
  }
};

// Generate a secure temporary password
const generateTempPassword = (): string => {
  const length = 12;
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
  let password = '';
  
  // Ensure at least one of each type
  password += 'A'; // uppercase
  password += 'a'; // lowercase  
  password += '1'; // number
  password += '!'; // special char
  
  // Fill the rest randomly
  for (let i = 4; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  
  // Shuffle the password
  return password.split('').sort(() => Math.random() - 0.5).join('');
};
