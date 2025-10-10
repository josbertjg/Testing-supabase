import { createClient } from "@supabase/supabase-js";

// Obtener variables de entorno
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validar que las variables de entorno existan
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Faltan variables de entorno. Asegúrate de tener VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY en tu archivo .env"
  );
}

// Crear cliente con configuración de autenticación mejorada
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Habilita la persistencia de sesión en localStorage
    persistSession: true,
    // Detecta automáticamente si la sesión debe almacenarse
    autoRefreshToken: true,
    // Detecta cambios de sesión
    detectSessionInUrl: true,
  },
});

// Exportar URL para uso en edge functions
export { supabaseUrl };

// Tipos para TypeScript
export interface Patient {
  id: string;
  auth_user_id?: string;
  first_name: string;
  last_name: string;
  email: string;
  password_hash?: string;
  created_at: string;
  updated_at: string;
}

export interface Doctor {
  id: string;
  auth_user_id?: string;
  first_name: string;
  last_name: string;
  email: string;
  password_hash?: string;
  identity_document?: string;
  specialty?: string;
  experience_description?: string;
  profile_photo_url?: string;
  created_at: string;
  updated_at: string;
}

export interface DoctorTitle {
  id: string;
  doctor_id: string;
  title_specialty: string;
  issued_at: string;
  license_number?: string;
  graduated_from?: string;
  certificate_url?: string;
  created_at: string;
}

export interface Procedure {
  id: string;
  code?: string;
  name: string;
  description?: string;
  created_at: string;
}

export interface Pathology {
  id: string;
  code?: string;
  name: string;
  description?: string;
  created_at: string;
}

export interface DoctorLocation {
  id: string;
  doctor_id: string;
  place_id: string;
  formatted_address: string;
  latitude: number;
  longitude: number;
  city?: string;
  region?: string;
  country?: string;
  created_at: string;
  updated_at?: string;
}

export interface DoctorProcedure {
  id: string;
  doctor_id: string;
  procedure_id: string;
  notes?: string;
  created_at: string;
}

export interface DoctorPathology {
  id: string;
  doctor_id: string;
  pathology_id: string;
  notes?: string;
  created_at: string;
}
