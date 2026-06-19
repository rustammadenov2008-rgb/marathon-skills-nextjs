import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from './auth/[...nextauth]';
import { supabaseAdmin } from '@/lib/supabase';

export const config = { api: { bodyParser: { sizeLimit: '5mb' } } };

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  if (!session?.user) return res.status(401).json({ error: 'Unauthorized' });

  const adminEmails = (process.env.ADMIN_EMAILS || '').split(',').map(e => e.trim());
  if (!adminEmails.includes(session.user.email || '')) {
    return res.status(403).json({ error: 'Admin only' });
  }

  if (req.method !== 'POST') return res.status(405).end();

  try {
    const { csv } = req.body as { csv: string };
    if (!csv) return res.status(400).json({ error: 'CSV data required' });

    const lines = csv.split('\n').map(l => l.trim()).filter(Boolean);
    if (lines.length < 2) return res.status(400).json({ error: 'CSV must have header and data rows' });

    // Parse header
    const header = lines[0].split(',').map(h => h.replace(/"/g,'').trim().toLowerCase());
    const emailIdx   = header.findIndex(h => h.includes('email'));
    const nameIdx    = header.findIndex(h => h === 'имя' || h === 'name');
    const surnameIdx = header.findIndex(h => h === 'фамилия' || h === 'surname');
    const genderIdx  = header.findIndex(h => h === 'пол' || h === 'gender');
    const countryIdx = header.findIndex(h => h === 'страна' || h === 'country');
    const roleIdx    = header.findIndex(h => h === 'роль' || h === 'role');
    const dobIdx     = header.findIndex(h => h.includes('рождени') || h.includes('birth'));

    if (emailIdx < 0 || nameIdx < 0 || surnameIdx < 0) {
      return res.status(400).json({ error: 'CSV должен содержать колонки: email, имя/name, фамилия/surname' });
    }

    const parseRow = (line: string) =>
      line.split(',').map(v => v.replace(/^"|"$/g,'').trim());

    const userId = (session.user as any).id as string;
    let inserted = 0; let skipped = 0; const errors: string[] = [];

    for (let i = 1; i < lines.length; i++) {
      const cols = parseRow(lines[i]);
      const email   = cols[emailIdx]   || '';
      const name    = cols[nameIdx]    || '';
      const surname = cols[surnameIdx] || '';
      if (!email || !name || !surname) { skipped++; continue; }

      const { error } = await supabaseAdmin.from('runners').insert({
        user_id:       userId,
        email,
        name,
        surname,
        gender:        genderIdx  >= 0 ? (cols[genderIdx]  || 'Мужской') : 'Мужской',
        country:       countryIdx >= 0 ? (cols[countryIdx] || 'Russia')   : 'Russia',
        role:          roleIdx    >= 0 ? (cols[roleIdx]    || 'Бегун')    : 'Бегун',
        date_of_birth: dobIdx     >= 0 ? (cols[dobIdx]     || null)       : null,
      });

      if (error) {
        if (error.code === '23505') skipped++; // duplicate
        else errors.push(`Строка ${i + 1}: ${error.message}`);
      } else inserted++;
    }

    return res.status(200).json({ ok: true, inserted, skipped, errors });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}
