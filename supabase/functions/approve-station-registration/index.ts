
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.9'
import { corsHeaders } from '../_shared/cors.ts'

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { requestId, approvedBy } = await req.json()

    // Create service role client for admin operations
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    console.log('Starting station registration approval for request:', requestId)

    // Get the registration request details
    const { data: request, error: fetchError } = await supabaseAdmin
      .from('station_registration_requests')
      .select('*')
      .eq('id', requestId)
      .single()

    if (fetchError || !request) {
      console.error('Error fetching registration request:', fetchError)
      throw new Error('Registration request not found')
    }

    console.log('Found registration request:', request)

    // Generate a temporary password
    const tempPassword = generateSecurePassword()
    console.log('Generated temporary password for user')

    // Create the station first
    const { data: station, error: stationError } = await supabaseAdmin
      .from('stations')
      .insert({
        name: request.company_name,
        email: request.contact_email,
        phone: request.contact_phone,
        address: `${request.address || ''}, ${request.city || ''}, ${request.state || ''} ${request.zip_code || ''}`.trim(),
        created_by: approvedBy
      })
      .select()
      .single()

    if (stationError || !station) {
      console.error('Error creating station:', stationError)
      throw new Error('Failed to create station')
    }

    console.log('Created station:', station.id)

    // Create the admin user account using admin API
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: request.contact_email,
      password: tempPassword,
      email_confirm: true,
      user_metadata: {
        full_name: request.contact_person_name,
        station_id: station.id,
        role: 'station_admin'
      }
    })

    if (authError || !authData.user) {
      console.error('Error creating user account:', authError)
      // Clean up the station if user creation failed
      await supabaseAdmin.from('stations').delete().eq('id', station.id)
      throw new Error('Failed to create user account')
    }

    console.log('Created user account:', authData.user.id)

    // Check if profile already exists and handle accordingly
    const { data: existingProfile } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('id', authData.user.id)
      .single()

    if (!existingProfile) {
      // Create profile for the user only if it doesn't exist
      const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .insert({
          id: authData.user.id,
          full_name: request.contact_person_name,
          username: request.contact_email.split('@')[0],
          station_id: station.id
        })

      if (profileError) {
        console.error('Error creating profile:', profileError)
        throw new Error('Failed to create user profile')
      }

      console.log('Created user profile')
    } else {
      console.log('Profile already exists, updating with station info')
      // Update existing profile with station information
      const { error: profileUpdateError } = await supabaseAdmin
        .from('profiles')
        .update({
          full_name: request.contact_person_name,
          station_id: station.id
        })
        .eq('id', authData.user.id)

      if (profileUpdateError) {
        console.error('Error updating profile:', profileUpdateError)
        throw new Error('Failed to update user profile')
      }
    }

    // Assign station_admin role
    const { error: roleError } = await supabaseAdmin
      .from('user_roles')
      .insert({
        user_id: authData.user.id,
        role: 'station_admin',
        station_id: station.id,
        assigned_by: approvedBy,
        assigned_at: new Date().toISOString()
      })

    if (roleError) {
      console.error('Error assigning role:', roleError)
      throw new Error('Failed to assign station admin role')
    }

    console.log('Assigned station_admin role')

    // Update the registration request status
    const { error: updateError } = await supabaseAdmin
      .from('station_registration_requests')
      .update({
        status: 'approved',
        approved_by: approvedBy,
        approved_at: new Date().toISOString(),
        admin_user_id: authData.user.id
      })
      .eq('id', requestId)

    if (updateError) {
      console.error('Error updating registration request:', updateError)
      throw new Error('Failed to update registration status')
    }

    console.log('Station registration approved successfully')

    return new Response(
      JSON.stringify({
        success: true,
        stationId: station.id,
        userId: authData.user.id,
        tempPassword,
        message: 'Station registration approved successfully'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    )

  } catch (error) {
    console.error('Error in station registration approval:', error)
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})

function generateSecurePassword(): string {
  const length = 12;
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';
  
  const allChars = uppercase + lowercase + numbers + symbols;
  
  let password = '';
  
  // Ensure at least one character from each category
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += symbols[Math.floor(Math.random() * symbols.length)];
  
  // Fill the rest randomly
  for (let i = 4; i < length; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)];
  }
  
  // Shuffle the password
  return password.split('').sort(() => Math.random() - 0.5).join('');
}
