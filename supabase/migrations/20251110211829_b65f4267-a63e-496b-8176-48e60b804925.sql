-- Create table to store exchange rates
CREATE TABLE IF NOT EXISTS public.exchange_rates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  bcv_rate DECIMAL(10,4) NOT NULL,
  binance_rate DECIMAL(10,4) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.exchange_rates ENABLE ROW LEVEL SECURITY;

-- Create policy to allow everyone to read exchange rates
CREATE POLICY "Exchange rates are viewable by everyone" 
ON public.exchange_rates 
FOR SELECT 
USING (true);

-- Create policy to allow service role to insert rates
CREATE POLICY "Service role can insert exchange rates" 
ON public.exchange_rates 
FOR INSERT 
WITH CHECK (true);

-- Create index for faster queries
CREATE INDEX idx_exchange_rates_created_at ON public.exchange_rates(created_at DESC);

-- Enable pg_cron extension for scheduled tasks
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Enable pg_net extension for HTTP requests
CREATE EXTENSION IF NOT EXISTS pg_net;