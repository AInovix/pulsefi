// Netlify Serverless Function - Proxy for CORS issues
// This function proxies requests to external APIs that block CORS

const fetch = require('node-fetch');

exports.handler = async (event, context) => {
  // Get the URL to proxy from query parameters
  const url = event.queryStringParameters?.url;
  
  if (!url) {
    return {
      statusCode: 400,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ error: 'Missing url parameter' })
    };
  }

  // Validate URL - only allow specific domains for security
  const allowedDomains = [
    'gamma-api.polymarket.com',
    'api.rss2json.com',
    'feeds.bbci.co.uk',
    'rss.nytimes.com',
    'www.aljazeera.com',
    'feeds.npr.org',
    'api.coingecko.com',
    'clob.polymarket.com'
  ];

  try {
    const urlObj = new URL(url);
    const isAllowed = allowedDomains.some(domain => urlObj.hostname.includes(domain));
    
    if (!isAllowed) {
      return {
        statusCode: 403,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ error: 'Domain not allowed' })
      };
    }

    // Fetch the external resource
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'PULSE-Intelligence-Monitor/1.0',
        'Accept': 'application/json, application/xml, text/xml, */*'
      },
      timeout: 15000
    });

    const contentType = response.headers.get('content-type') || 'text/plain';
    let body;

    if (contentType.includes('application/json')) {
      body = JSON.stringify(await response.json());
    } else {
      body = await response.text();
    }

    return {
      statusCode: response.status,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=60'
      },
      body
    };

  } catch (error) {
    console.error('Proxy error:', error);
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ error: 'Proxy request failed', message: error.message })
    };
  }
};
