-- Modify motorcycles table to use new plazo and tipo values
ALTER TABLE public.motorcycles 
DROP CONSTRAINT motorcycles_plazo_check;

ALTER TABLE public.motorcycles 
ADD CONSTRAINT motorcycles_plazo_check CHECK (plazo IN (6, 12));

ALTER TABLE public.motorcycles 
DROP CONSTRAINT motorcycles_tipo_check;

ALTER TABLE public.motorcycles 
ADD CONSTRAINT motorcycles_tipo_check CHECK (tipo IN ('BARATICO', 'SEMI NUEVAS', 'NUEVAS'));