-- Create motorcycles table
CREATE TABLE public.motorcycles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  modelo TEXT NOT NULL,
  inicial DECIMAL(10, 2) NOT NULL,
  cuota_cruda DECIMAL(10, 2) NOT NULL,
  plazo INTEGER NOT NULL CHECK (plazo IN (12, 18, 24)),
  tipo TEXT NOT NULL CHECK (tipo IN ('NUEVAS', 'USADAS')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.motorcycles ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (no authentication required)
CREATE POLICY "Anyone can view motorcycles"
  ON public.motorcycles
  FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert motorcycles"
  ON public.motorcycles
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update motorcycles"
  ON public.motorcycles
  FOR UPDATE
  USING (true);

CREATE POLICY "Anyone can delete motorcycles"
  ON public.motorcycles
  FOR DELETE
  USING (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_motorcycles_updated_at
  BEFORE UPDATE ON public.motorcycles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();