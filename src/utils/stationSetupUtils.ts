
import { supabase } from '../integrations/supabase/client';
import { generateSecurePassword } from './passwordUtils';

export const approveStationRegistration = async (requestId: string, approvedBy: string) => {
  try {
    console.log('Starting station registration approval for request:', requestId);
    
    // Get the registration request details
    const { data: request, error: fetchError } = await supabase
      .from('station_registration_requests')
      .select('*')
      .eq('id', requestId)
      .single();

    if (fetchError || !request) {
      console.error('Error fetching registration request:', fetchError);
      throw new Error('Registration request not found');
    }

    console.log('Found registration request:', request);

    // Generate a temporary password for the new user
    const tempPassword = generateSecurePassword();
    console.log('Generated temporary password for user');

    // Create the station first
    const { data: station, error: stationError } = await supabase
      .from('stations')
      .insert({
        name: request.company_name,
        email: request.contact_email,
        phone: request.contact_phone,
        address: `${request.address || ''}, ${request.city || ''}, ${request.state || ''} ${request.zip_code || ''}`.trim(),
        created_by: approvedBy
      })
      .select()
      .single();

    if (stationError || !station) {
      console.error('Error creating station:', stationError);
      throw new Error('Failed to create station');
    }

    console.log('Created station:', station.id);

    // Create the admin user account in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: request.contact_email,
      password: tempPassword,
      email_confirm: false, // We'll handle email confirmation separately
      user_metadata: {
        full_name: request.contact_person_name,
        station_id: station.id,
        role: 'station_admin'
      }
    });

    if (authError || !authData.user) {
      console.error('Error creating user account:', authError);
      // Clean up the station if user creation failed
      await supabase.from('stations').delete().eq('id', station.id);
      throw new Error('Failed to create user account');
    }

    console.log('Created user account:', authData.user.id);

    // Create profile for the user
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: authData.user.id,
        full_name: request.contact_person_name,
        username: request.contact_email.split('@')[0],
        station_id: station.id
      });

    if (profileError) {
      console.error('Error creating profile:', profileError);
      throw new Error('Failed to create user profile');
    }

    console.log('Created user profile');

    // Assign station_admin role
    const { error: roleError } = await supabase
      .from('user_roles')
      .insert({
        user_id: authData.user.id,
        role: 'station_admin',
        station_id: station.id,
        assigned_by: approvedBy,
        assigned_at: new Date().toISOString()
      });

    if (roleError) {
      console.error('Error assigning role:', roleError);
      throw new Error('Failed to assign station admin role');
    }

    console.log('Assigned station_admin role');

    // Update the registration request status
    const { error: updateError } = await supabase
      .from('station_registration_requests')
      .update({
        status: 'approved',
        approved_by: approvedBy,
        approved_at: new Date().toISOString(),
        admin_user_id: authData.user.id
      })
      .eq('id', requestId);

    if (updateError) {
      console.error('Error updating registration request:', updateError);
      throw new Error('Failed to update registration status');
    }

    console.log('Updated registration request status');

    // Send email confirmation to the user
    const { error: emailError } = await supabase.auth.admin.generateLink({
      type: 'signup',
      email: request.contact_email,
      options: {
        redirectTo: `${window.location.origin}/auth?message=confirm-email`
      }
    });

    if (emailError) {
      console.warn('Warning: Could not send confirmation email:', emailError);
      // Don't throw error here as the main process was successful
    }

    console.log('Station registration approved successfully');
    
    return {
      success: true,
      stationId: station.id,
      userId: authData.user.id,
      tempPassword,
      message: 'Station registration approved successfully'
    };

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
