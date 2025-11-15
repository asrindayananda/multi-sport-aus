# Web Scraping Implementation

## Overview

The Multi-Sport Australia Tracker now includes web scrapers for fetching live sports data from official websites. The scrapers are implemented in the backend API and automatically refresh data every 6 hours.

## Scrapers Implemented

### 1. NRL Scraper (`scrapers/nrlScraper.js`)
- **Source**: nrl.com/draw
- **Events Scraped**:
  - Season opener
  - State of Origin series (3 games)
  - NRL Grand Final
  - Regular season key matches
- **Fallback**: Uses curated 2025 NRL calendar if website is unavailable

### 2. AFL Scraper (`scrapers/aflScraper.js`)
- **Source**: afltables.com
- **Events Scraped**:
  - Round 1 (season opener)
  - ANZAC Day match
  - Queen's Birthday match
  - Finals series
  - AFL Grand Final
- **Fallback**: Uses curated 2025 AFL calendar if website is unavailable

### 3. Bathurst Scraper (`scrapers/bathurstScraper.js`)
- **Source**: supercars.com
- **Events Scraped**:
  - Bathurst 12 Hour
  - Bathurst 1000
  - Bathurst 6 Hour
- **Fallback**: Uses curated 2025 Bathurst calendar if website is unavailable

## How It Works

### Backend API

The scrapers run automatically in the backend:

1. **On Startup**: All scrapers run immediately when the backend starts
2. **Scheduled Updates**: Data refreshes every 6 hours via cron job
3. **Manual Refresh**: Admin endpoint `/api/sports/refresh` triggers immediate update
4. **Caching**: Scraped data is cached in memory for fast API responses

### API Endpoints

```javascript
GET /api/sports/all        // Get all sports events
GET /api/sports/nrl        // Get NRL events only
GET /api/sports/afl        // Get AFL events only
GET /api/sports/bathurst   // Get Bathurst events only
POST /api/sports/refresh   // Manually trigger data refresh
```

### Mobile App Integration

The mobile app automatically fetches from the backend:

```typescript
// sportsApi.ts
async getNRLSchedule(): Promise<SportEvent[]> {
  const response = await axios.get(`${BACKEND_URL}/api/sports/nrl`);
  return response.data.events;
}
```

## Data Format

Each event includes:
```javascript
{
  id: string,           // Unique identifier
  title: string,        // Event name
  date: string,         // YYYY-MM-DD format
  time: string,         // HH:MM format
  location: string,     // Venue/city
  sport: string,        // 'NRL', 'AFL', or 'Bathurst'
  description: string,  // Detailed description
  source: string        // 'scraped' or 'fallback'
}
```

## Error Handling

The scrapers implement robust error handling:

1. **Network Errors**: Caught and logged, fallback data returned
2. **Parsing Errors**: Website structure changes handled gracefully
3. **Timeout**: 10-second timeout prevents hanging requests
4. **Fallback Data**: Always available if scraping fails

## Testing

Run scraper tests:
```bash
cd backend
node test-scrapers.js
```

Expected output:
```
=== Testing Web Scrapers ===

1. Testing NRL Scraper...
   ✓ Retrieved 5 NRL events

2. Testing AFL Scraper...
   ✓ Retrieved 5 AFL events

3. Testing Bathurst Scraper...
   ✓ Retrieved 3 Bathurst events

=== All Scraper Tests Passed ✓ ===
```

## Dependencies

```json
{
  "cheerio": "^1.0.0",      // HTML parsing
  "axios": "^1.13.2",       // HTTP requests
  "puppeteer-core": "latest" // Advanced scraping (if needed)
}
```

## Deployment Considerations

### Production Recommendations

1. **Rate Limiting**: Respect website rate limits
2. **User Agent**: Use a proper User-Agent header
3. **Caching**: Current 6-hour cache is appropriate
4. **Monitoring**: Log scraping success/failure rates
5. **Legal**: Ensure compliance with website terms of service

### Website Structure Changes

If websites change their structure:

1. Update the scraper logic in `scrapers/`
2. Test with `test-scrapers.js`
3. Fallback data ensures app continues working

### Scaling

For high traffic:
- Consider using a dedicated scraping service
- Implement distributed caching (Redis)
- Add database for persistent storage

## Limitations

1. **No Real-time Updates**: Data refreshes every 6 hours
2. **Website Dependency**: Scrapers depend on website structure
3. **No Historical Data**: Only current season events
4. **Limited Detail**: Basic event info only

## Future Enhancements

1. **More Sports**: Add more Australian sports
2. **Live Scores**: Integrate score scraping
3. **Team Rosters**: Scrape team lineups
4. **Statistics**: Historical stats and records
5. **News**: Scrape sports news articles

## Maintenance

Regular maintenance tasks:

- Monitor scraper success rates
- Update selectors when websites change
- Add new events as announced
- Remove past events
- Update fallback data annually

---

The web scraping implementation provides live sports data while maintaining reliability through fallback mechanisms.
