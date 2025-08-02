import { corsHeaders } from "../_shared/cors.ts"; // Update the path if needed

// Environment variables
const EMAILJS_SERVICE_ID = Deno.env.get("EMAILJS_SERVICE_ID");
const EMAILJS_TEMPLATE_ID = Deno.env.get("EMAILJS_TEMPLATE_ID");
const EMAILJS_PUBLIC_KEY = Deno.env.get("EMAILJS_PUBLIC_KEY");
const EMAILJS_PRIVATE_KEY = Deno.env.get("EMAILJS_PRIVATE_KEY");

// Support form interface
interface SupportEmailRequest {
  name: string;
  email: string;
  subject: string;
  message: string;
  priority: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { name, email, subject, message, priority }: SupportEmailRequest = await req.json();

    // Validate required fields
    if (!name || !email || !subject || !message) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Check EmailJS config
    if (
      !EMAILJS_SERVICE_ID ||
      !EMAILJS_TEMPLATE_ID ||
      !EMAILJS_PUBLIC_KEY ||
      !EMAILJS_PRIVATE_KEY
    ) {
      return new Response(JSON.stringify({ error: "Missing EmailJS configuration" }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Priority color mapping
    const priorityColors = {
      low: "#10B981",
      medium: "#F59E0B",
      high: "#F97316",
      urgent: "#EF4444",
    };

    const priorityColor = priorityColors[priority as keyof typeof priorityColors] || priorityColors.medium;

    // EmailJS template variables
    const templateParams = {
      name,
      email,
      subject,
      priority,
      submitted_at: new Date().toLocaleString(),
      body_html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: ${priorityColor}; color: white; padding: 15px; border-radius: 5px 5px 0 0;">
            <h2 style="margin: 0;">Support Request - ${priority.toUpperCase()}</h2>
          </div>
          <div style="background-color: #f9f9f9; padding: 20px;">
            <h3>From: ${name} (${email})</h3>
            <p><strong>Subject:</strong> ${subject}</p>
            <div style="padding: 15px; background: white; border-left: 4px solid ${priorityColor}; margin-top: 10px;">
              ${message.replace(/\n/g, "<br>")}
            </div>
            <p style="font-size: 12px; color: #888; margin-top: 20px;">
              Sent at: ${new Date().toLocaleString()}
            </p>
          </div>
        </div>
      `
    };

    // Send via EmailJS REST API
    const response = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        service_id: EMAILJS_SERVICE_ID,
        template_id: EMAILJS_TEMPLATE_ID,
        user_id: EMAILJS_PUBLIC_KEY,
        accessToken: EMAILJS_PRIVATE_KEY,
        template_params: templateParams,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`EmailJS request failed: ${response.status} ${errorText}`);
    }

    console.log("✅ Email sent:", response.status, response.text);

    return new Response(
      JSON.stringify({ success: true, message: "Support request sent." }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );

  } catch (err) {
    console.error("❌ Email sending failed:", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return new Response(JSON.stringify({ error: "Failed to send support request", details: message }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
};

Deno.serve(handler);
