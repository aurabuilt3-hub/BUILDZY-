-- =====================================================================
-- BUILDZY — PRODUCTION DATABASE SCHEMA & ROW LEVEL SECURITY
-- Platform: Supabase PostgreSQL
-- Version: 1.0.0
-- =====================================================================

-- 0. Extensions
create extension if not exists "uuid-ossp";

-- =====================================================================
-- 1. PROFILES (Extends Supabase auth.users)
-- =====================================================================
create table if not exists public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  email text not null,
  display_name text not null,
  phone text,
  avatar_url text,
  address text,
  city text,
  role text not null check (role in ('customer', 'contractor', 'worker', 'admin')) default 'customer',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- =====================================================================
-- 2. PROVIDER PROFILES (Workers & Contractors)
-- =====================================================================
create table if not exists public.provider_profiles (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references public.profiles(id) on delete cascade,
  business_name text not null,
  trade text not null, -- e.g. 'General Contractor', 'Master Plumber', 'Architect'
  tier text not null check (tier in ('Budget-friendly', 'Balanced', 'Premium')) default 'Balanced',
  experience_years integer not null default 0 check (experience_years >= 0),
  rating numeric(3, 2) not null default 5.00 check (rating >= 1.00 and rating <= 5.00),
  review_count integer not null default 0 check (review_count >= 0),
  completed_projects integer not null default 0 check (completed_projects >= 0),
  hourly_rate numeric(12, 2) check (hourly_rate is null or hourly_rate >= 0),
  daily_rate numeric(12, 2) check (daily_rate is null or daily_rate >= 0),
  currency varchar(3) not null default 'USD',
  service_area text not null,
  availability text not null check (availability in ('Available Today', 'Available This Week', 'Booked (Next Week)', 'Unavailable')) default 'Available Today',
  verified boolean not null default false,
  skills text[] not null default '{}',
  bio text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- =====================================================================
-- 3. SERVICE CATEGORIES
-- =====================================================================
create table if not exists public.service_categories (
  id text primary key, -- e.g. 'labour', 'contractors', 'plumbing'
  name text not null,
  description text,
  icon_name text not null default 'Wrench',
  popular boolean not null default false,
  base_price_unit text not null default 'hr',
  indicative_starting_price numeric(12, 2) not null default 0.00 check (indicative_starting_price >= 0),
  currency varchar(3) not null default 'USD',
  created_at timestamptz not null default now()
);

-- =====================================================================
-- 4. SERVICE REQUESTS (Individual on-demand job specifications)
-- =====================================================================
create table if not exists public.service_requests (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.profiles(id) on delete cascade,
  category_id text references public.service_categories(id) on delete set null,
  service_title text not null,
  worker_type text not null check (worker_type in ('individual', 'crew')),
  headcount integer not null default 1 check (headcount >= 1),
  duration_value integer not null check (duration_value > 0),
  duration_unit text not null check (duration_unit in ('hours', 'days')),
  location text not null,
  scheduled_date date not null,
  scheduled_timeslot text not null,
  requirements text,
  estimated_budget numeric(12, 2) check (estimated_budget is null or estimated_budget >= 0),
  currency varchar(3) not null default 'USD',
  status text not null check (status in ('open', 'matched', 'completed', 'cancelled')) default 'open',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- =====================================================================
-- 5. PROJECTS (Large construction & renovations)
-- =====================================================================
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.profiles(id) on delete cascade,
  contractor_id uuid references public.provider_profiles(id) on delete set null,
  title text not null,
  project_type text not null, -- e.g. 'New Residential Construction', 'Full Home Renovation'
  tier text not null check (tier in ('Budget-friendly', 'Balanced', 'Premium')) default 'Balanced',
  built_up_area_sqft numeric(10, 2) check (built_up_area_sqft is null or built_up_area_sqft > 0),
  floor_count integer not null default 1 check (floor_count >= 1),
  location text not null,
  start_date date,
  estimated_completion_date date,
  timeline_months integer not null default 6 check (timeline_months > 0),
  budget_estimated numeric(12, 2) not null check (budget_estimated >= 0),
  agreed_quotation numeric(12, 2) not null check (agreed_quotation >= 0),
  amount_spent numeric(12, 2) not null default 0.00 check (amount_spent >= 0),
  currency varchar(3) not null default 'USD',
  progress_percentage integer not null default 0 check (progress_percentage >= 0 and progress_percentage <= 100),
  assigned_workers_count integer not null default 1 check (assigned_workers_count >= 1),
  status text not null check (status in ('Planning', 'In Progress', 'Review', 'Completed', 'On Hold', 'Cancelled')) default 'Planning',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- =====================================================================
-- 6. PROJECT MEMBERS (Collaborators, inspectors, assigned workers)
-- =====================================================================
create table if not exists public.project_members (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  member_role text not null check (member_role in ('owner', 'lead_contractor', 'worker', 'inspector', 'architect')),
  joined_at timestamptz not null default now(),
  unique (project_id, profile_id)
);

-- =====================================================================
-- 7. QUOTATIONS (Contractor bids and itemized scopes)
-- =====================================================================
create table if not exists public.quotations (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references public.projects(id) on delete cascade,
  service_request_id uuid references public.service_requests(id) on delete cascade,
  provider_id uuid not null references public.provider_profiles(id) on delete cascade,
  scope text[] not null default '{}',
  exclusions text[] not null default '{}',
  materials_included boolean not null default false,
  materials_details text,
  duration_estimate text not null,
  warranty_terms text,
  total_price numeric(12, 2) not null check (total_price >= 0),
  currency varchar(3) not null default 'USD',
  status text not null check (status in ('draft', 'submitted', 'shortlisted', 'accepted', 'rejected')) default 'submitted',
  created_at timestamptz not null default now(),
  check (project_id is not null or service_request_id is not null)
);

-- =====================================================================
-- 8. BOOKINGS (Confirmed service appointments)
-- =====================================================================
create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  booking_reference text unique not null,
  customer_id uuid not null references public.profiles(id) on delete cascade,
  provider_id uuid references public.provider_profiles(id) on delete set null,
  service_request_id uuid references public.service_requests(id) on delete set null,
  service_name text not null,
  category text not null,
  provider_name text not null,
  provider_trade text not null,
  scheduled_date date not null,
  time_slot text not null,
  location text not null,
  worker_count integer not null default 1 check (worker_count >= 1),
  duration_value integer not null check (duration_value > 0),
  duration_unit text not null check (duration_unit in ('hours', 'days')),
  total_price numeric(12, 2) not null check (total_price >= 0),
  currency varchar(3) not null default 'USD',
  status text not null check (status in ('Pending', 'Scheduled', 'In Progress', 'Completed', 'Cancelled')) default 'Scheduled',
  live_step integer not null default 1 check (live_step between 1 and 5),
  special_instructions text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- =====================================================================
-- 9. PROJECT MILESTONES (Quality gates & escrow payouts)
-- =====================================================================
create table if not exists public.project_milestones (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  title text not null,
  description text,
  order_index integer not null default 1,
  target_date date,
  status text not null check (status in ('Upcoming', 'In Progress', 'Completed')) default 'Upcoming',
  percentage integer not null default 0 check (percentage >= 0 and percentage <= 100),
  payout_amount numeric(12, 2) not null default 0.00 check (payout_amount >= 0),
  currency varchar(3) not null default 'USD',
  is_paid boolean not null default false,
  paid_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- =====================================================================
-- 10. PROJECT TASKS
-- =====================================================================
create table if not exists public.project_tasks (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  milestone_id uuid references public.project_milestones(id) on delete set null,
  title text not null,
  category text,
  assigned_to text,
  due_date date,
  status text not null check (status in ('Pending', 'In Progress', 'Completed')) default 'Pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- =====================================================================
-- 11. MATERIAL ITEMS (Procurement ledger)
-- =====================================================================
create table if not exists public.material_items (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  name text not null,
  quantity text not null,
  estimated_cost numeric(12, 2) not null default 0.00 check (estimated_cost >= 0),
  currency varchar(3) not null default 'USD',
  supplier text,
  status text not null check (status in ('Requisitioned', 'Ordered', 'Delivered', 'Installed')) default 'Requisitioned',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- =====================================================================
-- 12. PROJECT PHOTOS (Site inspection & progress audit trail)
-- =====================================================================
create table if not exists public.project_photos (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  title text not null,
  image_url text not null,
  milestone_title text,
  uploaded_at timestamptz not null default now()
);

-- =====================================================================
-- 13. REVIEWS & RATINGS
-- =====================================================================
create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles(id) on delete cascade,
  project_id uuid references public.projects(id) on delete cascade,
  provider_id uuid references public.provider_profiles(id) on delete set null,
  booking_id uuid references public.bookings(id) on delete set null,
  rating integer not null check (rating >= 1 and rating <= 5),
  category text not null check (category in ('Quality of Work', 'Timeliness', 'Communication', 'Budget Adherence', 'Overall Experience')) default 'Overall Experience',
  comment text not null,
  verified_purchase boolean not null default true,
  created_at timestamptz not null default now()
);

-- =====================================================================
-- 14. NOTIFICATIONS
-- =====================================================================
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  recipient_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  message text not null,
  type text not null check (type in ('booking', 'milestone', 'payment', 'system', 'message')) default 'system',
  reference_id text,
  read boolean not null default false,
  created_at timestamptz not null default now()
);

-- =====================================================================
-- 15. MESSAGES (Direct project collaboration)
-- =====================================================================
create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  sender_id uuid not null references public.profiles(id) on delete cascade,
  content text not null,
  attachment_url text,
  created_at timestamptz not null default now()
);

-- =====================================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================================
create index if not exists idx_profiles_role on public.profiles(role);
create index if not exists idx_provider_trade on public.provider_profiles(trade);
create index if not exists idx_provider_tier on public.provider_profiles(tier);
create index if not exists idx_projects_customer on public.projects(customer_id);
create index if not exists idx_projects_contractor on public.projects(contractor_id);
create index if not exists idx_bookings_customer on public.bookings(customer_id);
create index if not exists idx_bookings_status on public.bookings(status);
create index if not exists idx_milestones_project on public.project_milestones(project_id);
create index if not exists idx_tasks_project on public.project_tasks(project_id);
create index if not exists idx_materials_project on public.material_items(project_id);
create index if not exists idx_reviews_project on public.reviews(project_id);
create index if not exists idx_notifications_recipient on public.notifications(recipient_id, read);
create index if not exists idx_messages_project on public.messages(project_id, created_at);

-- =====================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================================
alter table public.profiles enable row level security;
alter table public.provider_profiles enable row level security;
alter table public.service_categories enable row level security;
alter table public.service_requests enable row level security;
alter table public.projects enable row level security;
alter table public.project_members enable row level security;
alter table public.quotations enable row level security;
alter table public.bookings enable row level security;
alter table public.project_milestones enable row level security;
alter table public.project_tasks enable row level security;
alter table public.material_items enable row level security;
alter table public.project_photos enable row level security;
alter table public.reviews enable row level security;
alter table public.notifications enable row level security;
alter table public.messages enable row level security;

-- Helper function: Check if current user is admin
create or replace function public.is_admin()
returns boolean language sql security definer as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- PROFILES
create policy "Public can view basic profiles" on public.profiles
  for select using (true);

create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = id);

create policy "Users can insert own profile" on public.profiles
  for insert with check (auth.uid() = id);

-- PROVIDER PROFILES
create policy "Anyone can browse provider profiles" on public.provider_profiles
  for select using (true);

create policy "Providers can update own provider profile" on public.provider_profiles
  for update using (
    exists (
      select 1 from public.profiles 
      where profiles.id = auth.uid() and profiles.id = provider_profiles.profile_id
    ) or public.is_admin()
  );

create policy "Providers can insert provider profile" on public.provider_profiles
  for insert with check (auth.uid() = profile_id or public.is_admin());

-- SERVICE CATEGORIES
create policy "Anyone can read categories" on public.service_categories
  for select using (true);

create policy "Only admin can modify categories" on public.service_categories
  for all using (public.is_admin());

-- SERVICE REQUESTS
create policy "Customers can manage own service requests" on public.service_requests
  for all using (auth.uid() = customer_id or public.is_admin());

create policy "Providers can view open service requests" on public.service_requests
  for select using (
    status = 'open' or auth.uid() = customer_id or public.is_admin()
  );

-- PROJECTS
create policy "Owners and contractors can view projects" on public.projects
  for select using (
    auth.uid() = customer_id or 
    exists (
      select 1 from public.provider_profiles 
      where provider_profiles.id = projects.contractor_id and provider_profiles.profile_id = auth.uid()
    ) or
    exists (
      select 1 from public.project_members
      where project_members.project_id = projects.id and project_members.profile_id = auth.uid()
    ) or 
    public.is_admin()
  );

create policy "Customers can create projects" on public.projects
  for insert with check (auth.uid() = customer_id or public.is_admin());

create policy "Project participants can update projects" on public.projects
  for update using (
    auth.uid() = customer_id or
    exists (
      select 1 from public.provider_profiles 
      where provider_profiles.id = projects.contractor_id and provider_profiles.profile_id = auth.uid()
    ) or
    public.is_admin()
  );

-- PROJECT MEMBERS
create policy "Project members view access" on public.project_members
  for select using (
    profile_id = auth.uid() or
    exists (
      select 1 from public.projects 
      where projects.id = project_members.project_id and projects.customer_id = auth.uid()
    ) or public.is_admin()
  );

-- QUOTATIONS
create policy "Customers and providers can view project quotations" on public.quotations
  for select using (
    exists (
      select 1 from public.projects
      where projects.id = quotations.project_id and (
        projects.customer_id = auth.uid() or 
        projects.contractor_id = quotations.provider_id
      )
    ) or
    exists (
      select 1 from public.provider_profiles
      where provider_profiles.id = quotations.provider_id and provider_profiles.profile_id = auth.uid()
    ) or
    public.is_admin()
  );

create policy "Providers can submit quotations" on public.quotations
  for insert with check (
    exists (
      select 1 from public.provider_profiles
      where provider_profiles.id = quotations.provider_id and provider_profiles.profile_id = auth.uid()
    ) or public.is_admin()
  );

-- BOOKINGS
create policy "Users can view own bookings" on public.bookings
  for select using (
    auth.uid() = customer_id or
    exists (
      select 1 from public.provider_profiles
      where provider_profiles.id = bookings.provider_id and provider_profiles.profile_id = auth.uid()
    ) or
    public.is_admin()
  );

create policy "Customers can insert bookings" on public.bookings
  for insert with check (auth.uid() = customer_id or public.is_admin());

create policy "Participants can update bookings" on public.bookings
  for update using (
    auth.uid() = customer_id or
    exists (
      select 1 from public.provider_profiles
      where provider_profiles.id = bookings.provider_id and provider_profiles.profile_id = auth.uid()
    ) or
    public.is_admin()
  );

-- PROJECT SUB-ENTITIES (Milestones, Tasks, Materials, Photos)
create policy "Project members can read milestones" on public.project_milestones
  for select using (
    exists (
      select 1 from public.projects
      where projects.id = project_milestones.project_id and (
        projects.customer_id = auth.uid() or
        exists (
          select 1 from public.provider_profiles 
          where provider_profiles.id = projects.contractor_id and provider_profiles.profile_id = auth.uid()
        )
      )
    ) or public.is_admin()
  );

create policy "Project members can update milestones" on public.project_milestones
  for all using (
    exists (
      select 1 from public.projects
      where projects.id = project_milestones.project_id and (
        projects.customer_id = auth.uid() or
        exists (
          select 1 from public.provider_profiles 
          where provider_profiles.id = projects.contractor_id and provider_profiles.profile_id = auth.uid()
        )
      )
    ) or public.is_admin()
  );

create policy "Project members can read tasks" on public.project_tasks
  for select using (
    exists (
      select 1 from public.projects
      where projects.id = project_tasks.project_id and (
        projects.customer_id = auth.uid() or
        exists (
          select 1 from public.provider_profiles 
          where provider_profiles.id = projects.contractor_id and provider_profiles.profile_id = auth.uid()
        )
      )
    ) or public.is_admin()
  );

create policy "Project members can manage tasks" on public.project_tasks
  for all using (
    exists (
      select 1 from public.projects
      where projects.id = project_tasks.project_id and (
        projects.customer_id = auth.uid() or
        exists (
          select 1 from public.provider_profiles 
          where provider_profiles.id = projects.contractor_id and provider_profiles.profile_id = auth.uid()
        )
      )
    ) or public.is_admin()
  );

create policy "Project members can read materials" on public.material_items
  for select using (
    exists (
      select 1 from public.projects
      where projects.id = material_items.project_id and (
        projects.customer_id = auth.uid() or
        exists (
          select 1 from public.provider_profiles 
          where provider_profiles.id = projects.contractor_id and provider_profiles.profile_id = auth.uid()
        )
      )
    ) or public.is_admin()
  );

create policy "Project members can update materials" on public.material_items
  for all using (
    exists (
      select 1 from public.projects
      where projects.id = material_items.project_id and (
        projects.customer_id = auth.uid() or
        exists (
          select 1 from public.provider_profiles 
          where provider_profiles.id = projects.contractor_id and provider_profiles.profile_id = auth.uid()
        )
      )
    ) or public.is_admin()
  );

create policy "Project members can read photos" on public.project_photos
  for select using (
    exists (
      select 1 from public.projects
      where projects.id = project_photos.project_id and (
        projects.customer_id = auth.uid() or
        exists (
          select 1 from public.provider_profiles 
          where provider_profiles.id = projects.contractor_id and provider_profiles.profile_id = auth.uid()
        )
      )
    ) or public.is_admin()
  );

create policy "Project members can insert photos" on public.project_photos
  for insert with check (
    exists (
      select 1 from public.projects
      where projects.id = project_photos.project_id and (
        projects.customer_id = auth.uid() or
        exists (
          select 1 from public.provider_profiles 
          where provider_profiles.id = projects.contractor_id and provider_profiles.profile_id = auth.uid()
        )
      )
    ) or public.is_admin()
  );

-- REVIEWS
create policy "Anyone can read reviews" on public.reviews
  for select using (true);

create policy "Verified customers can insert reviews" on public.reviews
  for insert with check (
    auth.uid() = author_id and
    (
      exists (
        select 1 from public.projects 
        where projects.id = reviews.project_id and projects.customer_id = auth.uid()
      ) or
      exists (
        select 1 from public.bookings
        where bookings.id = reviews.booking_id and bookings.customer_id = auth.uid()
      )
    )
  );

-- NOTIFICATIONS
create policy "Users read own notifications" on public.notifications
  for select using (recipient_id = auth.uid());

create policy "Users update own notifications" on public.notifications
  for update using (recipient_id = auth.uid());

-- MESSAGES
create policy "Project participants can view messages" on public.messages
  for select using (
    exists (
      select 1 from public.projects
      where projects.id = messages.project_id and (
        projects.customer_id = auth.uid() or
        exists (
          select 1 from public.provider_profiles 
          where provider_profiles.id = projects.contractor_id and provider_profiles.profile_id = auth.uid()
        )
      )
    ) or public.is_admin()
  );

create policy "Project participants can send messages" on public.messages
  for insert with check (
    sender_id = auth.uid() and
    exists (
      select 1 from public.projects
      where projects.id = messages.project_id and (
        projects.customer_id = auth.uid() or
        exists (
          select 1 from public.provider_profiles 
          where provider_profiles.id = projects.contractor_id and provider_profiles.profile_id = auth.uid()
        )
      )
    )
  );

-- =====================================================================
-- AUTH TRIGGER: Automatically provision profiles on user sign-up
-- =====================================================================
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, email, display_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'role', 'customer')
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- =====================================================================
-- SEED DATA: Default Service Categories
-- =====================================================================
insert into public.service_categories (id, name, description, icon_name, popular, base_price_unit, indicative_starting_price, currency)
values
  ('labour', 'Labour & Helpers', 'Daily construction labour, helpers and site assistants', 'Users', true, 'day', 45.00, 'USD'),
  ('contractors', 'Construction Contractors', 'Licensed general building contractors for turnkey builds', 'HardHat', true, 'project', 15000.00, 'USD'),
  ('architects', 'Architects & Engineers', 'Floor plans, 3D structural models and structural certifications', 'Compass', true, 'sqft', 2.50, 'USD'),
  ('plumbing', 'Plumbing', 'Pipe fitting, sanitization, leak repairs and water systems', 'Wrench', true, 'hr', 40.00, 'USD'),
  ('electrical', 'Electrical', 'Complete wiring, panel upgrades, fixtures and safety checks', 'Zap', true, 'hr', 45.00, 'USD'),
  ('painting', 'Painting & Finishing', 'Interior and exterior premium wall coatings and waterproofing', 'Paintbrush', true, 'sqft', 1.20, 'USD'),
  ('carpentry', 'Carpentry & Millwork', 'Custom furniture, framing, doors, cabinetry and woodwork', 'Hammer', false, 'hr', 42.00, 'USD'),
  ('renovation', 'Renovation & Interiors', 'Modular kitchens, bathroom remodels and whole-home overhauls', 'Sparkles', true, 'project', 4500.00, 'USD'),
  ('materials', 'Building Materials', 'Cement, aggregate, steel reinforcements and finishing goods', 'Truck', false, 'unit', 120.00, 'USD')
on conflict (id) do nothing;
