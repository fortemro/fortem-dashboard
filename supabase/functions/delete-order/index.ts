
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // Get the authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Verify the user token
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);

    if (authError || !user) {
      console.error('Auth error:', authError);
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { comandaId, motivAnulare } = await req.json();

    if (!comandaId) {
      return new Response(JSON.stringify({ error: 'ID comandă lipsește' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Attempting to cancel order:', comandaId, 'for user:', user.id);

    // Verificăm dacă comanda aparține utilizatorului și are status in_asteptare
    const { data: comanda, error: comandaError } = await supabaseClient
      .from('comenzi')
      .select('*')
      .eq('id', comandaId)
      .eq('user_id', user.id)
      .single();

    if (comandaError || !comanda) {
      console.error('Order fetch error:', comandaError);
      return new Response(JSON.stringify({ error: 'Comanda nu a fost găsită sau nu aveți permisiunea să o anulați' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (comanda.status !== 'in_asteptare') {
      return new Response(JSON.stringify({ 
        error: `Doar comenzile cu statusul "în așteptare" pot fi anulate. Status actual: ${comanda.status}` 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Marchează comanda ca anulată în loc să o șteargă
    const { error: updateError } = await supabaseClient
      .from('comenzi')
      .update({
        status: 'anulata',
        data_anulare: new Date().toISOString(),
        motiv_anulare: motivAnulare || 'Anulată de utilizator',
        anulat_de: user.id
      })
      .eq('id', comandaId);

    if (updateError) {
      console.error('Order cancel error:', updateError);
      return new Response(JSON.stringify({ 
        error: `Eroare la anularea comenzii: ${updateError.message}` 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Order cancelled successfully:', comandaId);

    return new Response(JSON.stringify({ 
      success: true, 
      message: `Comanda ${comanda.numar_comanda} a fost anulată cu succes` 
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(JSON.stringify({ 
      error: 'Eroare internă la anularea comenzii' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
