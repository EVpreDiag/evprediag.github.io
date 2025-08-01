import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SupportEmailRequest {
  name: string;
  email: string;
  subject: string;
  message: string;
  priority: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Processing support email request...");
    
    const { name, email, subject, message, priority }: SupportEmailRequest = await req.json();

    // Validate required fields
    if (!name || !email || !subject || !message) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Priority color coding for emails
    const priorityColors = {
      low: "#10B981",
      medium: "#F59E0B", 
      high: "#F97316",
      urgent: "#EF4444"
    };

    const priorityColor = priorityColors[priority as keyof typeof priorityColors] || priorityColors.medium;

    // Send confirmation email to the user
    const userEmailResponse = await resend.emails.send({
      from: "EVPreDiag Support <support@evprediag.com>",
      to: [email],
      subject: `Thank you for contacting EVPreDiag Support - ${subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: linear-gradient(135deg, #1e293b 0%, #334155 100%); color: white; border-radius: 10px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #3b82f6; margin: 0; font-size: 24px;">⚡ EVPreDiag Support</h1>
          </div>
          
          <div style="background: rgba(255,255,255,0.1); padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h2 style="color: #3b82f6; margin-top: 0;">Thank you for contacting us, ${name}!</h2>
            <p style="margin: 10px 0; line-height: 1.6;">We have received your support request and will get back to you as soon as possible.</p>
          </div>

          <div style="background: rgba(255,255,255,0.05); padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h3 style="color: #e2e8f0; margin-top: 0; border-bottom: 1px solid rgba(255,255,255,0.2); padding-bottom: 10px;">Your Request Details:</h3>
            <p style="margin: 8px 0;"><strong>Subject:</strong> ${subject}</p>
            <p style="margin: 8px 0;"><strong>Priority:</strong> <span style="color: ${priorityColor}; text-transform: uppercase; font-weight: bold;">${priority}</span></p>
            <p style="margin: 8px 0;"><strong>Message:</strong></p>
            <div style="background: rgba(0,0,0,0.3); padding: 15px; border-radius: 5px; margin-top: 10px; border-left: 3px solid #3b82f6;">
              ${message.replace(/\n/g, '<br>')}
            </div>
          </div>

          <div style="background: rgba(59, 130, 246, 0.1); padding: 20px; border-radius: 8px; border: 1px solid rgba(59, 130, 246, 0.3);">
            <h3 style="color: #3b82f6; margin-top: 0;">What happens next?</h3>
            <ul style="margin: 10px 0; padding-left: 20px; line-height: 1.6;">
              <li>Our support team will review your request</li>
              <li>You'll receive a response within 24 hours (priority tickets may be faster)</li>
              <li>We may ask for additional information if needed</li>
            </ul>
          </div>

          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid rgba(255,255,255,0.2);">
            <p style="margin: 5px 0; font-size: 14px; color: #94a3b8;">
              <strong>Need immediate assistance?</strong><br>
              📧 support@evprediag.com | 📞 +1 (555) 123-4567
            </p>
            <p style="margin: 15px 0 5px 0; font-size: 12px; color: #64748b;">
              © 2024 EVPreDiag. All rights reserved.
            </p>
          </div>
        </div>
      `,
    });

    console.log("User confirmation email sent:", userEmailResponse);

    // Send notification email to support team
    const supportEmailResponse = await resend.emails.send({
      from: "EVPreDiag Platform <noreply@evprediag.com>",
      to: ["support@evprediag.com"], // Replace with your actual support email
      subject: `[${priority.toUpperCase()}] New Support Request: ${subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 700px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #1e293b 0%, #334155 100%); color: white; padding: 20px; border-radius: 10px 10px 0 0;">
            <h1 style="margin: 0; color: #3b82f6; font-size: 24px;">⚡ New Support Request</h1>
            <div style="margin-top: 10px; padding: 10px; background: rgba(255,255,255,0.1); border-radius: 5px;">
              <span style="background: ${priorityColor}; color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: bold; text-transform: uppercase;">
                ${priority} Priority
              </span>
            </div>
          </div>
          
          <div style="background: #f8fafc; padding: 20px; border: 1px solid #e2e8f0;">
            <div style="margin-bottom: 20px;">
              <h3 style="color: #334155; margin: 0 0 10px 0; border-bottom: 2px solid #e2e8f0; padding-bottom: 5px;">Contact Information</h3>
              <p style="margin: 5px 0;"><strong>Name:</strong> ${name}</p>
              <p style="margin: 5px 0;"><strong>Email:</strong> <a href="mailto:${email}" style="color: #3b82f6;">${email}</a></p>
            </div>

            <div style="margin-bottom: 20px;">
              <h3 style="color: #334155; margin: 0 0 10px 0; border-bottom: 2px solid #e2e8f0; padding-bottom: 5px;">Request Details</h3>
              <p style="margin: 5px 0;"><strong>Subject:</strong> ${subject}</p>
              <p style="margin: 5px 0;"><strong>Priority:</strong> <span style="color: ${priorityColor}; font-weight: bold; text-transform: uppercase;">${priority}</span></p>
            </div>

            <div>
              <h3 style="color: #334155; margin: 0 0 10px 0; border-bottom: 2px solid #e2e8f0; padding-bottom: 5px;">Message</h3>
              <div style="background: white; padding: 15px; border-radius: 5px; border-left: 4px solid #3b82f6; white-space: pre-wrap; line-height: 1.6;">
${message}
              </div>
            </div>
          </div>

          <div style="background: #1e293b; color: white; padding: 15px; border-radius: 0 0 10px 10px; text-align: center;">
            <p style="margin: 0; font-size: 14px;">
              Received at ${new Date().toLocaleString()} | 
              <a href="mailto:${email}?subject=Re: ${subject}" style="color: #3b82f6;">Reply to Customer</a>
            </p>
          </div>
        </div>
      `,
    });

    console.log("Support notification email sent:", supportEmailResponse);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Support request sent successfully",
        userEmailId: userEmailResponse.data?.id,
        supportEmailId: supportEmailResponse.data?.id
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );

  } catch (error: any) {
    console.error("Error in send-support-email function:", error);
    return new Response(
      JSON.stringify({ 
        error: "Failed to send support request", 
        details: error.message 
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);