
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

    const itemsHtml = orderData.items.map(item => `
      <tr>
        <td style="padding: 8px; border: 1px solid #ddd;">${item.nume_produs}</td>
        <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${item.cantitate}</td>
        <td style="padding: 8px; border: 1px solid #ddd; text-align: right;">${item.pret_unitar.toFixed(2)} RON</td>
        <td style="padding: 8px; border: 1px solid #ddd; text-align: right;">${item.total_item.toFixed(2)} RON</td>
      </tr>
    `).join('');

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

    const emailResponse = await resend.emails.send({
      from: "lucian.cebuc@fortem.ro",
      to: ["lucian.cebuc@fortem.ro"],
      subject: `Comandă Nouă #${orderData.numarul_comanda} - ${orderData.distribuitor}`,
      html: emailHtml,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ 
      success: true, 
      emailId: emailResponse.data?.id 
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
        error: error.message,
        success: false 
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
