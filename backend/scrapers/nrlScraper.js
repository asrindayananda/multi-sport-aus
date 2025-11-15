const axios = require('axios');
const cheerio = require('cheerio');

/**
 * Scraper for NRL data from nrl.com
 * Gets upcoming NRL matches and key events by scraping the live website
 */
async function scrapeNRLData() {
  try {
    console.log('Scraping NRL data from nrl.com/draw...');
    
    const response = await axios.get('https://www.nrl.com/draw/', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-AU,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br'
      },
      timeout: 15000
    });
    
    const $ = cheerio.load(response.data);
    const events = [];
    const now = new Date();
    
    // Try to scrape fixtures from the page
    // NRL website uses various selectors - we'll try common patterns
    const fixtureSelectors = [
      '.fixture-list .fixture',
      '.match-item',
      '.game-card',
      '[class*="fixture"]',
      '[class*="match"]'
    ];
    
    let matchesFound = false;
    
    for (const selector of fixtureSelectors) {
      const matches = $(selector);
      
      if (matches.length > 0) {
        console.log(`Found ${matches.length} matches using selector: ${selector}`);
        matchesFound = true;
        
        matches.each((index, element) => {
          try {
            const $match = $(element);
            
            // Extract match details - trying various common patterns
            const teamNames = $match.find('[class*="team"]').map((i, el) => $(el).text().trim()).get();
            const dateText = $match.find('[class*="date"], time, [datetime]').first().text().trim() || 
                           $match.find('[class*="date"], time, [datetime]').first().attr('datetime');
            const timeText = $match.find('[class*="time"]').first().text().trim();
            const venueText = $match.find('[class*="venue"], [class*="location"]').first().text().trim();
            
            // Only add if we have minimum required data
            if (teamNames.length >= 2 && dateText) {
              const matchDate = parseNRLDate(dateText);
              
              if (matchDate && matchDate > now) {
                const eventId = `nrl-${matchDate.toISOString().split('T')[0]}-${index}`;
                const homeTeam = teamNames[0] || 'TBD';
                const awayTeam = teamNames[1] || 'TBD';
                
                events.push({
                  id: eventId,
                  title: `${homeTeam} vs ${awayTeam}`,
                  date: matchDate.toISOString().split('T')[0],
                  time: timeText || '19:30',
                  location: venueText || 'TBD',
                  sport: 'NRL',
                  description: `NRL Match: ${homeTeam} vs ${awayTeam}`,
                  source: 'scraped'
                });
              }
            }
          } catch (err) {
            console.log(`Error parsing match ${index}:`, err.message);
          }
        });
        
        break; // Stop after first successful selector
      }
    }
    
    // If we couldn't scrape matches, add curated key events
    if (events.length === 0) {
      console.log('Could not scrape matches from website, using curated 2025 fixtures');
      events.push(...getCurated2025Fixtures());
    } else {
      // Add major events (State of Origin, Finals) that might not be in regular fixtures
      events.push(...getMajorEvents2025());
    }
    
    // Sort by date and limit to next 20 upcoming events
    const upcomingEvents = events
      .filter(e => new Date(e.date) >= now)
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .slice(0, 20);
    
    console.log(`Successfully scraped ${upcomingEvents.length} upcoming NRL events`);
    return upcomingEvents;
    
  } catch (error) {
    console.error('Error scraping NRL data:', error.message);
    console.log('Falling back to curated 2025 fixtures');
    return getCurated2025Fixtures();
  }
}

/**
 * Parse NRL date formats
 */
function parseNRLDate(dateStr) {
  if (!dateStr) return null;
  
  try {
    // Try ISO format first
    if (dateStr.match(/^\d{4}-\d{2}-\d{2}/)) {
      return new Date(dateStr);
    }
    
    // Try common Australian date formats
    const date = new Date(dateStr);
    if (!isNaN(date.getTime())) {
      return date;
    }
    
    return null;
  } catch (err) {
    return null;
  }
}

/**
 * Get major NRL events for 2025
 */
function getMajorEvents2025() {
  return [
    {
      id: 'nrl-soo-1-2025',
      title: 'State of Origin Game 1',
      date: '2025-06-04',
      time: '20:00',
      location: 'Accor Stadium, Sydney',
      sport: 'NRL',
      description: 'NSW Blues vs Queensland Maroons - State of Origin Game 1',
      source: 'curated'
    },
    {
      id: 'nrl-soo-2-2025',
      title: 'State of Origin Game 2',
      date: '2025-06-22',
      time: '20:00',
      location: 'MCG, Melbourne',
      sport: 'NRL',
      description: 'NSW Blues vs Queensland Maroons - State of Origin Game 2',
      source: 'curated'
    },
    {
      id: 'nrl-soo-3-2025',
      title: 'State of Origin Game 3',
      date: '2025-07-09',
      time: '20:00',
      location: 'Suncorp Stadium, Brisbane',
      sport: 'NRL',
      description: 'NSW Blues vs Queensland Maroons - State of Origin Game 3',
      source: 'curated'
    },
    {
      id: 'nrl-gf-2025',
      title: 'NRL Grand Final 2025',
      date: '2025-09-28',
      time: '19:00',
      location: 'Accor Stadium, Sydney',
      sport: 'NRL',
      description: 'NRL Telstra Premiership Grand Final 2025',
      source: 'curated'
    }
  ];
}

/**
 * Get curated 2025 NRL fixtures (fallback)
 */
function getCurated2025Fixtures() {
  const now = new Date();
  const fixtures = [
    {
      id: 'nrl-r1-2025',
      title: 'NRL Round 1',
      date: '2025-03-06',
      time: '19:50',
      location: 'Various Venues',
      sport: 'NRL',
      description: 'NRL 2025 Season - Round 1 kicks off',
      source: 'curated'
    },
    ...getMajorEvents2025()
  ];
  
  return fixtures.filter(f => new Date(f.date) >= now);
}

module.exports = { scrapeNRLData };
