
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
      console.error('Missing authorization header');
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
      console.error('Missing order ID');
      return new Response(JSON.stringify({ error: 'ID comandă lipsește' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Processing order cancellation:', {
      comandaId,
      userId: user.id,
      motivAnulare,
      timestamp: new Date().toISOString()
    });

    // Verificăm dacă comanda aparține utilizatorului și are status in_asteptare
    const { data: comanda, error: comandaError } = await supabaseClient
      .from('comenzi')
      .select('*')
      .eq('id', comandaId)
      .eq('user_id', user.id)
      .single();

    if (comandaError || !comanda) {
      console.error('Order fetch error:', comandaError);
      return new Response(JSON.stringify({ 
        error: 'Comanda nu a fost găsită sau nu aveți permisiunea să o anulați',
        success: false 
      }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (comanda.status !== 'in_asteptare') {
      console.error('Invalid status for cancellation:', comanda.status);
      return new Response(JSON.stringify({ 
        error: `Doar comenzile cu statusul "în așteptare" pot fi anulate. Status actual: ${comanda.status}`,
        success: false 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Prepare cancellation data
    const cancellationData = {
      status: 'anulata',
      data_anulare: new Date().toISOString(),
      motiv_anulare: motivAnulare || 'Anulată de utilizator',
      anulat_de: user.id,
      updated_at: new Date().toISOString()
    };

    console.log('Updating order with cancellation data:', cancellationData);

    // Marchează comanda ca anulată în loc să o șteargă
    const { error: updateError } = await supabaseClient
      .from('comenzi')
      .update(cancellationData)
      .eq('id', comandaId);

    if (updateError) {
      console.error('Order cancellation error:', updateError);
      return new Response(JSON.stringify({ 
        error: `Eroare la anularea comenzii: ${updateError.message}`,
        success: false 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Order cancelled successfully:', {
      orderNumber: comanda.numar_comanda,
      orderPallets: comanda.numar_paleti,
      cancellationReason: motivAnulare || 'Anulată de utilizator'
    });

    const successMessage = `Comanda ${comanda.numar_comanda} a fost anulată cu succes`;

    return new Response(JSON.stringify({ 
      success: true, 
      message: successMessage,
      data: {
        orderNumber: comanda.numar_comanda,
        cancelledAt: cancellationData.data_anulare,
        reason: cancellationData.motiv_anulare
      }
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Unexpected error in order cancellation:', error);
    return new Response(JSON.stringify({ 
      error: 'Eroare internă la anularea comenzii',
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
