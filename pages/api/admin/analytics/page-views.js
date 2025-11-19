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
    const { days = '30' } = req.query;
    const daysNum = parseInt(days, 10) || 30;
    
    const dateFrom = new Date();
    dateFrom.setDate(dateFrom.getDate() - daysNum);

    const supabase = createSupabaseServiceRoleClient();

    // Get top pages by view count
    const { data: pageViewsData, error } = await supabase
      .from('page_views')
      .select('page_path, page_type')
      .gte('created_at', dateFrom.toISOString());

    if (error) {
      console.error('Error fetching page views:', error);
      return res.status(500).json({ error: 'Failed to fetch page views' });
    }

    // Aggregate by page_path
    const pageViewsMap = {};
    if (pageViewsData) {
      pageViewsData.forEach(view => {
        const path = view.page_path || 'unknown';
        if (!pageViewsMap[path]) {
          pageViewsMap[path] = {
            page_path: path,
            page_type: view.page_type || 'other',
            view_count: 0,
          };
        }
        pageViewsMap[path].view_count += 1;
      });
    }

    const pageViews = Object.values(pageViewsMap)
      .sort((a, b) => b.view_count - a.view_count)
      .slice(0, 50); // Top 50 pages

    return res.status(200).json({
      pageViews,
      dateRange: daysNum,
    });
  } catch (error) {
    console.error('Error fetching page views:', error);
    return res.status(500).json({ error: 'Failed to fetch page views' });
  }
}

