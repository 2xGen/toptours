/**
 * Personal Match form submission – saves to Supabase and emails mail@toptours.ai via Resend.
 * POST /api/internal/personal-match-submit
 * Body: { email, destination, travelStartDate?, travelEndDate?, travelDatesNotes?, groupSize?, primaryGoal?, name? }
 * Requires: email, destination, and either (travelStartDate + travelEndDate) OR travelDatesNotes.
 */

import { NextResponse } from 'next/server';
import { createSupabaseServiceRoleClient } from '@/lib/supabaseClient';
import { sendPersonalMatchSubmission } from '@/lib/email';

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      email,
      destination,
      travelStartDate,
      travelEndDate,
      travelDatesNotes,
      groupSize,
      primaryGoal,
      name,
    } = body;

    if (!email?.trim() || !destination?.trim()) {
      return NextResponse.json(
        { error: 'Email and destination are required.' },
        { status: 400 }
      );
    }

    const hasDateRange = travelStartDate && travelEndDate;
    const hasNotes = travelDatesNotes?.trim();
    if (!hasDateRange && !hasNotes) {
      return NextResponse.json(
        { error: 'Please provide either travel dates (start and end) or describe your dates (e.g. flexible in April).' },
        { status: 400 }
      );
    }

    const supabase = createSupabaseServiceRoleClient();

    const row = {
      email: email.trim().toLowerCase(),
      destination: destination.trim(),
      travel_start_date: travelStartDate?.trim() || null,
      travel_end_date: travelEndDate?.trim() || null,
      travel_dates_notes: travelDatesNotes?.trim() || null,
      group_size: groupSize?.trim() || null,
      primary_goal: primaryGoal?.trim() || null,
      name: name?.trim() || null,
    };

    const { error: insertError } = await supabase
      .from('personal_match_submissions')
      .insert(row);

    if (insertError) {
      console.error('[personal-match-submit] DB insert error:', insertError);
      return NextResponse.json(
        { error: insertError.message || 'Failed to save request.' },
        { status: 500 }
      );
    }

    const result = await sendPersonalMatchSubmission({
      email: row.email,
      destination: row.destination,
      travelStartDate: row.travel_start_date || undefined,
      travelEndDate: row.travel_end_date || undefined,
      travelDatesNotes: row.travel_dates_notes || undefined,
      groupSize: row.group_size || undefined,
      primaryGoal: row.primary_goal || undefined,
      name: row.name || undefined,
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error?.message || 'Request saved but email failed.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[personal-match-submit] Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Something went wrong.' },
      { status: 500 }
    );
  }
}
