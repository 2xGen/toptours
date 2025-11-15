export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const productId = req.query.productId;

    if (!productId) {
      return res.status(400).json({ error: 'Product ID is required' });
    }

    const apiKey = process.env.VIATOR_API_KEY || '282a363f-5d60-456a-a6a0-774ec4832b07';

    if (!apiKey) {
      return res.status(500).json({ error: 'API key not configured' });
    }

    const searchResponse = await fetch('https://api.viator.com/partner/search/freetext', {
      method: 'POST',
      headers: {
        'exp-api-key': apiKey,
        Accept: 'application/json;version:2.0',
        'Accept-Language': 'en-US',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        searchTerm: productId,
        searchTypes: [
          {
            searchType: 'PRODUCTS',
            pagination: { start: 1, count: 20 },
          },
        ],
        currency: 'USD',
      }),
    });

    if (!searchResponse.ok) {
      const errorText = await searchResponse.text();
      return res
        .status(searchResponse.status)
        .json({ error: `Viator Search API error: ${searchResponse.status}`, details: errorText });
    }

    const searchData = await searchResponse.json();
    const products = searchData.products?.results || [];

    const foundProduct = products.find((product) => {
      const pid = product.productId || product.productCode;
      return pid === productId || pid === productId.replace('d28-', '') || pid === `d28-${productId}`;
    });

    if (!foundProduct) {
      return res.status(404).json({
        error: 'Product not found in search results',
        searchedProductId: productId,
        allProductIds: products.map((p) => p.productId || p.productCode),
        totalResults: products.length,
      });
    }

    return res.status(200).json({
      productId,
      foundProductId: foundProduct.productId || foundProduct.productCode,
      flags: foundProduct.flags || [],
      allFlags: foundProduct.flags,
      pricing: foundProduct.pricing,
      title: foundProduct.title,
      fullProduct: foundProduct,
      allFlagsInResults: [...new Set(products.flatMap((p) => p.flags || []))],
    });
  } catch (error) {
    console.error('Error fetching product:', error);
    return res.status(500).json({ error: 'Failed to fetch product', details: error.message });
  }
}

