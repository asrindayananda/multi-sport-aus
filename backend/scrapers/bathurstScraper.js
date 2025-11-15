const axios = require('axios');
const cheerio = require('cheerio');

/**
 * Scraper for Bathurst/Supercars data from supercars.com
 * Gets Bathurst race events by scraping live website
 */
async function scrapeBathurstData() {
  try {
    console.log('Scraping Bathurst/Supercars data from supercars.com...');
    
    // Supercars championship website
    const response = await axios.get('https://www.supercars.com/championship/', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-AU,en;q=0.9'
      },
      timeout: 15000
    });
    
    const $ = cheerio.load(response.data);
    const events = [];
    const now = new Date();
    
    let matchesFound = false;
    
    // Try to find Bathurst events from the calendar/schedule
    const eventSelectors = [
      '.event-card',
      '.race-event',
      '[class*="event"]',
      '[class*="race"]',
      '.calendar-event'
    ];
    
    for (const selector of eventSelectors) {
      const eventElements = $(selector);
      
      if (eventElements.length > 0) {
        console.log(`Found ${eventElements.length} events using selector: ${selector}`);
        
        eventElements.each((index, element) => {
          try {
            const $event = $(element);
            const eventText = $event.text().toLowerCase();
            
            // Only interested in Bathurst events
            if (eventText.includes('bathurst')) {
              const eventTitle = $event.find('[class*="title"], [class*="name"], h2, h3').first().text().trim();
              const dateText = $event.find('[class*="date"], time, [datetime]').first().text().trim() || 
                             $event.find('[class*="date"], time, [datetime]').first().attr('datetime');
              const venueText = $event.find('[class*="venue"], [class*="location"]').first().text().trim();
              
              if (eventTitle && dateText) {
                const eventDate = parseBathurstDate(dateText);
                
                if (eventDate && eventDate > now) {
                  matchesFound = true;
                  const eventId = `bath-${eventDate.toISOString().split('T')[0]}-${index}`;
                  
                  events.push({
                    id: eventId,
                    title: eventTitle,
                    date: eventDate.toISOString().split('T')[0],
                    time: '11:00', // Default race start time
                    location: venueText || 'Mount Panorama, Bathurst',
                    sport: 'Bathurst',
                    description: eventTitle,
                    source: 'scraped'
                  });
                }
              }
            }
          } catch (err) {
            // Skip events that can't be parsed
          }
        });
        
        if (matchesFound) break;
      }
    }
    
    // If we didn't find events by scraping, use curated data
    if (!matchesFound || events.length === 0) {
      console.log('Could not scrape Bathurst events, using curated 2025 calendar');
      events.push(...getCuratedBathurstEvents());
    }
    
    // Sort and return upcoming events
    const upcomingEvents = events
      .filter(e => new Date(e.date) >= now)
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .slice(0, 10);
    
    console.log(`Successfully scraped ${upcomingEvents.length} upcoming Bathurst events`);
    return upcomingEvents;
    
  } catch (error) {
    console.error('Error scraping Bathurst data:', error.message);
    console.log('Falling back to curated Bathurst fixtures');
    return getCuratedBathurstEvents();
  }
}

/**
 * Parse Bathurst/Supercars date formats
 */
function parseBathurstDate(dateStr) {
  if (!dateStr) return null;
  
  try {
    // Try ISO format first
    if (dateStr.match(/^\d{4}-\d{2}-\d{2}/)) {
      return new Date(dateStr);
    }
    
    // Try common date formats
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
 * Get curated Bathurst events for 2025 (fallback and supplemental)
 */
function getCuratedBathurstEvents() {
  const now = new Date();
  const events = [
    {
      id: 'bath-12h-2025',
      title: 'Bathurst 12 Hour',
      date: '2025-01-31',
      time: '05:45',
      location: 'Mount Panorama, Bathurst',
      sport: 'Bathurst',
      description: 'Bathurst 12 Hour endurance race - GT cars at Mount Panorama Circuit',
      source: 'curated'
    },
    {
      id: 'bath-6h-2025',
      title: 'Bathurst 6 Hour',
      date: '2025-03-14',
      time: '11:45',
      location: 'Mount Panorama, Bathurst',
      sport: 'Bathurst',
      description: 'Bathurst 6 Hour production car race at Mount Panorama',
      source: 'curated'
    },
    {
      id: 'bath-1000-2025',
      title: 'Bathurst 1000',
      date: '2025-10-09',
      time: '11:00',
      location: 'Mount Panorama, Bathurst',
      sport: 'Bathurst',
      description: 'The Great Race - Bathurst 1000 Supercars Championship at Mount Panorama Circuit',
      source: 'curated'
    }
  ];
  
  return events.filter(e => new Date(e.date) >= now);
}

module.exports = { scrapeBathurstData };
