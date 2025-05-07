import type { Handler } from '@netlify/functions';

const handler: Handler = async (event) => {
  const { q, lang = 'fr', country = 'ca', domain = 'google.ca', num = '10' } = event.queryStringParameters || {};

  if (!q) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Missing query' }),
    };
  }

  const apiKey = process.env.AVES_API_KEY;
  const endpoint = `https://api.avesapi.com/search?apikey=${apiKey}&q=${encodeURIComponent(q)}&num=${num}&hl=${lang}&gl=${country}&google_domain=${domain}&device=desktop&output=json`;

  try {
    const response = await fetch(endpoint);
    if (!response.ok) {
      return {
        statusCode: response.status,
        body: JSON.stringify({ error: `AvesAPI returned ${response.status}` }),
      };
    }

    const json = await response.json();
    return {
      statusCode: 200,
      body: JSON.stringify(json),
    };
  } catch (error: any) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message || 'Unknown error' }),
    };
  }
};

export { handler };
