-- Eliminar constraint de plazo para permitir valores personalizados
ALTER TABLE public.motorcycles 
DROP CONSTRAINT IF EXISTS motorcycles_plazo_check;

-- Eliminar constraint de tipo para permitir valores personalizados
ALTER TABLE public.motorcycles 
DROP CONSTRAINT IF EXISTS motorcycles_tipo_check;