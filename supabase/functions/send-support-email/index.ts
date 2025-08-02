import { Resend } from "npm:resend@2.0.0";
import { corsHeaders } from "../_shared/cors.ts";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

interface SupportEmailRequest {
  name: string;
  email: string;
  subject: string;
  message: string;
  priority: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { name, email, subject, message, priority }: SupportEmailRequest = await req.json();
    
    if (!name || !email || !subject || !message) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const priorityColorMap = {
      low: "#10B981",
      medium: "#F59E0B", 
      high: "#F97316",
      urgent: "#EF4444",
    } as const;

    const priorityColor = priorityColorMap[priority as keyof typeof priorityColorMap] || priorityColorMap.medium;

    const emailResponse = await resend.emails.send({
      from: "Support <onboarding@resend.dev>",
      to: ["support@yourdomain.com"], // You can update this to your actual support email
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

    console.log("Email sent via Resend:", emailResponse);
    return new Response(JSON.stringify({ success: true, message: "Support request sent successfully" }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });

  } catch (error) {
    console.error("Support email error:", error);
    return new Response(JSON.stringify({ error: "Failed to send support request", details: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
};

Deno.serve(handler);