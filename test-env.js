#!/usr/bin/env node

require('dotenv').config({ path: './backend/.env' });

console.log('🔍 CHECKING ENVIRONMENT VARIABLES');
console.log('=================================\n');

console.log('DATABASE_URL:', process.env.DATABASE_URL);
console.log('JWT_SECRET:', process.env.JWT_SECRET);
console.log('STRIPE_PUBLISHABLE_KEY:', process.env.STRIPE_PUBLISHABLE_KEY);
console.log('SUPABASE_ANON_KEY:', process.env.SUPABASE_ANON_KEY);

if (process.env.DATABASE_URL && process.env.DATABASE_URL.includes('supabase.co')) {
  console.log('\n✅ Supabase connection string found!');
} else {
  console.log('\n❌ Supabase connection string not found or incorrect');
}


