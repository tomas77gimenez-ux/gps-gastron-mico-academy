-- Add Mentoria/GPS Method structure to courses
ALTER TABLE public.courses
  ADD COLUMN IF NOT EXISTS methodology text NOT NULL DEFAULT 'general',
  ADD COLUMN IF NOT EXISTS pillar_order integer,
  ADD COLUMN IF NOT EXISTS module_number integer;

CREATE INDEX IF NOT EXISTS idx_courses_methodology_pillar
  ON public.courses (methodology, pillar_order, module_number);

COMMENT ON COLUMN public.courses.methodology IS 'Filter: gps = Mentoria/Método GPS, general = catalog course';
COMMENT ON COLUMN public.courses.pillar_order IS '1=Gestión, 2=Proceso Productivo, 3=Sostenibilidad de la Venta';
COMMENT ON COLUMN public.courses.module_number IS 'Module number within the GPS Method (1-9)';