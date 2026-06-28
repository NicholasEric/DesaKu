-- DesaKu seed data — 3 certified villages, 5 homestays, 11 experiences
-- Idempotent: uses ON CONFLICT DO NOTHING on fixed UUIDs.
-- Run AFTER schema.sql + all migrations.

-- ============================================================
-- Village 1 — Desa Penglipuran, Bali (bamboo village)
-- ============================================================
insert into villages (id, name, region, sanitation_rating, description, bumdes_bank_account, hero_image_url)
values (
  '10000000-0000-0000-0000-000000000001',
  'Desa Penglipuran',
  'Bangli, Bali',
  5,
  'One of Bali''s cleanest villages — bamboo-walled lanes, no motorised vehicles, and gamelan most evenings. The village earned its UNESCO recognition through collective effort, not outside money.',
  'BRI · 00123000000001',
  'https://images.unsplash.com/photo-1555400038-63f5ba517a47?w=1200&q=80'
)
on conflict (id) do nothing;

-- Homestays
insert into homestays (id, village_id, host_whatsapp_number, price_per_night, max_guests, amenities)
values
  ('20000000-0000-0000-0000-000000000001',
   '10000000-0000-0000-0000-000000000001',
   '+62812000000001', 285000, 4,
   '{"private_bathroom":true,"breakfast":true,"fan":true}'),
  ('20000000-0000-0000-0000-000000000002',
   '10000000-0000-0000-0000-000000000001',
   '+62812000000002', 245000, 2,
   '{"private_bathroom":true,"fan":true}')
on conflict (id) do nothing;

-- Experiences
insert into experiences (id, village_id, guide_whatsapp_number, title, description, category, price_per_pax)
values
  ('30000000-0000-0000-0000-000000000001',
   '10000000-0000-0000-0000-000000000001',
   '+62812000000011',
   'Gamelan Evening Session',
   'Sit in on a full gamelan rehearsal, then try the instruments yourself under the guidance of a master musician born in the village.',
   'music', 75000),
  ('30000000-0000-0000-0000-000000000002',
   '10000000-0000-0000-0000-000000000001',
   '+62812000000012',
   'Bamboo Craft & Architecture Walk',
   'Learn the joinery technique that holds Penglipuran''s bamboo houses together without a single nail. You leave with a small woven piece.',
   'craft', 125000),
  ('30000000-0000-0000-0000-000000000003',
   '10000000-0000-0000-0000-000000000001',
   '+62812000000013',
   'Balinese Cooking Class',
   'Market tour at 7am, then cook a full lawar and nasi campur alongside the family. Eat what you make.',
   'culinary', 150000),
  ('30000000-0000-0000-0000-000000000004',
   '10000000-0000-0000-0000-000000000001',
   '+62812000000014',
   'Sunrise Temple Trail',
   'A guided 90-minute walk past the ancestral temple complex as the mist lifts off the rice fields. Includes a brief ceremony explanation.',
   'nature', 85000)
on conflict (id) do nothing;


-- ============================================================
-- Village 2 — Desa Ciwidey, Jawa Barat (highland farms)
-- ============================================================
insert into villages (id, name, region, sanitation_rating, description, bumdes_bank_account, hero_image_url)
values (
  '10000000-0000-0000-0000-000000000002',
  'Desa Ciwidey',
  'Bandung, Jawa Barat',
  5,
  'Perched at 1,400m in the Bandung highlands. The village grows strawberries and tea year-round, and the angklung tradition here predates the city below by two centuries.',
  'BNI · 00123000000002',
  'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&q=80'
)
on conflict (id) do nothing;

insert into homestays (id, village_id, host_whatsapp_number, price_per_night, max_guests, amenities)
values
  ('20000000-0000-0000-0000-000000000003',
   '10000000-0000-0000-0000-000000000002',
   '+62812000000003', 195000, 4,
   '{"private_bathroom":true,"hot_water":true,"breakfast":true}'),
  ('20000000-0000-0000-0000-000000000004',
   '10000000-0000-0000-0000-000000000002',
   '+62812000000004', 165000, 2,
   '{"breakfast":true,"fan":true}')
