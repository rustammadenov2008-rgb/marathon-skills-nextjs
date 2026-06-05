import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { supabaseAdmin } from '@/lib/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // All routes require authentication
  const session = await getServerSession(req, res, authOptions);
  if (!session?.user) return res.status(401).json({ error: 'Unauthorized' });

  const userId = (session.user as any).id as string;

  // ── GET /api/runners ─────────────────────────────
  if (req.method === 'GET') {
    const { role, sort = 'name', search = '' } = req.query;

    let query = supabaseAdmin
      .from('runners')
      .select('id, user_id, email, name, surname, gender, country, date_of_birth, role, photo_url, bmi, created_at');

    if (role && role !== 'all') query = query.eq('role', role);
    if (search) {
      query = query.or(
        `name.ilike.%${search}%,surname.ilike.%${search}%,email.ilike.%${search}%`
      );
    }

    const sortCol = ['name','surname','email','role'].includes(sort as string)
      ? (sort as string) : 'name';
    query = query.order(sortCol, { ascending: true });

    const { data, error } = await query;
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json(data);
  }

  // ── POST /api/runners ────────────────────────────
  if (req.method === 'POST') {
    const { email, name, surname, gender, country, date_of_birth } = req.body;

    if (!email || !name || !surname) {
      return res.status(400).json({ error: 'email, name, and surname are required' });
    }

    // Check duplicate
    const { data: existing } = await supabaseAdmin
      .from('runners')
      .select('id')
      .eq('email', email)
      .maybeSingle();

    if (existing) return res.status(409).json({ error: 'Email already registered' });

    const { data, error } = await supabaseAdmin
      .from('runners')
      .insert({
        user_id: userId,
        email,
        name,
        surname,
        gender:        gender        || 'Мужской',
        country:       country       || 'Russia',
        date_of_birth: date_of_birth || null,
        role:          'Бегун',
      })
      .select()
      .single();

    if (error) return res.status(500).json({ error: error.message });
    return res.status(201).json(data);
  }

  res.setHeader('Allow', ['GET', 'POST']);
  return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
}
