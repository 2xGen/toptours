/**
 * Travel Plans System
 * Handles creation, reading, updating, and promotion of community travel plans
 */

import { createSupabaseServiceRoleClient, createSupabaseBrowserClient } from './supabaseClient';

/**
 * Generate a unique slug for a plan
 */
export function generatePlanSlug(title, username, existingSlugs = []) {
  const base = `${title.toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')}-${username}`;
  
  // Ensure uniqueness
  let slug = base;
  let counter = 1;
  while (existingSlugs.includes(slug)) {
    slug = `${base}-${counter}`;
    counter++;
  }
  return slug;
}

/**
 * Auto-generate plan title based on items
 */
export function generatePlanTitle(destinationName, maxDayNumber, itemCount) {
  if (maxDayNumber && maxDayNumber > 0) {
    return `${maxDayNumber} Day${maxDayNumber > 1 ? 's' : ''} in ${destinationName}`;
  }
  // Fallback to item count
  if (itemCount >= 3) {
    return `${itemCount} Things to Do in ${destinationName}`;
  }
  return `My ${destinationName} Plan`;
}

/**
 * Create a new travel plan
 */
export async function createTravelPlan(userId, planData) {
  if (!userId) {
    throw new Error('User ID is required');
  }

  try {
    const supabase = createSupabaseServiceRoleClient();
    
    // Check for existing slugs
    const { data: existingPlans } = await supabase
      .from('travel_plans')
      .select('slug')
      .eq('user_id', userId);
    
    const existingSlugs = existingPlans?.map(p => p.slug) || [];
    
    // Generate slug if not provided
    const slug = planData.slug || generatePlanSlug(
      planData.title || generatePlanTitle(planData.destination_id, null, 0),
      userId.substring(0, 8), // Use first 8 chars of UUID as username
      existingSlugs
    );
    
    // Create plan
    const { data: plan, error } = await supabase
      .from('travel_plans')
      .insert({
        user_id: userId,
        title: planData.title || generatePlanTitle(planData.destination_id, null, 0),
        slug,
        destination_id: planData.destination_id,
        description: planData.description || null,
        cover_image_url: planData.cover_image_url || null,
        is_public: planData.is_public !== false, // default true
        plan_mode: planData.plan_mode || 'favorites', // 'favorites' or 'itinerary'
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error creating travel plan:', error);
      throw error;
    }
    
    return plan;
  } catch (error) {
    console.error('Error in createTravelPlan:', error);
    throw error;
  }
}

/**
 * Add items to a plan
 */
export async function addPlanItems(planId, items) {
  if (!planId || !items || items.length === 0) {
    throw new Error('Plan ID and items are required');
  }

  try {
    const supabase = createSupabaseServiceRoleClient();
    
    // Format items for insertion
    const itemsToInsert = items.map((item, index) => {
      // Store selected_tips as JSON string in selected_tip column (for backward compatibility)
      const tipsArray = item.selected_tips || (item.selected_tip ? [item.selected_tip] : []);
      const selectedTipsJson = tipsArray.length > 0 ? JSON.stringify(tipsArray) : null;
      
      return {
        plan_id: planId,
        item_type: item.type, // 'tour' or 'restaurant'
        product_id: item.type === 'tour' ? item.product_id : null,
        restaurant_id: item.type === 'restaurant' ? item.restaurant_id : null,
        day_number: item.day_number || null,
        order_index: item.order_index !== undefined ? item.order_index : index,
        selected_tip: selectedTipsJson || item.selected_tips?.[0] || item.selected_tip || null, // Store JSON string or first tip for backward compatibility
      };
    });
    
    const { data, error } = await supabase
      .from('travel_plan_items')
      .insert(itemsToInsert)
      .select();
    
    if (error) {
      console.error('Error adding plan items:', error);
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('Error in addPlanItems:', error);
    throw error;
  }
}

/**
 * Get a plan by slug (public or user's own)
 */
export async function getPlanBySlug(slug, userId = null) {
  try {
    const supabase = createSupabaseServiceRoleClient();
    
    // Build query - public plans or user's own plans
    let query = supabase
      .from('travel_plans')
      .select('*')
      .eq('slug', slug);
    
    if (userId) {
      // Allow user to see their own private plans
      query = query.or(`is_public.eq.true,user_id.eq.${userId}`);
    } else {
      // Only public plans for non-authenticated users
      query = query.eq('is_public', true);
    }
    
    const { data: plan, error } = await query.single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Plan not found
      }
      console.error('Error fetching plan:', error);
      throw error;
    }
    
    return plan;
  } catch (error) {
    console.error('Error in getPlanBySlug:', error);
    throw error;
  }
}

/**
 * Get plan items for a plan
 */
