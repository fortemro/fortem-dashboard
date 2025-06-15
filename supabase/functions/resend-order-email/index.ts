
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ResendOrderEmailRequest {
  comandaId: string;
  recipients?: string[];
  custom_message?: string;
}

const handler = async (req: Request): Promise<Response> => {
  console.log("Resend order email function called");

  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { comandaId, recipients, custom_message }: ResendOrderEmailRequest = await req.json();
    console.log("Resending email for order:", comandaId, "to recipients:", recipients);

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get order details
    const { data: comanda, error: comandaError } = await supabase
      .from('comenzi')
      .select('*')
      .eq('id', comandaId)
      .single();

    if (comandaError) {
      throw new Error(`Error fetching order: ${comandaError.message}`);
    }

    // Get order items first
    const { data: items, error: itemsError } = await supabase
      .from('itemi_comanda')
      .select('*')
      .eq('comanda_id', comandaId);

    if (itemsError) {
      throw new Error(`Error fetching order items: ${itemsError.message}`);
    }

    // Get products details separately to avoid relationship ambiguity
    const itemsWithProducts = [];
    if (items && items.length > 0) {
      for (const item of items) {
        const { data: productData, error: productError } = await supabase
          .from('produse')
          .select('nume')
          .eq('id', item.produs_id)
          .single();

        if (productError) {
          console.error(`Error fetching product for item ${item.id}:`, productError);
        }

        itemsWithProducts.push({
          ...item,
          nume_produs: productData?.nume || 'Produs necunoscut'
        });
      }
    }

    // Calculate total
    const total_comanda = itemsWithProducts.reduce((sum, item) => sum + item.total_item, 0);

    // Validate required data
    if (!comanda.numar_comanda || !comanda.distribuitor_id || !itemsWithProducts || itemsWithProducts.length === 0) {
      throw new Error("Date incomplete pentru retrimiterea email-ului");
    }

    const itemsHtml = itemsWithProducts.map(item => `
      <tr>
        <td style="padding: 8px; border: 1px solid #ddd;">${item.nume_produs}</td>
        <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${item.cantitate}</td>
        <td style="padding: 8px; border: 1px solid #ddd; text-align: right;">${item.pret_unitar.toFixed(2)} RON</td>
        <td style="padding: 8px; border: 1px solid #ddd; text-align: right;">${item.total_item.toFixed(2)} RON</td>
      </tr>
    `).join('');

    const customMessageHtml = custom_message ? `
      <div style="margin: 20px 0; padding: 15px; background-color: #fff3cd; border-left: 4px solid #ffc107; border-radius: 4px;">
        <h4 style="margin: 0 0 10px 0; color: #856404;">Mesaj pentru retrimitere:</h4>
        <p style="margin: 0; color: #856404;">${custom_message}</p>
      </div>
    ` : '';

    const emailHtml = `
      <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <h2 style="color: #2c5aa0;">Comandă Retrimisă</h2>
          
          <h3>Detalii Comandă:</h3>
          <ul>
            <li><strong>Numărul comenzii:</strong> ${comanda.numar_comanda}</li>
            <li><strong>Data comenzii:</strong> ${new Date(comanda.data_comanda).toLocaleDateString('ro-RO')}</li>
            <li><strong>Distribuitor:</strong> ${comanda.distribuitor_id}</li>
          </ul>

          <h3>Detalii Livrare:</h3>
          <ul>
            <li><strong>Oraș:</strong> ${comanda.oras_livrare}</li>
            <li><strong>Adresa:</strong> ${comanda.adresa_livrare}</li>
            <li><strong>Telefon:</strong> ${comanda.telefon_livrare}</li>
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
            <h3 style="margin: 0 0 10px 0;">Total Comandă: ${total_comanda.toFixed(2)} RON</h3>
          </div>

          <p style="margin-top: 30px; color: #666; font-size: 14px;">
            Această comandă a fost retrimisă din sistemul de comenzi Fortem.
          </p>
        </body>
      </html>
    `;

    // Use the same verified domain as send-order-email
    const fromEmail = "onboarding@resend.dev";
    
    // Prepare recipients - if none provided, use default
    const requestedRecipients = recipients && recipients.length > 0 
      ? recipients 
      : ["lucian.cebuc@fortem.ro"];

    console.log("Attempting to resend email with from:", fromEmail, "to:", requestedRecipients);

    // First try to send to all requested recipients
    let emailResponse = await resend.emails.send({
      from: fromEmail,
      to: requestedRecipients,
      subject: `[RETRIMIS] Comandă #${comanda.numar_comanda} - ${comanda.distribuitor_id}`,
      html: emailHtml,
    });

    console.log("Email response:", emailResponse);

    // If there's a permission error (403), try sending only to verified email
    if (emailResponse.error && emailResponse.error.statusCode === 403) {
      console.log("Permission error detected, falling back to verified email only");
      
      const fallbackRecipients = ["lucian.cebuc@fortem.ro"];
      emailResponse = await resend.emails.send({
        from: fromEmail,
        to: fallbackRecipients,
        subject: `[RETRIMIS] Comandă #${comanda.numar_comanda} - ${comanda.distribuitor_id}`,
        html: emailHtml,
      });

      console.log("Fallback email response:", emailResponse);

      if (emailResponse.error) {
        throw new Error(`Eroare Resend: ${emailResponse.error.message}`);
      }

      // Return success with warning about restricted recipients
      return new Response(JSON.stringify({ 
        success: true, 
        emailId: emailResponse.data?.id,
        message: "Email retrimis cu succes",
        sentTo: fallbackRecipients,
        warning: "Din cauza restricțiilor Resend, email-ul a fost trimis doar la adresa verificată (lucian.cebuc@fortem.ro)"
      }), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      });
    }

    if (emailResponse.error) {
      console.error("Resend API error:", emailResponse.error);
      throw new Error(`Eroare Resend: ${emailResponse.error.message}`);
    }

    console.log("Email resent successfully:", emailResponse.data);

    return new Response(JSON.stringify({ 
      success: true, 
      emailId: emailResponse.data?.id,
      message: "Email retrimis cu succes",
      sentTo: requestedRecipients
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in resend-order-email function:", error);
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
