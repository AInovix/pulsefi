# PULSE - Global Intelligence Monitor

Real-time global intelligence monitoring platform with threat assessment, prediction markets, and OSINT feeds.

![PULSE Dashboard](screenshot.png)

## Features

- 🗺️ **Interactive Threat Map** - Heat map visualization of global conflict zones
- 📰 **Real-time Intel Feed** - Aggregated news from BBC, NYT, Al Jazeera, NPR, Guardian
- 📊 **Prediction Markets** - Polymarket odds on geopolitical events
- 💹 **Market Data** - Crypto and traditional market tracking
- 🐦 **OSINT Sources** - Curated list of intelligence analysts on X/Twitter
- 🔔 **Audio Alerts** - Sound notifications for critical events
- 📱 **PWA Support** - Install as native app on mobile/desktop
- 🌓 **Dark/Light Theme** - Toggle between themes
- 📤 **Export Reports** - Download data as CSV or JSON
- 📲 **Mobile Responsive** - Slide-out drawer for mobile devices

## Project Structure

```
pulse-app/
├── index.html              # Main application
├── manifest.json           # PWA manifest
├── sw.js                   # Service worker for offline support
├── package.json            # Dependencies
├── netlify.toml            # Netlify configuration
├── _headers                # HTTP headers configuration
├── netlify/
│   └── functions/
│       ├── proxy.js        # General CORS proxy
│       ├── polymarket.js   # Polymarket API proxy
│       └── news.js         # RSS feed aggregator
├── icon-192.png            # App icon (192x192)
├── icon-512.png            # App icon (512x512)
└── README.md               # This file
```

## Deployment to Netlify

### Option 1: Deploy via Netlify UI

1. Push this folder to a GitHub repository
2. Go to [Netlify](https://app.netlify.com)
3. Click "Add new site" → "Import an existing project"
4. Connect your GitHub account and select the repository
5. Build settings will be auto-detected from `netlify.toml`
6. Click "Deploy site"

### Option 2: Deploy via CLI

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login to Netlify
netlify login

# Deploy (from project directory)
cd pulse-app
npm install
netlify deploy --prod
```

## Local Development

```bash
# Install dependencies
npm install

# Start local dev server with Netlify functions
npm start
# or
netlify dev

# Open http://localhost:8888
```

## API Endpoints

When deployed, the following API endpoints are available:

| Endpoint | Description |
|----------|-------------|
| `/api/news` | Aggregated RSS news feeds |
| `/api/polymarket` | Polymarket prediction markets |
| `/api/proxy?url=` | General CORS proxy |

## Environment Variables

No environment variables are required. All APIs used are public.

## How the CORS Proxy Works

The main challenge with a static site is CORS (Cross-Origin Resource Sharing). External APIs like Polymarket block requests from browsers. 

The Netlify serverless functions act as a proxy:

```
Browser → Netlify Function → External API → Netlify Function → Browser
```

This bypasses CORS since server-to-server requests aren't restricted.

### Fallback Chain

If the Netlify functions aren't available (local file testing), the app tries:

1. Netlify function (`/api/polymarket`)
2. Alternative function path (`/.netlify/functions/polymarket`)
3. Direct API call (works in some browsers/extensions)
4. Hardcoded fallback data (ensures the UI always shows something)

## Data Sources

| Source | API | Update Interval |
|--------|-----|-----------------|
| News | RSS (rss2json) | 60 seconds |
| Polymarket | gamma-api.polymarket.com | 60 seconds |
| Crypto | api.coingecko.com | 30 seconds |
| Threat Zones | Static data | - |

## Creating App Icons

You need to create two PNG icons for the PWA:

- `icon-192.png` - 192x192 pixels
- `icon-512.png` - 512x512 pixels

Recommended: Use a simple radar/target design with an orange (#ff6600) accent on a dark (#0a0a0a) background.

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `T` | Toggle theme |
| `M` | Toggle audio alerts |
| `E` | Export report |

## Customization

### Adding News Sources

Edit `netlify/functions/news.js`:

```javascript
const FEEDS = [
  { url: 'https://example.com/rss', src: 'EXAMPLE' },
  // Add more feeds here
];
```

### Adjusting Refresh Intervals

Edit the user preferences in the app or modify defaults in `index.html`:

```javascript
const DEFAULT_PREFS = {
  refreshInterval: 60, // seconds
  // ...
};
```

### Adding Threat Zones

Edit the `ZONES` array in `index.html`:

```javascript
const ZONES = [
  { id: 11, name: 'NEW ZONE', region: 'XXX', coords: [lat, lng], level: 'elevated', activity: 50 },
];
```

## Troubleshooting

### "Feed Unavailable" Error

1. Check if Netlify functions are deployed correctly
2. Verify the function logs in Netlify dashboard
3. The fallback RSS service (rss2json) has rate limits

### Polymarket Not Loading

1. Ensure the `polymarket.js` function is deployed
2. Check Netlify function logs for errors
3. Polymarket API may be rate-limited or changed

### Map Not Showing

1. Check browser console for Leaflet errors
2. Ensure you're not blocking CDN resources
3. Try disabling ad blockers

### PWA Not Installing

1. Serve over HTTPS (Netlify provides this)
2. Check `manifest.json` is loading
3. Ensure icons exist at the specified paths

## License

MIT License - feel free to use and modify.

## Credits

- Map tiles: [CartoDB](https://carto.com/)
- Charts: [Chart.js](https://www.chartjs.org/)
- Map library: [Leaflet](https://leafletjs.com/)
- Heat map: [Leaflet.heat](https://github.com/Leaflet/Leaflet.heat)
- Fonts: [Inter](https://rsms.me/inter/), [JetBrains Mono](https://www.jetbrains.com/lp/mono/)

---

Built with ❤️ for OSINT enthusiasts
