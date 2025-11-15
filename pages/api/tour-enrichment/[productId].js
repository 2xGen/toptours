import { generateTourEnrichment } from '@/lib/tourEnrichment';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { productId } = req.query;
    if (!productId) {
      return res.status(400).json({ error: 'Missing product id' });
    }

    let tour = null;

    if (req.body && typeof req.body === 'object' && req.body.tour) {
      tour = req.body.tour;
    }

    if (!tour) {
      const apiKey = process.env.VIATOR_API_KEY || '282a363f-5d60-456a-a6a0-774ec4832b07';
      const url = `https://api.viator.com/partner/products/${productId}?currency=USD`;

      const productResponse = await fetch(url, {
        method: 'GET',
        headers: {
          'exp-api-key': apiKey,
          Accept: 'application/json;version=2.0',
          'Accept-Language': 'en-US',
          'Content-Type': 'application/json',
        },
        cache: 'no-store',
      });

      if (!productResponse.ok) {
        const errorText = await productResponse.text();
        console.error('Failed to fetch tour from Viator:', errorText);
        return res.status(500).json({ error: 'Unable to fetch tour details' });
      }

      tour = await productResponse.json();
    }

    if (!tour || tour.error) {
      return res.status(404).json({ error: 'Tour not found' });
    }

    const result = await generateTourEnrichment(productId, tour);

    if (result.error) {
      return res.status(500).json({ error: result.error });
    }

    return res.status(200).json({ enrichment: result.data });
  } catch (error) {
    console.error('Error generating enrichment:', error);
    return res.status(500).json({ error: 'Failed to generate enrichment' });
  }
}

