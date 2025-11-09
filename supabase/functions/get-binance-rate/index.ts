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
    console.log('Fetching Binance P2P rate...');
    
    const response = await fetch('https://p2p.binance.com/bapi/c2c/v2/friendly/c2c/adv/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        asset: 'USDT',
        fiat: 'VES',
        merchantCheck: true,
        page: 1,
        payTypes: [],
        publisherType: null,
        rows: 10,
        tradeType: 'SELL'
      })
    });
    
    if (!response.ok) {
      throw new Error(`Binance API returned status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Binance API response received');
    
    // Extract the first 3 offers and calculate average
    const offers = data?.data?.slice(0, 3) || [];
    
    if (offers.length === 0) {
      throw new Error('No offers found in Binance P2P response');
    }

    const rates = offers.map((offer: any) => parseFloat(offer.adv.price));
    const averageRate = rates.reduce((a: number, b: number) => a + b, 0) / rates.length;

    const result = {
      rate: parseFloat(averageRate.toFixed(2)),
      source: 'Binance P2P',
      timestamp: new Date().toISOString()
    };

    console.log('Returning Binance rate:', result);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in get-binance-rate function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        rate: null,
        source: 'Binance P2P',
        timestamp: new Date().toISOString()
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});