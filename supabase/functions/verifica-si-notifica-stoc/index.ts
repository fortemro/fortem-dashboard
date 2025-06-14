
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ProdusStocCritic {
  id: string;
  nume: string;
  stoc_disponibil: number;
  prag_alerta_stoc: number;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Pornesc verificarea stocurilor critice...");

    // Obține toate produsele cu stoc critic
    const { data: produse, error: produseError } = await supabase
      .from("produse")
      .select("id, nume, stoc_disponibil, prag_alerta_stoc")
      .filter("stoc_disponibil", "lte", "prag_alerta_stoc")
      .eq("activ", true);

    if (produseError) {
      console.error("Eroare la obținerea produselor:", produseError);
      throw new Error(produseError.message);
    }

    if (!produse || produse.length === 0) {
      console.log("Nu sunt produse cu stoc critic.");
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "Nu sunt produse cu stoc critic.",
          produse_critice: 0
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    console.log(`Găsite ${produse.length} produse cu stoc critic`);

    // Pregătește conținutul email-ului
    const produseStocCritic = produse as ProdusStocCritic[];
    const produseEpuizate = produseStocCritic.filter(p => p.stoc_disponibil === 0);
    const produseAlerte = produseStocCritic.filter(p => p.stoc_disponibil > 0);

    const htmlContent = `
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .header { background-color: #f44336; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; }
            .alert-section { margin: 20px 0; }
            .critical { background-color: #ffebee; border-left: 4px solid #f44336; padding: 10px; margin: 10px 0; }
            .warning { background-color: #fff3e0; border-left: 4px solid #ff9800; padding: 10px; margin: 10px 0; }
            .product-list { list-style-type: none; padding: 0; }
            .product-item { padding: 8px; margin: 5px 0; border: 1px solid #ddd; border-radius: 4px; }
            .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>🚨 Alertă Stoc Critic</h1>
            <p>Raport zilnic - ${new Date().toLocaleDateString('ro-RO')}</p>
          </div>
          
          <div class="content">
            <h2>Rezumat</h2>
            <p><strong>Total produse cu probleme de stoc:</strong> ${produseStocCritic.length}</p>
            <p><strong>Produse epuizate:</strong> ${produseEpuizate.length}</p>
            <p><strong>Produse sub pragul de alertă:</strong> ${produseAlerte.length}</p>

            ${produseEpuizate.length > 0 ? `
            <div class="alert-section">
              <h3>🔴 Produse Epuizate (Stoc = 0)</h3>
              <ul class="product-list">
                ${produseEpuizate.map(produs => `
                  <li class="product-item critical">
                    <strong>${produs.nume}</strong><br>
                    Stoc: ${produs.stoc_disponibil} | Prag alertă: ${produs.prag_alerta_stoc}
                  </li>
                `).join('')}
              </ul>
            </div>
            ` : ''}

            ${produseAlerte.length > 0 ? `
            <div class="alert-section">
              <h3>🟡 Produse Sub Pragul de Alertă</h3>
              <ul class="product-list">
                ${produseAlerte.map(produs => `
                  <li class="product-item warning">
                    <strong>${produs.nume}</strong><br>
                    Stoc: ${produs.stoc_disponibil} | Prag alertă: ${produs.prag_alerta_stoc}
                  </li>
                `).join('')}
              </ul>
            </div>
            ` : ''}

            <div class="footer">
              <p>Acest email a fost generat automat de sistemul de management al stocurilor.</p>
              <p>Pentru mai multe detalii, accesați panoul de administrare.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    // Trimite email către adresa predefinită
    try {
      await resend.emails.send({
        from: "Sistem Stocuri <onboarding@resend.dev>",
        to: ["lucian.cebuc@fortem.ro"],
        subject: `🚨 Alertă Stoc Critic - ${produseStocCritic.length} produse necesită atenție`,
        html: htmlContent,
      });
      
      console.log("Email trimis cu succes către lucian.cebuc@fortem.ro");
    } catch (emailError) {
      console.error("Eroare la trimiterea email-ului:", emailError);
      throw new Error(`Eroare la trimiterea email-ului: ${emailError.message}`);
    }

    console.log("Verificare completă și email trimis.");

    return new Response(
      JSON.stringify({
        success: true,
        message: "Verificare stoc completă și email trimis",
        produse_critice: produseStocCritic.length,
        produse_epuizate: produseEpuizate.length,
        produse_alerte: produseAlerte.length,
        email_trimis_catre: "lucian.cebuc@fortem.ro",
        produse: produseStocCritic.map(p => ({
          nume: p.nume,
          stoc_disponibil: p.stoc_disponibil,
          prag_alerta_stoc: p.prag_alerta_stoc
        }))
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );

  } catch (error: any) {
    console.error("Eroare în funcția de verificare stoc:", error);
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
