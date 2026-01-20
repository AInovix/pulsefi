// Dedicated News RSS Proxy
// Fetches and parses RSS feeds for the Intel Feed

const fetch = require('node-fetch');

const FEEDS = [
  { url: 'https://feeds.bbci.co.uk/news/world/rss.xml', src: 'BBC' },
  { url: 'https://rss.nytimes.com/services/xml/rss/nyt/World.xml', src: 'NYT' },
  { url: 'https://www.aljazeera.com/xml/rss/all.xml', src: 'AJAZ' },
  { url: 'https://feeds.npr.org/1004/rss.xml', src: 'NPR' },
  { url: 'https://www.theguardian.com/world/rss', src: 'GUAR' },
];

// Simple XML parser for RSS items
function parseRSS(xml, source) {
  const items = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/gi;
  let match;

  while ((match = itemRegex.exec(xml)) !== null) {
    const itemXml = match[1];
    
    const title = itemXml.match(/<title>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/title>/i)?.[1]?.trim() || '';
    const link = itemXml.match(/<link>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/link>/i)?.[1]?.trim() || '';
    const pubDate = itemXml.match(/<pubDate>([\s\S]*?)<\/pubDate>/i)?.[1]?.trim() || '';
    const description = itemXml.match(/<description>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/description>/i)?.[1]?.trim() || '';

    if (title) {
      // Classify threat level
      const text = (title + ' ' + description).toLowerCase();
      let level = 'normal';
      
      if (text.match(/killed|dead|attack|strike|bomb|explo|war|missile|casualt|death|terror|massacre|assault|shooting/)) {
        level = 'critical';
      } else if (text.match(/military|troops|conflict|tension|crisis|nuclear|weapon|invasion|sanctions|drone/)) {
        level = 'elevated';
      } else if (text.match(/protest|warning|threat|security|arrest|emergency|evacuat/)) {
        level = 'warning';
      }

      items.push({
        title: title.replace(/<[^>]*>/g, '').substring(0, 200),
        link,
        date: pubDate,
        src: source,
        level
      });
    }
  }

  return items;
}

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
    'Cache-Control': 'public, max-age=60'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  const allItems = [];

  // Fetch all feeds in parallel
  const fetchPromises = FEEDS.map(async (feed) => {
    try {
      const response = await fetch(feed.url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; PULSE-Bot/1.0)',
          'Accept': 'application/rss+xml, application/xml, text/xml, */*'
        },
        timeout: 8000
      });

      if (response.ok) {
        const xml = await response.text();
        const items = parseRSS(xml, feed.src);
        return items.slice(0, 8);
      }
    } catch (error) {
      console.log(`Feed ${feed.src} error:`, error.message);
    }
    return [];
  });

  const results = await Promise.all(fetchPromises);
  results.forEach(items => allItems.push(...items));

  // Sort by date and deduplicate
  allItems.sort((a, b) => new Date(b.date) - new Date(a.date));
  
  const seen = new Set();
  const unique = allItems.filter(item => {
    const key = item.title.substring(0, 50);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  // If no items fetched, return fallback
  if (unique.length === 0) {
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        status: 'fallback',
        items: [
          { title: 'Feed temporarily unavailable - refresh to retry', link: '#', date: new Date().toISOString(), src: 'SYS', level: 'warning' }
        ]
      })
    };
  }

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({
      status: 'ok',
      items: unique.slice(0, 25)
    })
  };
};
