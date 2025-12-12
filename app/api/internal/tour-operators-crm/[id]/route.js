import { NextResponse } from 'next/server';
import { updateOperator } from '@/lib/tourOperatorsCRM';

export async function PATCH(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Convert dates to ISO (only if they have values)
    const updates = { ...body };
    if (updates.date_sent_email && updates.date_sent_email.trim() !== '') {
      updates.date_sent_email = new Date(updates.date_sent_email).toISOString();
    } else if (updates.date_sent_email === '' || updates.date_sent_email === null) {
      updates.date_sent_email = null;
    }
    if (updates.reminder_date && updates.reminder_date.trim() !== '') {
      updates.reminder_date = new Date(updates.reminder_date).toISOString();
    } else if (updates.reminder_date === '' || updates.reminder_date === null) {
      updates.reminder_date = null;
    }

    const result = await updateOperator(id, updates);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

