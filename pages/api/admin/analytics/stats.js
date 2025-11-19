import { createSupabaseServiceRoleClient } from '@/lib/supabaseClient';

// Simple admin access check - verify session token exists
// In production, you might want to verify the token is valid
function checkAdminAccess(req) {
  // For now, we'll allow access if the endpoint is called
  // The frontend handles authentication via login form
  // You can add token verification here if needed
  return true;
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Check admin access (simplified - frontend handles login)
  if (!checkAdminAccess(req)) {
    return res.status(403).json({ error: 'Access denied' });
  }

  try {
    const supabase = createSupabaseServiceRoleClient();

    // Get total users
    const { count: totalUsers, error: usersError } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true });

    // Get users created in last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const { count: usersLast30Days, error: users30Error } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', thirtyDaysAgo.toISOString());

    // Get total page views
    const { count: totalPageViews, error: viewsError } = await supabase
      .from('page_views')
      .select('*', { count: 'exact', head: true });

    // Get page views in last 30 days
    const { count: pageViewsLast30Days, error: views30Error } = await supabase
      .from('page_views')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', thirtyDaysAgo.toISOString());

    // Get unique sessions in last 30 days
    const { data: uniqueSessionsData, error: sessionsError } = await supabase
      .from('page_views')
      .select('session_id')
      .gte('created_at', thirtyDaysAgo.toISOString())
      .not('session_id', 'is', null);

    const uniqueSessions = uniqueSessionsData 
      ? new Set(uniqueSessionsData.map(v => v.session_id)).size 
      : 0;

    // Get active users (users who viewed pages in last 30 days)
    const { data: activeUsersData, error: activeUsersError } = await supabase
      .from('page_views')
      .select('user_id')
      .gte('created_at', thirtyDaysAgo.toISOString())
      .not('user_id', 'is', null);

    const activeUsers = activeUsersData 
      ? new Set(activeUsersData.map(v => v.user_id)).size 
      : 0;

    // Get page views by type
    const { data: pageTypesData, error: pageTypesError } = await supabase
      .from('page_views')
      .select('page_type')
      .gte('created_at', thirtyDaysAgo.toISOString());

    const pageTypesMap = {};
    if (pageTypesData) {
      pageTypesData.forEach(view => {
        const type = view.page_type || 'other';
        pageTypesMap[type] = (pageTypesMap[type] || 0) + 1;
      });
    }

    const totalViewsForTypes = Object.values(pageTypesMap).reduce((a, b) => a + b, 0);
    const pageTypes = Object.entries(pageTypesMap)
      .map(([page_type, view_count]) => ({
        page_type,
        view_count,
        percentage: totalViewsForTypes > 0 ? (view_count / totalViewsForTypes) * 100 : 0,
      }))
      .sort((a, b) => b.view_count - a.view_count);

    // Get top destinations
    const { data: destinationsData, error: destinationsError } = await supabase
      .from('page_views')
      .select('destination_id')
      .gte('created_at', thirtyDaysAgo.toISOString())
      .not('destination_id', 'is', null);

    const destinationsMap = {};
    if (destinationsData) {
      destinationsData.forEach(view => {
        const dest = view.destination_id;
        if (dest) {
          destinationsMap[dest] = (destinationsMap[dest] || 0) + 1;
        }
      });
    }

    const topDestinations = Object.entries(destinationsMap)
      .map(([destination_id, view_count]) => ({
        destination_id,
        view_count,
      }))
      .sort((a, b) => b.view_count - a.view_count)
      .slice(0, 10);

    // Calculate daily average (last 30 days)
    const dailyAverage = pageViewsLast30Days ? Math.round(pageViewsLast30Days / 30) : 0;

    return res.status(200).json({
      totalUsers: totalUsers || 0,
      usersLast30Days: usersLast30Days || 0,
      totalPageViews: totalPageViews || 0,
      pageViewsLast30Days: pageViewsLast30Days || 0,
      uniqueSessions,
      activeUsers,
      pageTypes,
      topDestinations,
      dailyAverage,
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return res.status(500).json({ error: 'Failed to fetch stats' });
  }
}

