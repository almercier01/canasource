import type { Handler, HandlerEvent } from '@netlify/functions';
import axios from 'axios';

export const handler: Handler = async (event: HandlerEvent) => {
  const url = event.queryStringParameters?.url;

  if (!url || !url.startsWith('http')) {
    return { statusCode: 400, body: 'Invalid URL' };
  }

  try {
    const response = await axios.get(url, {
      headers: { 'User-Agent': 'CanaSourceBot/1.0' },
      timeout: 8000,
      validateStatus: (status) => status < 500, // Prevent throwing on 403/404
    });

    if (response.status === 403) {
      console.warn(`403 Forbidden when fetching ${url}`);
      return {
        statusCode: 200,
        body: JSON.stringify({ email: null, warning: '403 Forbidden – Skipped' }),
      };
    }

    const contentType = response.headers['content-type'];
    console.log(`Fetched ${url} with content type: ${contentType}`);

    if (!contentType || !contentType.includes('text/html')) {
      console.warn(`Unsupported content type for ${url}: ${contentType}`);
      return {
        statusCode: 415,
        body: JSON.stringify({ error: 'Unsupported content type' }),
      };
    }

    const html = response.data;
    if (typeof html !== 'string') {
      console.error('Fetched content is not a string');
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Unexpected response format' }),
      };
    }

    const rawMatches = html.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-z]{2,}/g) || [];

    const emails: string[] = Array.from(new Set(rawMatches)).filter(e =>
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e) &&
      !/votre-?courriel|example\.com|\.png$|\.jpg$|\.jpeg$|\.svg$/i.test(e)
    );

    const preferred = emails.find((e) =>
      /^(info|contact|sales|support)/i.test(e)
    ) || emails[0];

    console.log(`Extracted emails from ${url}:`, emails);

    return {
      statusCode: 200,
      body: JSON.stringify({ email: preferred || null }),
    };

  } catch (err: any) {
    const message = err instanceof Error ? err.message : 'Unknown error';

    // If 403 slipped through and caused an error, handle explicitly
    if (axios.isAxiosError(err) && err.response?.status === 403) {
      console.warn(`403 caught in catch block for ${url}`);
      return {
        statusCode: 200,
        body: JSON.stringify({ email: null, warning: '403 Forbidden – Skipped (from catch)' }),
      };
    }

    console.error(`Error fetching/parsing ${url}:`, message);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: message }),
    };
  }
};
