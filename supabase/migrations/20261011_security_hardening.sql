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

create policy "Public can view project photos" on storage.objects
  for select using (bucket_id = 'project-photos');

create policy "Authenticated users can upload project photos" on storage.objects
  for insert with check (
    bucket_id = 'project-photos' and
    auth.role() = 'authenticated'
  );