on conflict (id) do nothing;

insert into experiences (id, village_id, guide_whatsapp_number, title, description, category, price_per_pax)
values
  ('30000000-0000-0000-0000-000000000005',
   '10000000-0000-0000-0000-000000000002',
   '+62812000000015',
   'Strawberry Picking',
   'Pick your own strawberries straight from the hillside plots, then juice them in the communal kitchen. Best before 9am.',
   'agriculture', 50000),
  ('30000000-0000-0000-0000-000000000006',
   '10000000-0000-0000-0000-000000000002',
   '+62812000000016',
   'Tea Plantation Walk & Processing',
   'Walk the tea rows with a picker, learn hand-rolling, and taste four grades of the same leaf at different oxidation stages.',
   'nature', 65000),
  ('30000000-0000-0000-0000-000000000007',
   '10000000-0000-0000-0000-000000000002',
   '+62812000000017',
   'Angklung Workshop',
   'Three generations of the Nana family teach the bamboo angklung — from a single note to a four-part arrangement — in 90 minutes.',
   'music', 95000),
  ('30000000-0000-0000-0000-000000000008',
   '10000000-0000-0000-0000-000000000002',
   '+62812000000018',
   'Sundanese Cooking Class',
   'Karedok, pepes ikan, and lalapan from the garden. The guide translates flavour into technique you can replicate at home.',
   'culinary', 120000)
on conflict (id) do nothing;


-- ============================================================
-- Village 3 — Desa Giriloyo, Yogyakarta (batik capital)
-- ============================================================
insert into villages (id, name, region, sanitation_rating, description, bumdes_bank_account, hero_image_url)
values (
  '10000000-0000-0000-0000-000000000003',
  'Desa Giriloyo',
  'Bantul, Yogyakarta',
  4,
  'Giriloyo''s batik tulis is some of the most intricate in Java — every motif tells a Javanese philosophical story. Families here have held the canting wax-pen for 300 years.',
  'Mandiri · 00123000000003',
  'https://images.unsplash.com/photo-1604999565976-8913ad2ddb7c?w=1200&q=80'
)
on conflict (id) do nothing;

insert into homestays (id, village_id, host_whatsapp_number, price_per_night, max_guests, amenities)
values
  ('20000000-0000-0000-0000-000000000005',
   '10000000-0000-0000-0000-000000000003',
   '+62812000000005', 175000, 3,
   '{"private_bathroom":true,"breakfast":true}')
on conflict (id) do nothing;

insert into experiences (id, village_id, guide_whatsapp_number, title, description, category, price_per_pax)
values
  ('30000000-0000-0000-0000-000000000009',
   '10000000-0000-0000-0000-000000000003',
   '+62812000000019',
   'Batik Tulis — Full Day Workshop',
   'Start with a motif sketch, trace it onto fabric, then apply wax with a canting and dye the cloth yourself. You take the finished 50×50cm panel home.',
   'craft', 200000),
  ('30000000-0000-0000-0000-000000000010',
   '10000000-0000-0000-0000-000000000003',
   '+62812000000020',
   'Wayang Kulit Shadow Puppet Evening',
   'A 90-minute condensed wayang kulit performance, followed by a backstage session with the dalang (puppeteer) who explains the shadow-play mythology.',
   'ritual', 110000),
  ('30000000-0000-0000-0000-000000000011',
   '10000000-0000-0000-0000-000000000003',
   '+62812000000021',
   'Javanese Cooking & Spice Walk',
   'Forage for galangal, lemongrass, and kencur in the garden, then make gudeg and opor ayam from scratch over a wood fire.',
   'culinary', 135000)
on conflict (id) do nothing;
