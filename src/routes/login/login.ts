// src/lib/login.ts

import supabase from '../../scripts/supabaseutil'


async function login(email:string, password:string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email,
    password: password
  });

  if (error) {
    console.error('Login error:', error.message);
  } else {
    console.log('Logged in:', data);
  }

  email = '';
  password = '';
  
  return data;
}

export { login };