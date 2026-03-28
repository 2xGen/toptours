import { NextResponse } from 'next/server';
import { createSupabaseServiceRoleClient } from '@/lib/supabaseClient';

function slugToDisplayName(slug) {
  if (!slug) return '';
  return String(slug)
    .replace(/[-_]+/g, ' ')
    .trim()
    .split(/\s+/g)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');
}

function labelFromSeoTitle(seoTitle, destinationId) {
  if (!seoTitle || typeof seoTitle !== 'string') return slugToDisplayName(destinationId);
  const beforeDash = seoTitle.split(/[–—-]/)[0]?.trim() || seoTitle.trim();
  const m = /^Baby Equipment Rentals in\s+(.+)$/i.exec(beforeDash);
  if (m) return m[1].trim();
  return slugToDisplayName(destinationId);
}

/**
 * GET /api/admin/baby-equipment-destinations
 * Active baby equipment destinations for admin link generator (public slugs only).
 */
export async function GET() {
  try {
    const supabase = createSupabaseServiceRoleClient();
    const { data, error } = await supabase
      .from('baby_equipment_rentals')
      .select('destination_id, seo_title')
      .eq('is_active', true)
      .order('destination_id', { ascending: true });

    if (error) throw error;

    const destinations = (data || []).map((row) => ({
      id: row.destination_id,
      label: labelFromSeoTitle(row.seo_title, row.destination_id),
    }));

    return NextResponse.json({ destinations });
  } catch (err) {
    console.error('baby-equipment-destinations:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to load destinations' },
      { status: 500 }
    );
  }
}
