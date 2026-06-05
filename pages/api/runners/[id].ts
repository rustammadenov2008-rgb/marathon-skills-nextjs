import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { supabaseAdmin } from '@/lib/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  if (!session?.user) return res.status(401).json({ error: 'Unauthorized' });

  const userId = (session.user as any).id as string;
  const { id } = req.query;

  // ── GET /api/runners/:id ─────────────────────────
  if (req.method === 'GET') {
    const { data, error } = await supabaseAdmin
      .from('runners')
      .select('*')
      .eq('id', id)
      .single();

    if (error) return res.status(404).json({ error: 'Runner not found' });
    return res.status(200).json(data);
  }

  // ── PUT /api/runners/:id ─────────────────────────
  // Admin (google sub matches admin email list) OR own record
  if (req.method === 'PUT') {
    const adminEmails = (process.env.ADMIN_EMAILS || '').split(',').map(e => e.trim());
    const isAdmin = adminEmails.includes(session.user.email || '');

    // Fetch runner to check ownership
    const { data: runner } = await supabaseAdmin
      .from('runners').select('user_id').eq('id', id).single();

    if (!runner) return res.status(404).json({ error: 'Runner not found' });
    if (!isAdmin && runner.user_id !== userId) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const { name, surname, role, bmi, photo_url, gender, country, date_of_birth } = req.body;

    const updates: Record<string, unknown> = {};
    if (name          !== undefined) updates.name          = name;
    if (surname       !== undefined) updates.surname       = surname;
    if (gender        !== undefined) updates.gender        = gender;
    if (country       !== undefined) updates.country       = country;
    if (date_of_birth !== undefined) updates.date_of_birth = date_of_birth;
    if (bmi           !== undefined) updates.bmi           = bmi;
    if (photo_url     !== undefined) updates.photo_url     = photo_url;
    // Only admin can change role
    if (isAdmin && role !== undefined) updates.role = role;

    const { data, error } = await supabaseAdmin
      .from('runners')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json(data);
  }

  // ── DELETE /api/runners/:id ──────────────────────
  if (req.method === 'DELETE') {
    const adminEmails = (process.env.ADMIN_EMAILS || '').split(',').map(e => e.trim());
    if (!adminEmails.includes(session.user.email || '')) {
      return res.status(403).json({ error: 'Admin only' });
    }

    const { error } = await supabaseAdmin.from('runners').delete().eq('id', id);
    if (error) return res.status(500).json({ error: error.message });
    return res.status(204).end();
  }

  res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
  return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
}
