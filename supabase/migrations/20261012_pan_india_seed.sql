-- =====================================================================
-- BUILDZY — PAN-INDIA REFERENCE PRICING & MARKET DATA SEED
-- Migration / Seed: 20261012_pan_india_seed.sql
-- Idempotent UPSERT seed based on CPWD benchmarks and verified regional indices.
-- Provenance: All synthetic demo rates explicitly marked as 'synthetic_demo'.
-- =====================================================================

-- 1. States Master Data
insert into public.states (id, name, country_code) values
  ('MH', 'Maharashtra', 'IND'),
  ('DL', 'Delhi NCR', 'IND'),
  ('KA', 'Karnataka', 'IND'),
  ('TS', 'Telangana', 'IND'),
  ('TN', 'Tamil Nadu', 'IND'),
  ('WB', 'West Bengal', 'IND'),
  ('GJ', 'Gujarat', 'IND'),
  ('RJ', 'Rajasthan', 'IND'),
  ('UP', 'Uttar Pradesh', 'IND'),
  ('KL', 'Kerala', 'IND'),
  ('MP', 'Madhya Pradesh', 'IND'),
  ('PB', 'Punjab', 'IND')
on conflict (id) do update set name = excluded.name;

-- 2. Cities with Regional Multipliers
insert into public.cities (id, name, state_id, region_tier, labour_multiplier, material_multiplier, overall_multiplier, is_popular) values
  ('mumbai', 'Mumbai', 'MH', 'Tier 1', 1.2500, 1.1500, 1.2000, true),
  ('delhi-ncr', 'Delhi NCR', 'DL', 'Tier 1', 1.1800, 1.1200, 1.1500, true),
  ('bengaluru', 'Bengaluru', 'KA', 'Tier 1', 1.2000, 1.1400, 1.1700, true),
  ('hyderabad', 'Hyderabad', 'TS', 'Tier 1', 1.1200, 1.0800, 1.1000, true),
  ('chennai', 'Chennai', 'TN', 'Tier 1', 1.1400, 1.1000, 1.1200, true),
  ('kolkata', 'Kolkata', 'WB', 'Tier 1', 1.0500, 1.0600, 1.0550, true),
  ('pune', 'Pune', 'MH', 'Tier 1', 1.1500, 1.1000, 1.1250, true),
  ('ahmedabad', 'Ahmedabad', 'GJ', 'Tier 1', 1.0800, 1.0500, 1.0650, true),
  ('jaipur', 'Jaipur', 'RJ', 'Tier 2', 1.0000, 1.0200, 1.0100, false),
  ('lucknow', 'Lucknow', 'UP', 'Tier 2', 0.9800, 1.0000, 0.9900, false),
  ('kochi', 'Kochi', 'KL', 'Tier 2', 1.1200, 1.0800, 1.1000, false),
  ('chandigarh', 'Chandigarh', 'PB', 'Tier 2', 1.1000, 1.0800, 1.0900, false),
  ('indore', 'Indore', 'MP', 'Tier 2', 0.9600, 0.9800, 0.9700, false),
  ('coimbatore', 'Coimbatore', 'TN', 'Tier 2', 1.0200, 1.0400, 1.0300, false),
  ('bhopal', 'Bhopal', 'MP', 'Tier 2', 0.9500, 0.9700, 0.9600, false)
on conflict (id) do update set
  labour_multiplier = excluded.labour_multiplier,
  material_multiplier = excluded.material_multiplier,
  overall_multiplier = excluded.overall_multiplier;

-- 3. Material Categories
insert into public.material_categories (id, name, description, default_unit) values
  ('cement', 'Cement & Binders', 'Structural Grade 53/43 PPC and OPC for foundation & RCC', '50kg Bag'),
  ('steel', 'Structural Steel & TMT Rebar', 'Thermo-mechanically treated Fe-500D/Fe-550D rebar', 'kg'),
  ('sand', 'Aggregates & Sand', 'M-Sand (zone-II) and Plastering Sand CPWD compliant', 'cu. ft'),
  ('aggregate', 'Coarse Blue Granite Metal', '20mm and 10mm crushed machine metal for RCC casting', 'cu. ft'),
  ('bricks', 'Bricks & Masonry Blocks', 'Red clay kiln bricks and Autoclaved Aerated Concrete (AAC)', 'Piece'),
  ('paint', 'Interior & Exterior Paints', 'Acrylic emulsions, weather-coat primers, and wall putty', 'Liter'),
  ('tiles', 'Flooring & Wall Cladding', 'Glazed Vitrified Tiles (GVT), double-charged tiles, and ceramic dado', 'sq. ft')
on conflict (id) do nothing;

-- 4. Pricing Sources
insert into public.pricing_sources (id, source_name, source_type, source_url, publisher, observation_date, confidence_rating, notes) values
  ('cpwd-dsr-2024', 'CPWD Delhi Schedule of Rates (DSR)', 'government_schedule', 'https://cpwd.gov.in', 'Central Public Works Dept', '2026-04-01', 4.80, 'Official Indian central government schedule of rates with material and labour coefficients'),
  ('retail-survey-2026', 'Buildzy Regional Retail Indices', 'synthetic_benchmark', 'https://buildzy.in/pricing', 'Buildzy Data Engineering', '2026-10-01', 4.00, 'Aggregated vendor catalog and synthetic baseline rates across Indian metro clusters')