export async function getPlanItems(planId) {
  try {
    const supabase = createSupabaseServiceRoleClient();
    
    const { data: items, error } = await supabase
      .from('travel_plan_items')
      .select('*')
      .eq('plan_id', planId)
      .order('day_number', { ascending: true, nullsLast: true })
      .order('order_index', { ascending: true });
    
    if (error) {
      console.error('Error fetching plan items:', error);
      throw error;
    }
    
    // Parse selected_tips from JSON string if needed
    const parsedItems = (items || []).map(item => {
      if (item.selected_tip && typeof item.selected_tip === 'string') {
        try {
          // Try to parse as JSON array
          const parsed = JSON.parse(item.selected_tip);
          if (Array.isArray(parsed)) {
            return {
              ...item,
              selected_tips: parsed,
            };
          }
        } catch {
          // If parsing fails, treat as single tip ID
          return {
            ...item,
            selected_tips: [item.selected_tip],
          };
        }
      }
      
      // If selected_tips is already an array or null, return as is
      if (!item.selected_tips && item.selected_tip) {
        return {
          ...item,
          selected_tips: [item.selected_tip],
        };
      }
      
      return item;
    });
    
    return parsedItems;
  } catch (error) {
    console.error('Error in getPlanItems:', error);
    throw error;
  }
}

/**
 * Get plan with items
 */
export async function getPlanWithItems(slug, userId = null) {
  try {
    const plan = await getPlanBySlug(slug, userId);
    if (!plan) return null;
    
    const items = await getPlanItems(plan.id);
    return {
      ...plan,
      items,
    };
  } catch (error) {
    console.error('Error in getPlanWithItems:', error);
    throw error;
  }
}

/**
 * Update a plan
 */
export async function updateTravelPlan(planId, userId, updates) {
  if (!planId || !userId) {
    throw new Error('Plan ID and User ID are required');
  }

  try {
    const supabase = createSupabaseServiceRoleClient();
    
    // Verify ownership
    const { data: plan, error: fetchError } = await supabase
      .from('travel_plans')
      .select('user_id')
      .eq('id', planId)
      .single();
    
    if (fetchError || !plan || plan.user_id !== userId) {
      throw new Error('Plan not found or unauthorized');
    }
    
    // Update plan
    const { data, error } = await supabase
      .from('travel_plans')
      .update(updates)
      .eq('id', planId)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating plan:', error);
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('Error in updateTravelPlan:', error);
    throw error;
  }
}

/**
 * Update plan items (replace all items)
 */
export async function updatePlanItems(planId, userId, items) {
  if (!planId || !userId) {
    throw new Error('Plan ID and User ID are required');
  }

  try {
    const supabase = createSupabaseServiceRoleClient();
    
    // Verify ownership
    const { data: plan, error: fetchError } = await supabase
      .from('travel_plans')
      .select('user_id')
      .eq('id', planId)
      .single();
    
    if (fetchError || !plan || plan.user_id !== userId) {
      throw new Error('Plan not found or unauthorized');
    }
    
    // Delete existing items
    await supabase
      .from('travel_plan_items')
      .delete()
      .eq('plan_id', planId);
    
    // Insert new items
    if (items && items.length > 0) {
      return await addPlanItems(planId, items);
    }
    
    return [];
  } catch (error) {
    console.error('Error in updatePlanItems:', error);
    throw error;
  }
}

/**
 * Delete a plan
 */
export async function deleteTravelPlan(planId, userId) {
  if (!planId || !userId) {
    throw new Error('Plan ID and User ID are required');
  }

  try {
    const supabase = createSupabaseServiceRoleClient();
    
    // Verify ownership
    const { data: plan, error: fetchError } = await supabase
      .from('travel_plans')
      .select('user_id')
      .eq('id', planId)
      .single();
    
    if (fetchError || !plan || plan.user_id !== userId) {
      throw new Error('Plan not found or unauthorized');
    }
    
    // Delete plan (items and promotions will cascade)
    const { error } = await supabase
      .from('travel_plans')
      .delete()
      .eq('id', planId);
    
    if (error) {
      console.error('Error deleting plan:', error);
      throw error;
    }
    
    return true;
  } catch (error) {
    console.error('Error in deleteTravelPlan:', error);
    throw error;
  }
}

/**
 * Get user's plans
 */
export async function getUserPlans(userId) {
  if (!userId) {
    return [];
  }

  try {
    const supabase = createSupabaseServiceRoleClient();
    
    const { data: plans, error } = await supabase
      .from('travel_plans')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching user plans:', error);
      throw error;
    }
    
    return plans || [];
  } catch (error) {
    console.error('Error in getUserPlans:', error);
    throw error;
  }
}

/**
 * Get popular plans for a destination
 */
/**
 * Get all popular public plans (optionally filtered by destination)
 */
export async function getPopularPlans(destinationId = null, limit = 20) {
  try {
    const supabase = createSupabaseServiceRoleClient();
    
    let query = supabase
      .from('travel_plans')
      .select('*')
      .eq('is_public', true)
      .order('total_score', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (destinationId) {
      query = query.eq('destination_id', destinationId);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching popular plans:', error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error('Error in getPopularPlans:', error);
    return [];
  }
}

/**
 * Get popular plans by destination (backward compatibility)
 */
export async function getPopularPlansByDestination(destinationId, limit = 10) {
  try {
    const supabase = createSupabaseServiceRoleClient();
    
    const { data: plans, error } = await supabase
      .from('travel_plans')
      .select('*')
      .eq('destination_id', destinationId)
      .eq('is_public', true)
      .order('total_score', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (error) {
      console.error('Error fetching popular plans:', error);
      throw error;
    }
    
    return plans || [];
  } catch (error) {
    console.error('Error in getPopularPlansByDestination:', error);
    throw error;
  }
}

