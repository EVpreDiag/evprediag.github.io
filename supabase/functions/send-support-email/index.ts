import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

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
    
    // Get EmailJS configuration
    const emailjsServiceId = Deno.env.get("EMAILJS_SERVICE_ID");
    const emailjsTemplateId = Deno.env.get("EMAILJS_TEMPLATE_ID");
    const emailjsPublicKey = Deno.env.get("EMAILJS_PUBLIC_KEY");
    const emailjsPrivateKey = Deno.env.get("EMAILJS_PRIVATE_KEY");
    
    console.log("Checking EmailJS configuration...");
    console.log("Service ID exists:", !!emailjsServiceId);
    console.log("Template ID exists:", !!emailjsTemplateId);
    console.log("Public Key exists:", !!emailjsPublicKey);
    console.log("Private Key exists:", !!emailjsPrivateKey);
    
    if (!emailjsServiceId || !emailjsTemplateId || !emailjsPublicKey || !emailjsPrivateKey) {
      console.error("Missing EmailJS configuration");
      return new Response(
        JSON.stringify({ error: "EmailJS configuration incomplete" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }
    
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

    console.log("Sending email via EmailJS...");
    
    // Send email using EmailJS
    const emailResponse = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        service_id: emailjsServiceId,
        template_id: emailjsTemplateId,
        user_id: emailjsPublicKey,
        accessToken: emailjsPrivateKey,
        template_params: {
          from_name: name,
          from_email: email,
          subject: subject,
          message: message,
          priority: priority,
          priority_color: priorityColor,
          timestamp: new Date().toLocaleString()
        }
      })
    });

    console.log("EmailJS response status:", emailResponse.status);
    
    if (!emailResponse.ok) {
      const errorText = await emailResponse.text();
      console.error("EmailJS error:", errorText);
      throw new Error(`EmailJS failed: ${emailResponse.status} - ${errorText}`);
    }

    const responseData = await emailResponse.text();
    console.log("EmailJS response:", responseData);
    console.log("Email sent successfully via EmailJS");

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Support request sent successfully via EmailJS"
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

serve(handler);