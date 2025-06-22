
import { supabase } from '../integrations/supabase/client';

export const sendVerificationEmail = async (email: string, type: 'station_registration' | 'user_signup') => {
  try {
    const token = generateVerificationToken();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Store verification token in database
    const { error } = await supabase
      .from('email_verifications')
      .insert({
        email,
        verification_token: token,
        expires_at: expiresAt.toISOString(),
        verification_type: type
      });

    if (error) throw error;

    // In a real implementation, you would send the email here
    // For now, we'll just log the verification link
    const verificationUrl = `${window.location.origin}/verify-email?token=${token}&email=${encodeURIComponent(email)}`;
    console.log('Verification email would be sent to:', email);
    console.log('Verification URL:', verificationUrl);

    return { success: true, verificationUrl };
  } catch (error) {
    console.error('Error sending verification email:', error);
    return { success: false, error };
  }
};

export const verifyEmail = async (token: string, email: string) => {
  try {
    const { data, error } = await supabase
      .from('email_verifications')
      .select('*')
      .eq('verification_token', token)
      .eq('email', email)
      .is('verified_at', null)
      .gt('expires_at', new Date().toISOString())
      .single();

    if (error || !data) {
      return { success: false, error: 'Invalid or expired verification token' };
    }

    // Mark as verified
    const { error: updateError } = await supabase
      .from('email_verifications')
      .update({ verified_at: new Date().toISOString() })
      .eq('id', data.id);

    if (updateError) throw updateError;

    return { success: true };
  } catch (error) {
    console.error('Error verifying email:', error);
    return { success: false, error };
  }
};

const generateVerificationToken = () => {
  return Array.from(crypto.getRandomValues(new Uint8Array(32)))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
};
