-- Insert Introducción module as pillar 0, module 0
INSERT INTO public.courses (title, description, category, instructor, level, estimated_duration, status, sort_order, methodology, pillar_order, module_number)
VALUES (
  'INTRODUCCIÓN · Comenzamos Aquí',
  'Bienvenida al Método GPS. Conoce la plataforma, la metodología y tu hoja de ruta personalizada antes de empezar el Pilar 1.',
  'Introducción',
  'Daniel Gimenez',
  'Principiante',
  '15 min',
  'published',
  0,
  'gps',
  0,
  0
)
RETURNING id;