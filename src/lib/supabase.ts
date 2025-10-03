import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://fynzhfrffhegquakmsiz.supabase.co";
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ5bnpoZnJmZmhlZ3F1YWttc2l6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk0NDMwMjAsImV4cCI6MjA3NTAxOTAyMH0.iOuL9AmwrMXxKJulKdqKQU4lVmMzsjXtg0fe24dwa64";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

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
