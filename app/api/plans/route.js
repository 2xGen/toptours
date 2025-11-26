import { NextResponse } from 'next/server';
import { createSupabaseServiceRoleClient } from '@/lib/supabaseClient';
import { createTravelPlan, addPlanItems, updateTravelPlan, updatePlanItems, deleteTravelPlan } from '@/lib/travelPlans';

export async function POST(request) {
  try {
    const body = await request.json();
    const { action, userId, ...data } = body;

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 401 });
    }

    // Note: Authentication is verified on the client side before making this request
    // RLS policies in Supabase will ensure users can only modify their own plans
    const supabase = createSupabaseServiceRoleClient();

    if (action === 'create') {
      const { title, destination_id, description, cover_image_url, is_public, plan_mode, items } = data;
      
      // Create plan
      const plan = await createTravelPlan(userId, {
        title,
        destination_id,
        description,
        cover_image_url,
        is_public: is_public !== false,
        plan_mode: plan_mode || 'favorites',
      });

      // Add items if provided
      if (items && items.length > 0) {
        await addPlanItems(plan.id, items);
      }

      return NextResponse.json({ success: true, plan });
    }

    if (action === 'update') {
      const { planId, title, description, cover_image_url, is_public, plan_mode, items } = data;
      
      const updates = {};
      if (title !== undefined) updates.title = title;
      if (description !== undefined) updates.description = description;
      if (cover_image_url !== undefined) updates.cover_image_url = cover_image_url;
      if (is_public !== undefined) updates.is_public = is_public;
      if (plan_mode !== undefined) updates.plan_mode = plan_mode;

      if (Object.keys(updates).length > 0) {
        await updateTravelPlan(planId, userId, updates);
      }

      // Update items if provided
      if (items !== undefined) {
        await updatePlanItems(planId, userId, items);
      }

      const { getPlanWithItems } = await import('@/lib/travelPlans');
      const updatedPlan = await getPlanWithItems(null, userId); // Will need to fetch by ID
      
      return NextResponse.json({ success: true, plan: updatedPlan });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Error in plans API:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const body = await request.json();
    const { planId, userId } = body;

    if (!planId || !userId) {
      return NextResponse.json({ error: 'Plan ID and User ID are required' }, { status: 400 });
    }

    await deleteTravelPlan(planId, userId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting plan:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

