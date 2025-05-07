import type { Handler } from '@netlify/functions';

const handler: Handler = async (event) => {
  const { q, lang = 'fr' } = event.queryStringParameters || {};

  if (!q) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Missing query' }),
    };
  }

  const apiKey = process.env.AVES_API_KEY;
  const endpoint = `https://api.avesapi.com/search?apikey=${apiKey}&type=web&query=${encodeURIComponent(
    q
  )}&google_domain=google.ca&gl=ca&hl=${lang}&device=desktop&output=json&num=10`;

  try {
    const response = await fetch(endpoint);
    const data = await response.json();

    if (!response.ok) {
      console.error('AvesAPI returned error:', data);
      return {
        statusCode: response.status,
        body: JSON.stringify(data),
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify(data),
    };
  } catch (error) {
    console.error('AvesAPI fetch failed:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to fetch AvesAPI' }),
    };
  }
};

export { handler };
