-- Enable pg_cron and pg_net extensions for scheduled tasks
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Schedule daily exchange rate updates at 8:00 AM Venezuela time (12:00 PM UTC)
SELECT cron.schedule(
  'update-exchange-rates-daily',
  '0 12 * * *', -- 12:00 PM UTC = 8:00 AM Venezuela (UTC-4)
  $$
  SELECT
    net.http_post(
        url:='https://pfsbmovzezhhekqukljn.supabase.co/functions/v1/update-exchange-rates',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBmc2Jtb3Z6ZXpoaGVrcXVrbGpuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI4MTYxNDQsImV4cCI6MjA3ODM5MjE0NH0.DTinmVOoDtNuq8YSDFPfS2rslZXD3ZXeBex7-GvmIw0"}'::jsonb,
        body:=concat('{"timestamp": "', now(), '"}')::jsonb
    ) as request_id;
  $$
);