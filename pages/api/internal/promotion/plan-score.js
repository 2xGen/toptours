import { getPlanPromotionScore } from '@/lib/promotionSystem';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { planId } = req.query;

    if (!planId) {
      return res.status(400).json({ error: 'planId is required' });
    }

    const score = await getPlanPromotionScore(planId);

    // Transform to match PlanPromotionCard expected format
    if (score) {
      return res.status(200).json({
        planId: score.planId || score.plan_id || planId,
        total_score: score.total_score || 0,
        monthly_score: score.monthly_score || 0,
        weekly_score: score.weekly_score || 0,
        past_28_days_score: score.past_28_days_score || 0,
      });
    }

    // Return default if no score found
    return res.status(200).json({
      planId,
      total_score: 0,
      monthly_score: 0,
      weekly_score: 0,
      past_28_days_score: 0,
    });
  } catch (error) {
    console.error('Error fetching plan promotion score:', error);
    return res.status(500).json({ error: 'Failed to fetch plan promotion score' });
  }
}
