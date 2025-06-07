
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const handler = async (req: Request): Promise<Response> => {
  console.log("Resend order email function called");

  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { comandaId } = await req.json();
    console.log("Resending email for order:", comandaId);

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

    // Get order items
    const { data: items, error: itemsError } = await supabase
      .from('itemi_comanda')
      .select(`
        *,
        produs:produse(nume)
      `)
      .eq('comanda_id', comandaId);

    if (itemsError) {
      throw new Error(`Error fetching order items: ${itemsError.message}`);
    }

    // Calculate total
    const total_comanda = items?.reduce((sum, item) => sum + item.total_item, 0) || 0;

    // Prepare email data
    const emailData = {
      comandaId: comanda.id,
      numarul_comanda: comanda.numar_comanda,
      distribuitor: comanda.distribuitor_id,
      oras_livrare: comanda.oras_livrare,
      adresa_livrare: comanda.adresa_livrare,
      telefon_livrare: comanda.telefon_livrare,
      items: items?.map(item => ({
        nume_produs: item.produs?.nume || 'Produs necunoscut',
        cantitate: item.cantitate,
        pret_unitar: item.pret_unitar,
        total_item: item.total_item
      })) || [],
      total_comanda,
      data_comanda: comanda.data_comanda
    };

    // Create HTML email content
    const itemsHtml = emailData.items.map(item => `
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
          <h2 style="color: #2c5aa0;">Comandă Retrimisă - ${emailData.numarul_comanda}</h2>
          
          <h3>Detalii Comandă:</h3>
          <ul>
            <li><strong>Numărul comenzii:</strong> ${emailData.numarul_comanda}</li>
            <li><strong>Data comenzii:</strong> ${new Date(emailData.data_comanda).toLocaleDateString('ro-RO')}</li>
            <li><strong>Distribuitor:</strong> ${emailData.distribuitor}</li>
          </ul>

          <h3>Detalii Livrare:</h3>
          <ul>
            <li><strong>Oraș:</strong> ${emailData.oras_livrare}</li>
            <li><strong>Adresa:</strong> ${emailData.adresa_livrare}</li>
            <li><strong>Telefon:</strong> ${emailData.telefon_livrare}</li>
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
            <h3 style="margin: 0 0 10px 0;">Total Comandă: ${emailData.total_comanda.toFixed(2)} RON</h3>
          </div>

          <p style="margin-top: 30px; color: #666; font-size: 14px;">
            Această comandă a fost retrimisă din sistemul de comenzi Fortem.
          </p>
        </body>
      </html>
    `;

    const emailResponse = await resend.emails.send({
      from: "lucian.cebuc@fortem.ro",
      to: ["lucian.cebuc@fortem.ro"],
      subject: `[RETRIMIS] Comandă #${emailData.numarul_comanda} - ${emailData.distribuitor}`,
      html: emailHtml,
    });

    console.log("Email resent successfully:", emailResponse);

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
    console.error("Error in resend-order-email function:", error);
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
