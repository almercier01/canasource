import { supabase } from '../src/lib/supabaseClient';

async function createTestAccounts() {
  // Create business owner account
  const { data: owner, error: ownerError } = await supabase.auth.signUp({
    email: 'owner@test.com',
    password: 'password123'
  });

  if (ownerError) {
    console.error('Error creating owner account:', ownerError);
    return;
  }

  // Create user account
  const { data: user, error: userError } = await supabase.auth.signUp({
    email: 'user@test.com',
    password: 'password123'
  });

  if (userError) {
    console.error('Error creating user account:', userError);
    return;
  }

  console.log('Test accounts created successfully!');
  console.log('Owner:', owner);
  console.log('User:', user);
}

createTestAccounts();