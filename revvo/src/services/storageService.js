import { supabase } from '../lib/supabase';

// Upload de arquivo
export async function uploadFile(bucket, path, file) {
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, file, {
      cacheControl: '3600',
      upsert: false
    });
  if (error) throw error;
  return data;
}

// Obter URL pública de arquivo
export function getPublicUrl(bucket, path) {
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data?.publicUrl || null;
}

// Remover arquivo
export async function removeFile(bucket, path) {
  const { error } = await supabase.storage.from(bucket).remove([path]);
  if (error) throw error;
  return true;
} 