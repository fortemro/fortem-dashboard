
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface OrderEmailRequest {
  comandaId: string;
  numarul_comanda: string;
  distribuitor: string;
  oras_livrare: string;
  adresa_livrare: string;
  telefon_livrare: string;
  items: Array<{
    nume_produs: string;
    cantitate: number;
    pret_unitar: number;
    total_item: number;
  }>;
  total_comanda: number;
  data_comanda: string;
  recipients?: string[];
  custom_message?: string;
}

const handler = async (req: Request): Promise<Response> => {
  console.log("Send order email function called");

  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const orderData: OrderEmailRequest = await req.json();
    console.log("Order data received:", orderData);

    // Validate required data
    if (!orderData.numarul_comanda || !orderData.distribuitor || !orderData.items || orderData.items.length === 0) {
      throw new Error("Date incomplete pentru trimiterea email-ului");
    }

    const itemsHtml = orderData.items.map(item => `
      <tr>
        <td style="padding: 8px; border: 1px solid #ddd;">${item.nume_produs}</td>
        <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${item.cantitate}</td>
        <td style="padding: 8px; border: 1px solid #ddd; text-align: right;">${item.pret_unitar.toFixed(2)} RON</td>
        <td style="padding: 8px; border: 1px solid #ddd; text-align: right;">${item.total_item.toFixed(2)} RON</td>
      </tr>
    `).join('');

    const customMessageHtml = orderData.custom_message ? `
      <div style="margin: 20px 0; padding: 15px; background-color: #fff3cd; border-left: 4px solid #ffc107; border-radius: 4px;">
        <h4 style="margin: 0 0 10px 0; color: #856404;">Mesaj personalizat:</h4>
        <p style="margin: 0; color: #856404;">${orderData.custom_message}</p>
      </div>
    ` : '';

    const emailHtml = `
      <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <h2 style="color: #2c5aa0;">Comandă Nouă Primită</h2>
          
          <h3>Detalii Comandă:</h3>
          <ul>
            <li><strong>Numărul comenzii:</strong> ${orderData.numarul_comanda}</li>
            <li><strong>Data comenzii:</strong> ${new Date(orderData.data_comanda).toLocaleDateString('ro-RO')}</li>
            <li><strong>Distribuitor:</strong> ${orderData.distribuitor}</li>
          </ul>

          <h3>Detalii Livrare:</h3>
          <ul>
            <li><strong>Oraș:</strong> ${orderData.oras_livrare}</li>
            <li><strong>Adresa:</strong> ${orderData.adresa_livrare}</li>
            <li><strong>Telefon:</strong> ${orderData.telefon_livrare}</li>
          </ul>

          ${customMessageHtml}

          <h3>Produse Comandate:</h3>
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <thead>
              <tr style="background-color: #f2f2f2;">
                <th style="padding: 10px; border: 1px solid #ddd; text-align: left;">Produs</th>
                <th style="padding: 10px; border: 1px solid #ddd; text-align: center;">Cantitate</th>
                <th style="padding: 10px; border: 1px solid #ddd; text-align: right;">Preț Unitar</th>
                <th style="padding: 10px; border: 1px solid #ddd; text-align: right;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>

          <div style="margin-top: 20px; padding: 15px; background-color: #f9f9f9; border-left: 4px solid #2c5aa0;">
            <h3 style="margin: 0 0 10px 0;">Total Comandă: ${orderData.total_comanda.toFixed(2)} RON</h3>
          </div>

          <p style="margin-top: 30px; color: #666; font-size: 14px;">
            Această comandă a fost generată automat din sistemul de comenzi Fortem.
          </p>
        </body>
      </html>
    `;

    // Use a verified domain - onboarding@resend.dev is always verified
    const fromEmail = "onboarding@resend.dev";
    const recipients = orderData.recipients || ["lucian.cebuc@fortem.ro"];

    console.log("Attempting to send email with from:", fromEmail, "to:", recipients);

    const emailResponse = await resend.emails.send({
      from: fromEmail,
      to: recipients,
      subject: `Comandă Nouă #${orderData.numarul_comanda} - ${orderData.distribuitor}`,
      html: emailHtml,
    });

    console.log("Email response:", emailResponse);

    if (emailResponse.error) {
      console.error("Resend API error:", emailResponse.error);
      throw new Error(`Eroare Resend: ${emailResponse.error.message}`);
    }

    console.log("Email sent successfully:", emailResponse.data);

    return new Response(JSON.stringify({ 
      success: true, 
      emailId: emailResponse.data?.id,
      message: "Email trimis cu succes" 
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-order-email function:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message || "Eroare necunoscută",
        success: false,
        details: error.toString()
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
