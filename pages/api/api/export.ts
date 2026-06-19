import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from './auth/[...nextauth]';
import { supabaseAdmin } from '@/lib/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  if (!session?.user) return res.status(401).json({ error: 'Unauthorized' });

  if (req.method !== 'GET') return res.status(405).end();

  const { data, error } = await supabaseAdmin
    .from('runners')
    .select('id, email, name, surname, gender, country, date_of_birth, role, bmi, created_at')
    .order('name');

  if (error) return res.status(500).json({ error: error.message });

  // Build CSV
  const headers = ['ID','Email','Имя','Фамилия','Пол','Страна','Дата рождения','Роль','BMI','Дата регистрации'];
  const rows = data.map(r => [
    r.id, r.email, r.name, r.surname, r.gender,
    r.country, r.date_of_birth || '', r.role,
    r.bmi ?? '', r.created_at?.slice(0,10) || ''
  ].map(v => `"${String(v).replace(/"/g,'""')}"`).join(','));

  const csv = [headers.join(','), ...rows].join('\n');
  const bom = '\uFEFF'; // UTF-8 BOM для Excel

  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="marathon_runners_${Date.now()}.csv"`);
  return res.status(200).send(bom + csv);
}
