-- =====================================================================
-- BUILDZY — COMPREHENSIVE MARKET PRICING, ESTIMATION & EXECUTION SCHEMA
-- Migration: 20261012_pricing_estimation_scheduling.sql
-- Part of Buildzy Phase 4 Backend Completion
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. GEOGRAPHIC & REFERENCE MASTER DATA
-- ---------------------------------------------------------------------
create table if not exists public.states (
  id text primary key, -- e.g. 'MH', 'DL', 'KA'
  name text not null,
  country_code text not null default 'IND',
  created_at timestamptz not null default now()
);

create table if not exists public.cities (
  id text primary key, -- e.g. 'mumbai', 'delhi-ncr'
  name text not null,
  state_id text references public.states(id) on delete set null,
  region_tier text not null check (region_tier in ('Tier 1', 'Tier 2', 'Tier 3')) default 'Tier 1',
  labour_multiplier numeric(6, 4) not null default 1.0000 check (labour_multiplier > 0),
  material_multiplier numeric(6, 4) not null default 1.0000 check (material_multiplier > 0),
  overall_multiplier numeric(6, 4) not null default 1.0000 check (overall_multiplier > 0),
  is_popular boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.material_categories (
  id text primary key, -- e.g. 'cement', 'steel', 'sand', 'aggregate', 'bricks', 'paint', 'tiles'
  name text not null,
  description text,
  default_unit text not null, -- e.g. '50kg Bag', 'kg', 'Metric Ton', 'cu. ft', 'Piece'
  created_at timestamptz not null default now()
);

create table if not exists public.labour_categories (
  id text primary key, -- e.g. 'civil-mason', 'helper', 'carpenter', 'electrician', 'plumber', 'painter'
  role_name text not null,
  trade_group text not null check (trade_group in ('Civil', 'Finishing', 'MEP', 'General')),
  skill_level text not null check (skill_level in ('Skilled', 'Semi-Skilled', 'Unskilled')) default 'Skilled',
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- 2. MARKET PRICING & PROVENANCE
-- ---------------------------------------------------------------------
create table if not exists public.pricing_sources (
  id text primary key, -- e.g. 'cpwd-dsr-2024', 'retail-survey-mmr', 'buildzy-benchmarks'
  source_name text not null,
  source_type text not null check (source_type in ('government_schedule', 'retail_survey', 'contractor_aggregated', 'synthetic_benchmark')),
  source_url text,
  publisher text,
  observation_date date not null,
  confidence_rating numeric(3, 2) not null default 4.0 check (confidence_rating between 1.0 and 5.0),
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists public.market_prices (
  id uuid primary key default gen_random_uuid(),
  item_code text not null, -- e.g. 'mat-cement-ppc', 'lab-mason'
  item_type text not null check (item_type in ('material', 'labour', 'equipment', 'service')),
  item_name text not null,
  specification text,
  category_id text,
  city_id text references public.cities(id) on delete cascade,
  unit text not null,
  currency varchar(3) not null default 'INR',
  rate_min numeric(12, 2) not null check (rate_min >= 0),
  rate_typical numeric(12, 2) not null check (rate_typical >= rate_min),
  rate_max numeric(12, 2) not null check (rate_max >= rate_typical),
  gst_rate numeric(4, 2) not null default 0.18 check (gst_rate between 0.00 and 0.28),
  source_id text references public.pricing_sources(id) on delete set null,
  provenance text not null check (provenance in ('synthetic_demo', 'market_reference', 'provider_submitted', 'verified_live')) default 'synthetic_demo',
  is_verified boolean not null default false,
  verified_by text,
  observation_date date not null default current_date,
  delivery_included boolean not null default false,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(item_code, city_id)
);


create table if not exists public.pricing_history (
  id uuid primary key default gen_random_uuid(),
  market_price_id uuid references public.market_prices(id) on delete cascade,
  item_code text not null,
  city_id text,
  rate_typical numeric(12, 2) not null,
  effective_date date not null,
  recorded_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- 3. PROJECT DEFINITION & VERSIONED ESTIMATES
-- ---------------------------------------------------------------------
create table if not exists public.estimates (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references public.projects(id) on delete cascade,
  customer_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  project_type text not null,
  city_id text references public.cities(id) on delete set null,
  built_up_area_sq_ft numeric(10, 2) not null check (built_up_area_sq_ft > 0),
  tier text not null check (tier in ('Basic', 'Standard', 'Premium', 'Luxury')) default 'Standard',
  active_version integer not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.estimate_versions (
  id uuid primary key default gen_random_uuid(),
  estimate_id uuid not null references public.estimates(id) on delete cascade,
  version_number integer not null,
  base_civil_cost numeric(14, 2) not null check (base_civil_cost >= 0),
  architectural_fee numeric(14, 2) not null default 0 check (architectural_fee >= 0),
  contingency_reserve numeric(14, 2) not null default 0 check (contingency_reserve >= 0),
  statutory_gst numeric(14, 2) not null default 0 check (statutory_gst >= 0),
  total_estimated_cost numeric(14, 2) not null check (total_estimated_cost >= 0),
  range_min numeric(14, 2) not null,
  range_max numeric(14, 2) not null,
  input_assumptions jsonb not null default '{}'::jsonb,
  calculation_formula_version text not null default 'engine_v1_cpwd',
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  unique(estimate_id, version_number)
);

create table if not exists public.estimate_line_items (
  id uuid primary key default gen_random_uuid(),
  estimate_version_id uuid not null references public.estimate_versions(id) on delete cascade,
  category text not null, -- 'Material', 'Labour', 'Architectural', 'Contingency', 'Tax'
  item_name text not null,
  quantity numeric(12, 3) not null check (quantity >= 0),
  unit text not null,
  unit_rate numeric(12, 2) not null check (unit_rate >= 0),
  amount numeric(14, 2) not null check (amount >= 0),
  provenance text not null default 'synthetic_demo',
  is_gst_applicable boolean not null default true,
  gst_rate numeric(4, 2) not null default 0.18,
  assumptions text,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- 4. PROJECT EXECUTION, SCHEDULING & CRITICAL PATH DURATION
-- ---------------------------------------------------------------------
create table if not exists public.project_schedules (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  version integer not null default 1,
  total_working_days integer not null check (total_working_days > 0),
  total_calendar_days integer not null check (total_calendar_days >= total_working_days),
  critical_path_tasks text[] not null default '{}',
  weather_buffer_days integer not null default 0,
  curing_buffer_days integer not null default 0,
  forecast_confidence text not null check (forecast_confidence in ('High', 'Moderate', 'Preliminary')) default 'Moderate',
  created_at timestamptz not null default now()
);

create table if not exists public.task_dependencies (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  predecessor_task_id uuid not null references public.project_tasks(id) on delete cascade,
  successor_task_id uuid not null references public.project_tasks(id) on delete cascade,
  dependency_type text not null check (dependency_type in ('Finish_to_Start', 'Start_to_Start', 'Finish_to_Finish')) default 'Finish_to_Start',
  lag_days integer not null default 0 check (lag_days >= 0), -- e.g., 7 days curing lag
  unique (predecessor_task_id, successor_task_id)
);

create table if not exists public.project_delays (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  task_id uuid references public.project_tasks(id) on delete set null,
  delay_category text not null check (delay_category in ('weather', 'material_stockout', 'client_decision', 'contractor_crew', 'statutory_clearance', 'rework')),
  delay_days integer not null check (delay_days > 0),
  reason text not null,
  reported_by uuid references public.profiles(id) on delete set null,
  impact_on_completion_days integer not null default 0,
  recorded_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- 5. AI AUDIT LOGS & PROMPT RUNS
-- ---------------------------------------------------------------------
create table if not exists public.ai_runs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete set null,
  operation_type text not null, -- 'scope_interpretation', 'quantity_explanation', 'schedule_prediction', 'risk_audit'
  model_identifier text not null, -- e.g. 'gemini-1.5-pro', 'deterministic-fallback'
  request_payload_summary jsonb not null default '{}'::jsonb,
  response_summary jsonb not null default '{}'::jsonb,
  tokens_used integer,
  duration_ms integer,
  status text not null check (status in ('success', 'fallback_deterministic', 'error')),
  error_message text,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- INDEXES FOR QUERY OPTIMIZATION
-- ---------------------------------------------------------------------
create index if not exists idx_market_prices_code_city on public.market_prices(item_code, city_id);
create index if not exists idx_estimates_customer on public.estimates(customer_id);
create index if not exists idx_estimate_versions_estimate on public.estimate_versions(estimate_id);
create index if not exists idx_task_deps_proj on public.task_dependencies(project_id);
create index if not exists idx_delays_proj on public.project_delays(project_id);
create index if not exists idx_ai_runs_user on public.ai_runs(user_id, created_at);

-- ---------------------------------------------------------------------
-- ROW LEVEL SECURITY (RLS) FOR NEW TABLES
-- ---------------------------------------------------------------------
alter table public.states enable row level security;
alter table public.cities enable row level security;
alter table public.material_categories enable row level security;
alter table public.labour_categories enable row level security;
alter table public.pricing_sources enable row level security;
alter table public.market_prices enable row level security;
alter table public.pricing_history enable row level security;
alter table public.estimates enable row level security;
alter table public.estimate_versions enable row level security;
alter table public.estimate_line_items enable row level security;
alter table public.project_schedules enable row level security;
alter table public.task_dependencies enable row level security;
alter table public.project_delays enable row level security;
alter table public.ai_runs enable row level security;

-- Public reference reads
drop policy if exists "Public read reference states" on public.states;
create policy "Public read reference states" on public.states for select using (true);
drop policy if exists "Public read reference cities" on public.cities;
create policy "Public read reference cities" on public.cities for select using (true);
drop policy if exists "Public read reference material categories" on public.material_categories;
create policy "Public read reference material categories" on public.material_categories for select using (true);
drop policy if exists "Public read reference labour categories" on public.labour_categories;
create policy "Public read reference labour categories" on public.labour_categories for select using (true);
drop policy if exists "Public read pricing sources" on public.pricing_sources;
create policy "Public read pricing sources" on public.pricing_sources for select using (true);
drop policy if exists "Public read market prices" on public.market_prices;
create policy "Public read market prices" on public.market_prices for select using (true);
drop policy if exists "Public read pricing history" on public.pricing_history;
create policy "Public read pricing history" on public.pricing_history for select using (true);

-- Estimates & Version Security (Restricted to Customer/Owner & Collaborators)
drop policy if exists "Customers can manage own estimates" on public.estimates;
create policy "Customers can manage own estimates" on public.estimates
  for all using (auth.uid() = customer_id or public.is_admin());

drop policy if exists "Estimate versions read by estimate owners" on public.estimate_versions;
create policy "Estimate versions read by estimate owners" on public.estimate_versions
  for select using (
    exists (
      select 1 from public.estimates e 
      where e.id = estimate_id and (e.customer_id = auth.uid() or public.is_admin())
    )
  );

drop policy if exists "Estimate versions insert by estimate owners" on public.estimate_versions;
create policy "Estimate versions insert by estimate owners" on public.estimate_versions
  for insert with check (
    exists (
      select 1 from public.estimates e 
      where e.id = estimate_id and (e.customer_id = auth.uid() or public.is_admin())
    )
  );

drop policy if exists "Estimate line items read by estimate owners" on public.estimate_line_items;
create policy "Estimate line items read by estimate owners" on public.estimate_line_items
  for select using (
    exists (
      select 1 from public.estimate_versions ev
      join public.estimates e on e.id = ev.estimate_id
      where ev.id = estimate_version_id and (e.customer_id = auth.uid() or public.is_admin())
    )
  );

drop policy if exists "Estimate line items insert by estimate owners" on public.estimate_line_items;
create policy "Estimate line items insert by estimate owners" on public.estimate_line_items
  for insert with check (
    exists (
      select 1 from public.estimate_versions ev
      join public.estimates e on e.id = ev.estimate_id
      where ev.id = estimate_version_id and (e.customer_id = auth.uid() or public.is_admin())
    )
  );

-- Project Schedules & Dependencies (Project Members or Admin)
drop policy if exists "Project schedules viewable by project members" on public.project_schedules;
create policy "Project schedules viewable by project members" on public.project_schedules
  for select using (
    exists (
      select 1 from public.projects p
      where p.id = project_id and (
        p.customer_id = auth.uid() or
        p.contractor_id in (select id from public.provider_profiles where profile_id = auth.uid()) or
        exists (select 1 from public.project_members pm where pm.project_id = p.id and pm.profile_id = auth.uid()) or
        public.is_admin()
      )
    )
  );

drop policy if exists "Project schedules modifiable by project owner or contractor" on public.project_schedules;
create policy "Project schedules modifiable by project owner or contractor" on public.project_schedules
  for all using (
    exists (
      select 1 from public.projects p
      where p.id = project_id and (
        p.customer_id = auth.uid() or
        p.contractor_id in (select id from public.provider_profiles where profile_id = auth.uid()) or
        public.is_admin()
      )
    )
  );

drop policy if exists "Task dependencies viewable by project members" on public.task_dependencies;
create policy "Task dependencies viewable by project members" on public.task_dependencies
  for select using (
    exists (
      select 1 from public.projects p
      where p.id = project_id and (
        p.customer_id = auth.uid() or
        p.contractor_id in (select id from public.provider_profiles where profile_id = auth.uid()) or
        exists (select 1 from public.project_members pm where pm.project_id = p.id and pm.profile_id = auth.uid()) or
        public.is_admin()
      )
    )
  );

drop policy if exists "Task dependencies insert by project contractors" on public.task_dependencies;
create policy "Task dependencies insert by project contractors" on public.task_dependencies
  for insert with check (
    exists (
      select 1 from public.projects p
      where p.id = project_id and (
        p.contractor_id in (select id from public.provider_profiles where profile_id = auth.uid()) or
        p.customer_id = auth.uid() or
        public.is_admin()
      )
    )
  );

-- Project delays logged and read by project members
drop policy if exists "Project delays viewable by members" on public.project_delays;
create policy "Project delays viewable by members" on public.project_delays
  for select using (
    exists (
      select 1 from public.projects p
      where p.id = project_id and (
        p.customer_id = auth.uid() or
        p.contractor_id in (select id from public.provider_profiles where profile_id = auth.uid()) or
        exists (select 1 from public.project_members pm where pm.project_id = p.id and pm.profile_id = auth.uid()) or
        public.is_admin()
      )
    )
  );

drop policy if exists "Project delays insert by members" on public.project_delays;
create policy "Project delays insert by members" on public.project_delays
  for insert with check (
    exists (
      select 1 from public.projects p
      where p.id = project_id and (
        p.customer_id = auth.uid() or
        p.contractor_id in (select id from public.provider_profiles where profile_id = auth.uid()) or
        exists (select 1 from public.project_members pm where pm.project_id = p.id and pm.profile_id = auth.uid()) or
        public.is_admin()
      )
    )
  );

-- AI Runs: User can view their own audit runs, admin can view all
drop policy if exists "Users can view own AI runs" on public.ai_runs;
create policy "Users can view own AI runs" on public.ai_runs
  for select using (auth.uid() = user_id or public.is_admin());

drop policy if exists "Users can insert AI run log" on public.ai_runs;
create policy "Users can insert AI run log" on public.ai_runs
  for insert with check (auth.uid() = user_id or user_id is null or public.is_admin());