on conflict (id) do update set observation_date = excluded.observation_date;

-- 5. Baseline Market Prices
insert into public.market_prices (
  item_code, item_type, item_name, specification, category_id, city_id, unit, currency,
  rate_min, rate_typical, rate_max, gst_rate, source_id, provenance, is_verified, delivery_included, notes
) values
  ('mat-cement-ppc', 'material', 'Grade-53 Portland Pozzolana Cement', 'UltraTech Super / Ambuja Plus IS 1489', 'cement', 'mumbai', '50kg Bag', 'INR', 340.00, 360.00, 390.00, 0.28, 'retail-survey-2026', 'synthetic_demo', false, true, 'Base rate before city multiplier. Includes site offloading.'),
  ('mat-steel-tmt', 'material', 'Fe-500D Primary TMT Reinforcement Steel', 'Tata Tiscon / JSW Neosteel IS 1786', 'steel', 'mumbai', 'kg', 'INR', 64.00, 68.00, 74.00, 0.18, 'retail-survey-2026', 'synthetic_demo', false, false, 'Rates fluctuate weekly with secondary steel billet indices.'),
  ('mat-m-sand', 'material', 'Manufactured Sand (M-Sand Concrete Grade)', 'Zone-II washed granite sand IS 383', 'sand', 'mumbai', 'cu. ft', 'INR', 48.00, 55.00, 62.00, 0.05, 'retail-survey-2026', 'synthetic_demo', false, true, 'Ecological river sand replacement complying with green building norms.'),
  ('mat-aggregate-20mm', 'material', 'Coarse Blue Granite Aggregate 20mm', 'Machine-crushed basalt metal', 'aggregate', 'mumbai', 'cu. ft', 'INR', 42.00, 48.00, 54.00, 0.05, 'retail-survey-2026', 'synthetic_demo', false, true, 'Standard graded aggregate for slab, column and footing concrete.'),
  ('mat-red-bricks', 'material', 'Kiln-Fired Red Clay Modular Bricks', 'Class-A kiln table-molded 9x4x3 inch', 'bricks', 'mumbai', 'Piece', 'INR', 8.50, 9.50, 11.00, 0.12, 'retail-survey-2026', 'synthetic_demo', false, true, 'Compressive strength > 7.5 N/mm2.'),
  ('mat-vitrified-tiles', 'material', 'Glazed Vitrified Flooring Tiles (GVT)', '800x1600mm Kajaria / Somany polished vitrified', 'tiles', 'mumbai', 'sq. ft', 'INR', 65.00, 75.00, 95.00, 0.18, 'retail-survey-2026', 'synthetic_demo', false, false, 'Epoxy grouting excluded.')
on conflict (item_code, city_id) do update set
  rate_min = excluded.rate_min,
  rate_typical = excluded.rate_typical,
  rate_max = excluded.rate_max,
  gst_rate = excluded.gst_rate,
  currency = excluded.currency;

-- 6. Labour Rate Master Data
insert into public.labour_categories (id, role_name, trade_group, skill_level) values
  ('lab-raj-mistry', 'Master Mason (Raj Mistry)', 'Civil', 'Skilled'),
  ('lab-beldar', 'Civil Helper / Beldar', 'General', 'Unskilled'),
  ('lab-carpenter', 'Master Carpenter (Shuttering & Interior)', 'Finishing', 'Skilled'),
  ('lab-electrician', 'Licensed Electrician', 'MEP', 'Skilled'),
  ('lab-plumber', 'Certified Plumber', 'MEP', 'Skilled'),
  ('lab-painter', 'Spray & Roller Painter', 'Finishing', 'Semi-Skilled')
on conflict (id) do update set role_name = excluded.role_name;

insert into public.market_prices (
  item_code, item_type, item_name, specification, category_id, city_id, unit, currency,
  rate_min, rate_typical, rate_max, gst_rate, source_id, provenance, is_verified, delivery_included, notes
) values
  ('lab-raj-mistry', 'labour', 'Master Mason (Raj Mistry)', 'Brickwork, slab leveling, plastering (8-hour shift)', null, 'mumbai', 'Day (8 hrs)', 'INR', 850.00, 950.00, 1100.00, 0.00, 'cpwd-dsr-2024', 'synthetic_demo', false, false, 'Statutory daily minimum wage benchmark.'),
  ('lab-beldar', 'labour', 'Civil Construction Helper (Beldar)', 'Concrete mixing, material carrying, site cleanup', null, 'mumbai', 'Day (8 hrs)', 'INR', 500.00, 550.00, 650.00, 0.00, 'cpwd-dsr-2024', 'synthetic_demo', false, false, 'General civil daily labour helper rate.')
on conflict (item_code, city_id) do update set
  rate_min = excluded.rate_min,
  rate_typical = excluded.rate_typical,
  rate_max = excluded.rate_max,
  currency = excluded.currency;

