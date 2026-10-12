import fs from 'fs';

function makePoliciesIdempotent(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');

  // Find all `create policy "NAME" on TABLE`
  const regex = /create\s+policy\s+"([^"]+)"\s+on\s+([a-zA-Z0-9_.]+)/gi;

  let replacedCount = 0;
  content = content.replace(regex, (match, policyName, targetTable) => {
    replacedCount++;
    return `drop policy if exists "${policyName}" on ${targetTable};\n${match}`;
  });

  // Clean any duplicated consecutive drop policy lines if they were already there
  const lines = content.split('\n');
  const cleanedLines = [];
  for (let i = 0; i < lines.length; i++) {
    const curr = lines[i].trim();
    const prev = cleanedLines.length > 0 ? cleanedLines[cleanedLines.length - 1].trim() : '';
    if (curr.startsWith('drop policy if exists') && prev === curr) {
      continue;
    }
    cleanedLines.push(lines[i]);
  }

  fs.writeFileSync(filePath, cleanedLines.join('\n'));
  console.log(filePath, 'updated', replacedCount, 'policies to be idempotent');
}

makePoliciesIdempotent('supabase/migrations/20261011_initial_schema.sql');
makePoliciesIdempotent('supabase/migrations/20261011_security_hardening.sql');
makePoliciesIdempotent('supabase/migrations/20261012_pricing_estimation_scheduling.sql');

// Also update master standalone schema.sql
const initial = fs.readFileSync('supabase/migrations/20261011_initial_schema.sql', 'utf8');
const hardening = fs.readFileSync('supabase/migrations/20261011_security_hardening.sql', 'utf8');
const pricing = fs.readFileSync('supabase/migrations/20261012_pricing_estimation_scheduling.sql', 'utf8');
const seed = fs.readFileSync('supabase/migrations/20261012_pan_india_seed.sql', 'utf8');

fs.writeFileSync('supabase/schema.sql', [initial, hardening, pricing, seed].join('\n\n-- =====================================================================\n\n'));
console.log('supabase/schema.sql regenerated with idempotent policies');
