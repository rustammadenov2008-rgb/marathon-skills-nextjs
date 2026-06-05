import { Runner } from './supabase';

// ── Runners ─────────────────────────────────────────

export async function fetchRunners(params?: {
  role?: string; sort?: string; search?: string;
}): Promise<Runner[]> {
  const p = new URLSearchParams();
  if (params?.role)   p.set('role',   params.role);
  if (params?.sort)   p.set('sort',   params.sort);
  if (params?.search) p.set('search', params.search);
  const res = await fetch('/api/runners?' + p);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function fetchMe(): Promise<Runner | null> {
  const res = await fetch('/api/runners/me');
  if (!res.ok) return null;
  return res.json();
}

export async function fetchRunner(id: string): Promise<Runner> {
  const res = await fetch(`/api/runners/${id}`);
  if (!res.ok) throw new Error('Runner not found');
  return res.json();
}

export async function createRunner(body: Partial<Runner>): Promise<Runner> {
  const res = await fetch('/api/runners', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Create failed');
  return data;
}

export async function updateRunner(id: string, body: Partial<Runner>): Promise<Runner> {
  const res = await fetch(`/api/runners/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Update failed');
  return data;
}

export async function deleteRunner(id: string): Promise<void> {
  const res = await fetch(`/api/runners/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Delete failed');
}
