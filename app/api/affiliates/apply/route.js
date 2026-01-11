import { NextResponse } from 'next/server';
import { createSupabaseServiceRoleClient } from '@/lib/supabaseClient';

export async function POST(request) {
  const supabase = createSupabaseServiceRoleClient();

  try {
    const body = await request.json();
    const { name, email, phone, partnerProgram, promotionPlan, websiteUrl } = body;

    // Validate required fields
    if (!name || !email || !partnerProgram || !promotionPlan) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Insert affiliate application
    const { data, error } = await supabase
      .from('affiliate_applications')
      .insert({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone?.trim() || null,
        partner_program: partnerProgram,
        promotion_plan: promotionPlan.trim(),
        website_url: websiteUrl?.trim() || null,
        status: 'pending',
      })
      .select()
      .single();

    if (error) {
      console.error('Error inserting affiliate application:', error);
      
      // Handle duplicate email gracefully (optional - you might want to allow multiple applications)
      if (error.code === '23505') { // Unique constraint violation
        return NextResponse.json(
          { error: 'An application with this email already exists' },
          { status: 409 }
        );
      }
      
      throw error;
    }

    return NextResponse.json({ 
      success: true, 
      data,
      message: 'Application submitted successfully' 
    }, { status: 201 });
  } catch (err) {
    console.error('Error in affiliate application POST:', err);
    return NextResponse.json({ 
      error: err.message || 'Server error',
      details: process.env.NODE_ENV === 'development' ? err.stack : undefined
    }, { status: 500 });
  }
}
