import { getUserPlans } from '@/lib/travelPlans';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    const plans = await getUserPlans(userId);

    return res.status(200).json({ plans });
  } catch (error) {
    console.error('Error fetching user plans:', error);
    return res.status(500).json({ error: 'Failed to fetch user plans' });
  }
}

