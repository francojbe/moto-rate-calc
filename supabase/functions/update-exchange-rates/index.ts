import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.80.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ExchangeRate {
  rate: number;
  source: string;
  timestamp: string;
}

async function getBCVRate(): Promise<number> {
  console.log('Fetching BCV rate...');
  try {
    const response = await fetch('https://pydolarve.org/api/v1/dollar?page=bcv');
    if (!response.ok) {
      throw new Error(`BCV API returned ${response.status}`);
    }
    const data = await response.json();
    console.log('BCV Response:', JSON.stringify(data));
    
    const rate = data?.monitors?.usd?.price || data?.price;
    if (!rate) {
      throw new Error('No rate found in BCV response');
    }
    
    return parseFloat(rate);
  } catch (error) {
    console.error('Error fetching BCV rate:', error);
    throw error;
  }
}

async function getBinanceRate(): Promise<number> {
  console.log('Fetching Binance rate...');
  try {
    const response = await fetch('https://pydolarve.org/api/v1/dollar?page=binance');
    if (!response.ok) {
      throw new Error(`Binance API returned ${response.status}`);
    }
    const data = await response.json();
    console.log('Binance Response:', JSON.stringify(data));
    
    const rate = data?.monitors?.usdt?.price || data?.price;
    if (!rate) {
      throw new Error('No rate found in Binance response');
    }
    
    return parseFloat(rate);
  } catch (error) {
    console.error('Error fetching Binance rate:', error);
    throw error;
  }
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

    // Fetch both rates
    const [bcvRate, binanceRate] = await Promise.all([
      getBCVRate(),
      getBinanceRate()
    ]);

    console.log(`Fetched rates - BCV: ${bcvRate}, Binance: ${binanceRate}`);

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
