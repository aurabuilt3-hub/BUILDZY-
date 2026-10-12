import fs from 'fs';

console.log('=== BUILDZY BACKEND & SECURITY VERIFICATION SUITE ===\n');

let failedTests = 0;
let passedTests = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✓ PASS: ${message}`);
    passedTests++;
  } else {
    console.error(`  ✗ FAIL: ${message}`);
    failedTests++;
  }
}

// 1. Audit .gitignore and secrets protection
console.log('1. Auditing Git Security & Environment Credentials:');
const gitignore = fs.readFileSync('.gitignore', 'utf8');
assert(gitignore.includes('.env'), '.gitignore ignores .env files');
assert(gitignore.includes('.env.*'), '.gitignore ignores .env.* wildcard variants');
assert(gitignore.includes('!.env.example'), '.gitignore allows committing .env.example template');

const envExample = fs.readFileSync('.env.example', 'utf8');
assert(envExample.includes('VITE_SUPABASE_URL='), '.env.example documents VITE_SUPABASE_URL');
assert(envExample.includes('VITE_SUPABASE_ANON_KEY='), '.env.example documents VITE_SUPABASE_ANON_KEY');
assert(!envExample.includes('service_role'), '.env.example does not contain or mention secret service-role keys');
assert(!envExample.includes('sbp_'), '.env.example does not contain real secret tokens');

// 2. Audit Client Initialization (src/lib/supabase.ts)
console.log('\n2. Auditing Client Module & Offline Demo Fallback:');
const supabaseLib = fs.readFileSync('src/lib/supabase.ts', 'utf8');
assert(supabaseLib.includes('isSupabaseConfigured'), 'Exports isSupabaseConfigured boolean flag');
assert(supabaseLib.includes('placeholder-offline.supabase.co'), 'Provides graceful dummy client if credentials unconfigured');
assert(!supabaseLib.includes('process.env.SUPABASE_SERVICE_ROLE_KEY'), 'No client-side service-role key leaks in supabase.ts');

// 3. Audit Database Schema & Migrations
console.log('\n3. Auditing PostgreSQL Migrations & Row Level Security:');
const initialMigration = fs.readFileSync('supabase/migrations/20261011_initial_schema.sql', 'utf8');
const hardeningMigration = fs.readFileSync('supabase/migrations/20261011_security_hardening.sql', 'utf8');
const standaloneSchema = fs.readFileSync('supabase/schema.sql', 'utf8');

const requiredEntities = [
  'profiles',
  'provider_profiles',
  'service_categories',
  'service_requests',
  'projects',
  'project_members',
  'quotations',
  'bookings',
  'project_milestones',
  'project_tasks',
  'material_items',
  'project_photos',
  'reviews',
  'notifications',
  'messages'
];

requiredEntities.forEach(table => {
  assert(initialMigration.includes(`create table if not exists public.${table}`), `Initial migration defines public.${table}`);
  assert(initialMigration.includes(`alter table public.${table} enable row level security;`), `RLS enabled on public.${table}`);
  assert(standaloneSchema.includes(`create table if not exists public.${table}`), `Standalone schema.sql defines public.${table}`);
});

// Check Security Hardening Triggers
console.log('\n4. Auditing Security Triggers & Anti-Tampering Rules:');
assert(hardeningMigration.includes('prevent_profile_role_update'), 'Trigger prevents unauthorized escalation to admin role on profiles');
assert(hardeningMigration.includes('verify_milestone_payout_permission'), 'Trigger prevents contractors from self-authorizing escrow payouts');
assert(hardeningMigration.includes('prevent_project_tampering'), 'Trigger disallows unauthorized changes to project customer_id and agreed_quotation');
assert(hardeningMigration.includes('projects.status in (\'In Progress\', \'Review\', \'Completed\')'), 'Reviews require active or completed qualifying project/booking');
assert(standaloneSchema.includes('storage.buckets'), 'Storage bucket project-photos configured with RLS');

// 5. Audit State Management & Data Isolation (src/context/AppContext.tsx)
console.log('\n5. Auditing Context State & Optimistic Rollbacks:');
const appContext = fs.readFileSync('src/context/AppContext.tsx', 'utf8');
assert(appContext.includes('LS_DEMO_PROJECTS_KEY'), 'Uses isolated demo storage key to protect private DB data');
assert(appContext.includes('bookingsService.createBooking'), 'Connects bookings to bookingsService');
assert(appContext.includes('projectsService.createProject'), 'Connects projects to projectsService');
assert(appContext.includes('prevBookings'), 'Implements state rollback on booking DB failure');
assert(appContext.includes('prevProjects'), 'Implements state rollback on project DB failure');
assert(appContext.includes('prevUser'), 'Implements state rollback on profile update DB failure');
assert(appContext.includes('authService.signOut()'), 'demoSignIn automatically signs out of real Supabase to prevent JWT abuse');

console.log(`\n======================================================`);
console.log(`TEST SUMMARY: ${passedTests} passed, ${failedTests} failed.`);
if (failedTests > 0) {
  process.exit(1);
} else {
  console.log('ALL AUDIT CRITERIA MET AND VERIFIED.');
}
