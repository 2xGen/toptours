export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { productId } = req.query;

    if (!productId) {
      return res.status(400).json({ error: 'Product ID is required' });
    }

    const apiKey = process.env.VIATOR_API_KEY || '282a363f-5d60-456a-a6a0-774ec4832b07';

    if (!apiKey) {
      return res.status(500).json({ error: 'API key not configured' });
    }

    const url = `https://api.viator.com/partner/products/${productId}?currency=USD`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'exp-api-key': apiKey,
        Accept: 'application/json;version=2.0',
        'Accept-Language': 'en-US',
        'Content-Type': 'application/json',
      },
      next: { revalidate: 3600 },
    });

    if (!response.ok) {
      if (response.status === 404) {
        return res.status(404).json({ error: 'Product not found' });
      }
      throw new Error(`Viator API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    console.error('Viator Product API Error:', error);
    return res.status(500).json({ error: 'Failed to fetch product', details: error.message });
  }
}

