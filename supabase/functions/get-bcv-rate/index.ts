import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Fetching BCV rate...');
    
    const response = await fetch('https://bcv-api.rafnixg.dev/rates/');
    
    if (!response.ok) {
      throw new Error(`BCV API returned status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('BCV API response:', data);
    
    // Extract USD rate from the response
    const usdRate = data?.currencies?.find((c: any) => c.code === 'USD')?.rate;
    
    if (!usdRate) {
      throw new Error('USD rate not found in BCV API response');
    }

    const result = {
      rate: parseFloat(usdRate),
      source: 'BCV',
      timestamp: new Date().toISOString()
    };

    console.log('Returning BCV rate:', result);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in get-bcv-rate function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        rate: null,
        source: 'BCV',
        timestamp: new Date().toISOString()
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});