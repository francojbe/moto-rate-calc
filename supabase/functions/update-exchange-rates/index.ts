import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.80.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ExchangeRate {
  rate: number;
  source: string;
  timestamp: string;
  error?: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting exchange rate update...');

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Call the working edge functions to get rates
    console.log('Calling get-bcv-rate edge function...');
    const bcvResponse = await supabase.functions.invoke<ExchangeRate>('get-bcv-rate');
    
    console.log('Calling get-binance-rate edge function...');
    const binanceResponse = await supabase.functions.invoke<ExchangeRate>('get-binance-rate');

    // Check for errors
    if (bcvResponse.error) {
      console.error('Error from get-bcv-rate:', bcvResponse.error);
      throw new Error(`BCV function error: ${bcvResponse.error.message}`);
    }

    if (binanceResponse.error) {
      console.error('Error from get-binance-rate:', binanceResponse.error);
      throw new Error(`Binance function error: ${binanceResponse.error.message}`);
    }

    const bcvRate = bcvResponse.data?.rate;
    const binanceRate = binanceResponse.data?.rate;

    if (!bcvRate || !binanceRate) {
      throw new Error('Missing rate data from edge functions');
    }

    // Validate rates are positive numbers
    if (typeof bcvRate !== 'number' || bcvRate <= 0) {
      throw new Error(`Invalid BCV rate: ${bcvRate}. Must be a positive number.`);
    }

    if (typeof binanceRate !== 'number' || binanceRate <= 0) {
      throw new Error(`Invalid Binance rate: ${binanceRate}. Must be a positive number.`);
    }

    // Validate rates are within reasonable ranges
    const BCV_MIN = 1;
    const BCV_MAX = 1000;
    const BINANCE_MIN = 1;
    const BINANCE_MAX = 10000;

    if (bcvRate < BCV_MIN || bcvRate > BCV_MAX) {
      throw new Error(`BCV rate ${bcvRate} is outside acceptable range (${BCV_MIN}-${BCV_MAX} Bs)`);
    }

    if (binanceRate < BINANCE_MIN || binanceRate > BINANCE_MAX) {
      throw new Error(`Binance rate ${binanceRate} is outside acceptable range (${BINANCE_MIN}-${BINANCE_MAX} Bs)`);
    }

    console.log(`✓ Validated rates - BCV: ${bcvRate} Bs, Binance: ${binanceRate} Bs`);

    // Store rates in database
    const { data, error } = await supabase
      .from('exchange_rates')
      .insert({
        bcv_rate: bcvRate,
        binance_rate: binanceRate
      })
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      throw error;
    }

    console.log('Successfully stored exchange rates:', data);

    return new Response(
      JSON.stringify({
        success: true,
        bcv_rate: bcvRate,
        binance_rate: binanceRate,
        timestamp: new Date().toISOString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error updating exchange rates:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({
        error: errorMessage,
        timestamp: new Date().toISOString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
