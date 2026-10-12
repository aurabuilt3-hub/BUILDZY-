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
  currency varchar(3) not null default 'INR',
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
  currency varchar(3) not null default 'INR',
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
  currency varchar(3) not null default 'INR',
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
  currency varchar(3) not null default 'INR',
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
  currency varchar(3) not null default 'INR',
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
  currency varchar(3) not null default 'INR',
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
  currency varchar(3) not null default 'INR',
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
  currency varchar(3) not null default 'INR',
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
drop policy if exists "Public can view basic profiles" on public.profiles;
create policy "Public can view basic profiles" on public.profiles
  for select using (true);

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = id);

drop policy if exists "Users can insert own profile" on public.profiles;
create policy "Users can insert own profile" on public.profiles
  for insert with check (auth.uid() = id);

-- PROVIDER PROFILES
drop policy if exists "Anyone can browse provider profiles" on public.provider_profiles;
create policy "Anyone can browse provider profiles" on public.provider_profiles
  for select using (true);

drop policy if exists "Providers can update own provider profile" on public.provider_profiles;
create policy "Providers can update own provider profile" on public.provider_profiles
  for update using (
    exists (
      select 1 from public.profiles 
      where profiles.id = auth.uid() and profiles.id = provider_profiles.profile_id
    ) or public.is_admin()
  );

drop policy if exists "Providers can insert provider profile" on public.provider_profiles;
create policy "Providers can insert provider profile" on public.provider_profiles
  for insert with check (auth.uid() = profile_id or public.is_admin());

-- SERVICE CATEGORIES
drop policy if exists "Anyone can read categories" on public.service_categories;
create policy "Anyone can read categories" on public.service_categories
  for select using (true);

drop policy if exists "Only admin can modify categories" on public.service_categories;
create policy "Only admin can modify categories" on public.service_categories
  for all using (public.is_admin());

-- SERVICE REQUESTS
drop policy if exists "Customers can manage own service requests" on public.service_requests;
create policy "Customers can manage own service requests" on public.service_requests
  for all using (auth.uid() = customer_id or public.is_admin());

drop policy if exists "Providers can view open service requests" on public.service_requests;
create policy "Providers can view open service requests" on public.service_requests
  for select using (
    status = 'open' or auth.uid() = customer_id or public.is_admin()
  );

-- PROJECTS
drop policy if exists "Owners and contractors can view projects" on public.projects;
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

drop policy if exists "Customers can create projects" on public.projects;
create policy "Customers can create projects" on public.projects
  for insert with check (auth.uid() = customer_id or public.is_admin());

drop policy if exists "Project participants can update projects" on public.projects;
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
drop policy if exists "Project members view access" on public.project_members;
create policy "Project members view access" on public.project_members
  for select using (
    profile_id = auth.uid() or
    exists (
      select 1 from public.projects 
      where projects.id = project_members.project_id and projects.customer_id = auth.uid()
    ) or public.is_admin()
  );

-- QUOTATIONS
drop policy if exists "Customers and providers can view project quotations" on public.quotations;
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

drop policy if exists "Providers can submit quotations" on public.quotations;
create policy "Providers can submit quotations" on public.quotations
  for insert with check (
    exists (
      select 1 from public.provider_profiles
      where provider_profiles.id = quotations.provider_id and provider_profiles.profile_id = auth.uid()
    ) or public.is_admin()
  );

-- BOOKINGS
drop policy if exists "Users can view own bookings" on public.bookings;
create policy "Users can view own bookings" on public.bookings
  for select using (
    auth.uid() = customer_id or
    exists (
      select 1 from public.provider_profiles
      where provider_profiles.id = bookings.provider_id and provider_profiles.profile_id = auth.uid()
    ) or
    public.is_admin()
  );

drop policy if exists "Customers can insert bookings" on public.bookings;
create policy "Customers can insert bookings" on public.bookings
  for insert with check (auth.uid() = customer_id or public.is_admin());

