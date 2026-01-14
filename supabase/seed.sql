-- Sample seed data (optional)
-- You can edit or replace with your real catalog.

insert into public.products (
  id, name, brand, category, short_description, description, image_url,
  pack_size, wear_period, base_curve, diameter, water_content_percent, uv_blocking, is_active
) values
(
  'acuvue-oasys-1day-90',
  'ACUVUE OASYS 1-Day (90)',
  'Johnson & Johnson',
  'daily',
  'Conforto o dia todo. Lente diária premium.',
  'Exemplo de descrição. Em produção, inclua informações regulatórias e detalhes do produto.',
  '/file.svg',
  90, 'daily', '8.5', '14.3', 38, true, true
),
(
  'dailies-total1-90',
  'DAILIES TOTAL1 (90)',
  'Alcon',
  'daily',
  'Lente diária premium com conforto e visão nítida.',
  'Exemplo de descrição. Em produção, inclua informações regulatórias e detalhes do produto.',
  '/globe.svg',
  90, 'daily', '8.5', '14.1', 33, false, true
),
(
  'air-optix-plus-hydraglyde-6',
  'AIR OPTIX plus HydraGlyde (6)',
  'Alcon',
  'monthly',
  'Lente mensal. Boa para rotina de limpeza e manutenção.',
  'Exemplo de descrição. Em produção, inclua informações regulatórias e detalhes do produto.',
  '/window.svg',
  6, 'monthly', '8.6', '14.2', null, false, true
);

insert into public.product_variants (id, product_id, sku, sph, price, stock, is_active) values
('acuvue-oasys-1day-90:-0.50','acuvue-oasys-1day-90','AO1D90--0.50','-0.50',219.90,18,true),
('acuvue-oasys-1day-90:-1.00','acuvue-oasys-1day-90','AO1D90--1.00','-1.00',219.90,12,true),
('acuvue-oasys-1day-90:-1.25','acuvue-oasys-1day-90','AO1D90--1.25','-1.25',219.90,6,true),
('dailies-total1-90:-0.25','dailies-total1-90','DT1-90--0.25','-0.25',239.90,14,true),
('dailies-total1-90:-0.75','dailies-total1-90','DT1-90--0.75','-0.75',239.90,9,true),
('air-optix-plus-hydraglyde-6:-0.50','air-optix-plus-hydraglyde-6','AOP6--0.50','-0.50',129.90,22,true),
('air-optix-plus-hydraglyde-6:-1.00','air-optix-plus-hydraglyde-6','AOP6--1.00','-1.00',129.90,17,true);



