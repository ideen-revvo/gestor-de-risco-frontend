import { supabase } from '../lib/supabase';

// Login
export async function login({ email, password }) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

// Signup
export async function signup({ email, password, ...user_metadata }) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: user_metadata }
  });
  if (error) throw error;
  return data;
}

// Logout
export async function logout() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
  return true;
}

// Reset de senha por e-mail
export async function resetPasswordForEmail(email) {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`,
  });
  if (error) throw error;
  return true;
} 