drop policy if exists "Participants can update bookings" on public.bookings;
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
drop policy if exists "Project members can read milestones" on public.project_milestones;
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

drop policy if exists "Project members can update milestones" on public.project_milestones;
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

drop policy if exists "Project members can read tasks" on public.project_tasks;
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

drop policy if exists "Project members can manage tasks" on public.project_tasks;
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

drop policy if exists "Project members can read materials" on public.material_items;
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

drop policy if exists "Project members can update materials" on public.material_items;
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

drop policy if exists "Project members can read photos" on public.project_photos;
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

drop policy if exists "Project members can insert photos" on public.project_photos;
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
drop policy if exists "Anyone can read reviews" on public.reviews;
create policy "Anyone can read reviews" on public.reviews
  for select using (true);

drop policy if exists "Verified customers can insert reviews" on public.reviews;
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
drop policy if exists "Users read own notifications" on public.notifications;
create policy "Users read own notifications" on public.notifications
  for select using (recipient_id = auth.uid());

drop policy if exists "Users update own notifications" on public.notifications;
create policy "Users update own notifications" on public.notifications
  for update using (recipient_id = auth.uid());

-- MESSAGES
drop policy if exists "Project participants can view messages" on public.messages;
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

drop policy if exists "Project participants can send messages" on public.messages;
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
  ('labour', 'Labour & Helpers', 'Skilled masons (Raj Mistry), daily helpers (Beldar), and site loading crews', 'HardHat', true, 'day', 550.00, 'INR'),
  ('contractors', 'Construction Contractors', 'Turnkey builders, structural civil engineers & general contractors across India', 'Building2', true, 'sqft', 1550.00, 'INR'),
  ('architects', 'Architects & Engineers', 'Vastu-compliant blueprint drafting, 3D elevation, structural stability & municipal sanctions', 'Compass', true, 'sqft', 35.00, 'INR'),
  ('plumbing', 'Plumbing', 'Astral CPVC piping, bathroom sanitary fixtures, drainage & overhead tank installation', 'Wrench', true, 'visit', 450.00, 'INR'),
  ('electrical', 'Electrical', 'Concealed copper wiring, MCB distribution board, smart switches & inverter tie-in', 'Zap', true, 'visit', 400.00, 'INR'),
  ('painting', 'Painting & Finishing', 'Putty surface prep, sanding, primer barrier, and Asian Paints Royale luxury emulsion', 'Paintbrush', true, 'sqft', 18.00, 'INR'),
  ('carpentry', 'Carpentry & Millwork', 'Marine plywood wardrobes, custom teak main doors, modular kitchen carcases & wood repair', 'Hammer', false, 'job', 650.00, 'INR'),
  ('renovation', 'Renovation & Interiors', 'Complete apartment makeover, false ceilings, luxury modular kitchens & bathroom retrofits', 'Sparkles', true, 'sqft', 1200.00, 'INR'),
  ('materials', 'Building Materials', 'Wholesale UltraTech cement, Tata Tiscon TMT steel rebar, M-Sand, gravel & Kajaria tiles', 'Truck', false, 'unit', 385.00, 'INR')
on conflict (id) do update set
  name = excluded.name,
  description = excluded.description,
  indicative_starting_price = excluded.indicative_starting_price,
  currency = excluded.currency;



-- =====================================================================

-- =====================================================================
-- BUILDZY — SECURITY HARDENING MIGRATION
-- Migration: 20261011_security_hardening.sql
-- Defense against privilege escalation, unauthorized escrow payouts,
-- project tampering, and unverified review insertion.
-- =====================================================================

-- 1. HARDEN NEW USER SIGNUP: Disallow self-assignment of 'admin' role
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
declare
  sanitized_role text;
