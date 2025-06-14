
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface OrderShippedRequest {
  numar_comanda: string;
  email_agent: string;
  nume_distribuitor: string;
  nume_transportator: string;
  numar_masina: string;
  telefon_sofer: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      numar_comanda, 
      email_agent, 
      nume_distribuitor, 
      nume_transportator, 
      numar_masina, 
      telefon_sofer 
    }: OrderShippedRequest = await req.json();

    console.log("Sending order shipped notification:", {
      numar_comanda,
      email_agent,
      nume_distribuitor,
      nume_transportator
    });

    const emailResponse = await resend.emails.send({
      from: "Fortem <comenzi@fortem.ro>",
      to: [email_agent],
      subject: `Comanda #${numar_comanda} a fost expediată`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Comanda a fost expediată</h2>
          
          <p>Bună ziua,</p>
          
          <p>Comanda dvs. <strong>#${numar_comanda}</strong> pentru clientul <strong>${nume_distribuitor}</strong> a fost expediată.</p>
          
          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #374151;">Detalii transport:</h3>
            <ul style="list-style: none; padding: 0;">
              <li style="margin-bottom: 8px;"><strong>Transportator:</strong> ${nume_transportator}</li>
              <li style="margin-bottom: 8px;"><strong>Număr mașină:</strong> ${numar_masina}</li>
              <li style="margin-bottom: 8px;"><strong>Telefon șofer:</strong> ${telefon_sofer}</li>
            </ul>
          </div>
          
          <p>Vă mulțumim pentru colaborare!</p>
          
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
          <p style="color: #6b7280; font-size: 14px;">
            Acest email a fost generat automat de sistemul Fortem.<br>
            Pentru întrebări, vă rugăm să contactați echipa de logistică.
          </p>
        </div>
      `,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, emailResponse }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-order-shipped-notification function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
