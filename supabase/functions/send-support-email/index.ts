import { Resend } from "npm:resend@4.7.0";
import { corsHeaders } from "../_shared/cors.ts";

// Support email configuration
const FROM_EMAIL = Deno.env.get("SUPPORT_FROM_EMAIL") || "support@resend.dev";
const TO_EMAIL = Deno.env.get("SUPPORT_TO_EMAIL") || "onboarding@resend.dev";

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
    
    // Get Resend API key
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    
    console.log("Checking Resend configuration...");
    console.log("API Key exists:", !!resendApiKey);
    
    if (!resendApiKey) {
      console.error("Missing Resend API key");
      return new Response(
        JSON.stringify({ error: "Resend API key not configured" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    const resend = new Resend(resendApiKey);
    
    const { name, email, subject, message, priority }: SupportEmailRequest = await req.json();
    console.log("Request data received:", { name, email, subject, messageLength: message?.length, priority });

    // Validate required fields
    if (!name || !email || !subject || !message) {
      console.error("Missing required fields");
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

    console.log("Sending email via Resend...");
    
    // Send email using Resend
    const { data: _, error: resendError } = await resend.emails.send({
      from: `Support <${FROM_EMAIL}>`,
      to: [TO_EMAIL],
      subject: `[${priority.toUpperCase()}] ${subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: ${priorityColor}; color: white; padding: 15px; border-radius: 5px 5px 0 0;">
            <h2 style="margin: 0;">New Support Request - ${priority.toUpperCase()} Priority</h2>
          </div>
          <div style="background-color: #f9f9f9; padding: 20px; border-radius: 0 0 5px 5px;">
            <h3 style="color: #333; margin-top: 0;">Contact Information</h3>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Subject:</strong> ${subject}</p>
            
            <h3 style="color: #333;">Message</h3>
            <div style="background-color: white; padding: 15px; border-left: 4px solid ${priorityColor}; margin: 10px 0;">
              ${message.replace(/\n/g, '<br>')}
            </div>
            
            <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
            <p style="color: #666; font-size: 12px;">
              <strong>Priority:</strong> ${priority}<br>
              <strong>Submitted:</strong> ${new Date().toLocaleString()}
            </p>
          </div>
        </div>
      `,
    });

    if (resendError) {
      console.error("Resend error:", resendError);
      throw new Error(`Resend failed: ${typeof resendError === "string" ? resendError : JSON.stringify(resendError)}`);
    }

    console.log("Email sent successfully via Resend");

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Support request sent successfully"
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );

  } catch (error: any) {
    console.error("Error in send-support-email function:", error);
    console.error("Error message:", error.message);
    console.error("Error stack:", error.stack);
    
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

Deno.serve(handler);