import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("Advertencia crítica de inicialización: Las variables de entorno de Supabase no están mapeadas en el runtime.");
}

export const supabase = createClient(
  supabaseUrl || 'https://supabase.co',
  supabaseAnonKey || 'sb_publishable_Abm7RRtKLhITutAvDjkViw_PPh1w5XL'
);
