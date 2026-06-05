import { createClient } from '@supabase/supabase-js';

// Public client (uses anon key — safe for browser)
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Admin client (uses service role — SERVER ONLY, never import in browser code)
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export type Runner = {
  id: string;
  user_id: string;
  email: string;
  name: string;
  surname: string;
  gender: string;
  country: string;
  date_of_birth: string | null;
  role: string;
  photo_url: string | null;
  bmi: number | null;
  created_at: string;
};
