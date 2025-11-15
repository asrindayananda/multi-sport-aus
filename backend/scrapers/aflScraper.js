const axios = require('axios');
const cheerio = require('cheerio');

/**
 * Scraper for AFL data from afltables.com
 * Gets upcoming AFL matches and key events by scraping live website
 */
async function scrapeAFLData() {
  try {
    console.log('Scraping AFL data from afltables.com...');
    
    // AFL Tables provides comprehensive fixture data
    const response = await axios.get('https://afltables.com/afl/seas/2025.html', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
      },
      timeout: 15000
    });
    
    const $ = cheerio.load(response.data);
    const events = [];
    const now = new Date();
    
    // AFL Tables uses table structure for fixtures
    let matchesFound = false;
    
    // Look for fixture tables
    $('table').each((tableIndex, table) => {
      const $table = $(table);
      const headers = $table.find('th').map((i, el) => $(el).text().trim().toLowerCase()).get();
      
      // Check if this looks like a fixtures table
      if (headers.some(h => h.includes('round') || h.includes('date') || h.includes('teams'))) {
        $table.find('tr').each((rowIndex, row) => {
          try {
            const $row = $(row);
            const cells = $row.find('td').map((i, el) => $(el).text().trim()).get();
            
            if (cells.length >= 3) {
              // Try to parse round, date, teams, venue
              const roundText = cells[0] || '';
              const dateText = cells[1] || '';
              const teamsText = cells[2] || '';
              const venueText = cells[3] || 'TBD';
              
              // Extract teams (usually in format "Team1 v Team2" or "Team1 vs Team2")
              const teamsMatch = teamsText.match(/^(.+?)\s+v[s]?\s+(.+)$/i);
              
              if (teamsMatch && dateText) {
                const homeTeam = teamsMatch[1].trim();
                const awayTeam = teamsMatch[2].trim();
                const matchDate = parseAFLDate(dateText);
                
                if (matchDate && matchDate > now) {
                  matchesFound = true;
                  const eventId = `afl-${roundText.replace(/\s+/g, '-').toLowerCase()}-${matchDate.toISOString().split('T')[0]}`;
                  
                  events.push({
                    id: eventId,
                    title: `${homeTeam} vs ${awayTeam}`,
                    date: matchDate.toISOString().split('T')[0],
                    time: '19:20', // Default AFL match time
                    location: venueText,
                    sport: 'AFL',
                    description: `${roundText}: ${homeTeam} vs ${awayTeam}`,
                    source: 'scraped'
                  });
                }
              }
            }
          } catch (err) {
            // Skip rows that can't be parsed
          }
        });
      }
    });
    
    if (!matchesFound || events.length === 0) {
      console.log('Could not scrape AFL fixtures, using curated major events');
      events.push(...getCuratedAFLEvents());
    } else {
      // Add major events that might not be in tables
      events.push(...getAFLMajorEvents2025());
    }
    
    // Sort and limit to upcoming events
    const upcomingEvents = events
      .filter(e => new Date(e.date) >= now)
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .slice(0, 20);
    
    console.log(`Successfully scraped ${upcomingEvents.length} upcoming AFL events`);
    return upcomingEvents;
    
  } catch (error) {
    console.error('Error scraping AFL data:', error.message);
    console.log('Falling back to curated AFL fixtures');
    return getCuratedAFLEvents();
  }
}

/**
 * Parse AFL date formats
 */
function parseAFLDate(dateStr) {
  if (!dateStr) return null;
  
  try {
    // Common AFL Tables formats: "13-Mar-2025", "13 Mar 2025", etc.
    const cleaned = dateStr.replace(/[,]/g, '').trim();
    const date = new Date(cleaned);
    
    if (!isNaN(date.getTime())) {
      return date;
    }
    
    return null;
  } catch (err) {
    return null;
  }
}

/**
 * Get major AFL events for 2025
 */
function getAFLMajorEvents2025() {
  return [
    {
      id: 'afl-anzac-2025',
      title: 'ANZAC Day Match',
      date: '2025-04-25',
      time: '15:20',
      location: 'Melbourne Cricket Ground',
      sport: 'AFL',
      description: 'Collingwood vs Essendon - Traditional ANZAC Day clash',
      source: 'curated'
    },
    {
      id: 'afl-qb-2025',
      title: "King's Birthday Match",
      date: '2025-06-09',
      time: '15:10',
      location: 'Melbourne Cricket Ground',
      sport: 'AFL',
      description: 'Melbourne vs Collingwood - Traditional King\'s Birthday clash',
      source: 'curated'
    },
    {
      id: 'afl-gf-2025',
      title: 'AFL Grand Final',
      date: '2025-09-27',
      time: '14:30',
      location: 'Melbourne Cricket Ground',
      sport: 'AFL',
      description: 'AFL Grand Final 2025 - The Biggest Game in Australian Sport',
      source: 'curated'
    }
  ];
}

/**
 * Get curated AFL events (fallback)
 */
function getCuratedAFLEvents() {
  const now = new Date();
  const events = [
    {
      id: 'afl-r1-2025',
      title: 'AFL Round 1',
      date: '2025-03-13',
      time: '19:20',
      location: 'Melbourne Cricket Ground',
      sport: 'AFL',
      description: 'AFL Season 2025 Opening Round',
      source: 'curated'
    },
    ...getAFLMajorEvents2025(),
    {
      id: 'afl-finals-2025',
      title: 'AFL Finals Week 1',
      date: '2025-09-05',
      time: '19:50',
      location: 'Various Venues',
      sport: 'AFL',
      description: 'AFL Finals Series begins',
      source: 'curated'
    }
  ];
  
  return events.filter(e => new Date(e.date) >= now);
}

module.exports = { scrapeAFLData };