begin
  sanitized_role := coalesce(new.raw_user_meta_data->>'role', 'customer');
  -- Explicitly restrict client-requested role to valid non-admin roles
  if sanitized_role not in ('customer', 'contractor', 'worker') then
    sanitized_role := 'customer';
  end if;

  insert into public.profiles (id, email, display_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    sanitized_role
  );
  return new;
end;
$$;

-- 2. PREVENT ROLE ESCALATION ON EXISTING PROFILES
-- Even if a user calls UPDATE profiles SET role = 'admin', this trigger prevents it.
create or replace function public.prevent_profile_role_update()
returns trigger language plpgsql as $$
begin
  if new.role is distinct from old.role and not public.is_admin() then
    raise exception 'Unauthorized modification: role cannot be altered by non-admin users';
  end if;
  return new;
end;
$$;

drop trigger if exists trg_prevent_profile_role_update on public.profiles;
create trigger trg_prevent_profile_role_update
  before update on public.profiles
  for each row execute function public.prevent_profile_role_update();

-- 3. ESCROW & PAYOUT PROTECTION: Only the project customer or admin can authorize payouts
create or replace function public.verify_milestone_payout_permission()
returns trigger language plpgsql as $$
declare
  proj_customer_id uuid;
begin
  select customer_id into proj_customer_id from public.projects where id = new.project_id;

  -- Disallow contractor or external party from self-releasing payments or changing agreed payout amounts
  if (new.is_paid <> old.is_paid and new.is_paid = true) or (new.payout_amount <> old.payout_amount) then
    if auth.uid() <> proj_customer_id and not public.is_admin() then
      raise exception 'Security violation: Only the project customer or administrator can approve milestone payouts';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_verify_milestone_payout on public.project_milestones;
create trigger trg_verify_milestone_payout
  before update on public.project_milestones
  for each row execute function public.verify_milestone_payout_permission();

-- 4. PREVENT PROJECT TAMPERING
-- Disallows changing project ownership (customer_id) or unilaterally changing agreed quotations
create or replace function public.prevent_project_tampering()
returns trigger language plpgsql as $$
begin
  if new.customer_id <> old.customer_id and not public.is_admin() then
    raise exception 'Security violation: Project ownership cannot be reassigned';
  end if;

  if new.agreed_quotation <> old.agreed_quotation and auth.uid() <> old.customer_id and not public.is_admin() then
    raise exception 'Security violation: Contractors cannot unilaterally modify the agreed contract quotation';
  end if;

  return new;
end;
$$;

drop trigger if exists trg_prevent_project_tampering on public.projects;
create trigger trg_prevent_project_tampering
  before update on public.projects
  for each row execute function public.prevent_project_tampering();

-- 5. HARDEN REVIEW INSERTION RLS: Requires qualifying active or completed status
drop policy if exists "Verified customers can insert reviews" on public.reviews;
create policy "Verified customers can insert reviews" on public.reviews
  for insert with check (
    auth.uid() = author_id and
    (
      exists (
        select 1 from public.projects 
        where projects.id = reviews.project_id 
          and projects.customer_id = auth.uid()
          and projects.status in ('In Progress', 'Review', 'Completed')
      ) or
      exists (
        select 1 from public.bookings 
        where bookings.id = reviews.booking_id 
          and bookings.customer_id = auth.uid()
          and bookings.status in ('Completed', 'In Progress')
      )
    )
  );

-- 6. STORAGE BUCKET CONFIGURATION & POLICIES FOR PROJECT PHOTOS
insert into storage.buckets (id, name, public)
values ('project-photos', 'project-photos', true)
on conflict (id) do nothing;

drop policy if exists "Public can view project photos" on storage.objects;
create policy "Public can view project photos" on storage.objects
  for select using (bucket_id = 'project-photos');

drop policy if exists "Authenticated users can upload project photos" on storage.objects;
create policy "Authenticated users can upload project photos" on storage.objects
  for insert with check (
    bucket_id = 'project-photos' and
    auth.role() = 'authenticated'
  );


-- =====================================================================

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


-- =====================================================================

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

