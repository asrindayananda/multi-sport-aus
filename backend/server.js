const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const cron = require('node-cron');
require('dotenv').config();

// Import database
const { SportsEvents, EmailReminders, ScraperMetadata } = require('./database');

// Import scrapers
const { scrapeNRLData } = require('./scrapers/nrlScraper');
const { scrapeAFLData } = require('./scrapers/aflScraper');
const { scrapeBathurstData } = require('./scrapers/bathurstScraper');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Email transporter configuration
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: process.env.EMAIL_PORT || 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// Verify email configuration
transporter.verify((error, success) => {
  if (error) {
    console.log('Email configuration error:', error);
    console.log('Email reminders will not work. Please configure EMAIL_USER and EMAIL_PASSWORD in .env');
  } else {
    console.log('Email server is ready to send messages');
  }
});

// Function to refresh sports data from scrapers and store in database
async function refreshSportsData(sportFilter = null) {
  console.log('Refreshing sports data from web scrapers...');
  
  const sportsToRefresh = sportFilter ? [sportFilter] : ['nrl', 'afl', 'bathurst'];
  
  for (const sport of sportsToRefresh) {
    try {
      console.log(`Scraping ${sport.toUpperCase()} data...`);
      let events = [];
      
      switch (sport) {
        case 'nrl':
          events = await scrapeNRLData();
          break;
        case 'afl':
          events = await scrapeAFLData();
          break;
        case 'bathurst':
          events = await scrapeBathurstData();
          break;
      }
      
      if (events && events.length > 0) {
        // Store events in database
        SportsEvents.upsertMany(events);
        ScraperMetadata.update(sport, true, null);
        console.log(`✓ Successfully stored ${events.length} ${sport.toUpperCase()} events in database`);
      } else {
        console.log(`! No events returned for ${sport.toUpperCase()}`);
        ScraperMetadata.update(sport, false, 'No events returned from scraper');
      }
    } catch (error) {
      console.error(`✗ Error refreshing ${sport.toUpperCase()} data:`, error.message);
      ScraperMetadata.update(sport, false, error.message);
    }
  }
  
  console.log('Sports data refresh complete');
}

// Refresh sports data on startup
console.log('Initial data refresh on startup...');
refreshSportsData().catch(err => console.error('Startup refresh error:', err));

// Refresh sports data weekly (every Sunday at 2:00 AM)
// Cron format: minute hour day-of-month month day-of-week
cron.schedule('0 2 * * 0', () => {
  console.log('Running weekly scheduled data refresh...');
  refreshSportsData();
});

console.log('Scheduled weekly data refresh: Every Sunday at 2:00 AM');

// Health check endpoint
app.get('/health', (req, res) => {
  const scraperStatus = ScraperMetadata.getAll();
  res.json({ 
    status: 'ok', 
    message: 'Multi-Sport Australia Backend API',
    database: 'connected',
    scrapers: scraperStatus
  });
});

// Get all sports data from database
app.get('/api/sports/all', (req, res) => {
  try {
    const allEvents = SportsEvents.getAll();
    const metadata = ScraperMetadata.getAll();
    
    res.json({
      success: true,
      totalEvents: allEvents.length,
      events: allEvents,
      scraperMetadata: metadata
    });
  } catch (error) {
    console.error('Error fetching all sports data:', error);
    res.status(500).json({ error: 'Failed to fetch sports data' });
  }
});

// Get NRL data from database
app.get('/api/sports/nrl', (req, res) => {
  try {
    const events = SportsEvents.getBySport('NRL');
    const metadata = ScraperMetadata.get('nrl');
    
    res.json({
      success: true,
      sport: 'NRL',
      events,
      scraperMetadata: metadata
    });
  } catch (error) {
    console.error('Error fetching NRL data:', error);
    res.status(500).json({ error: 'Failed to fetch NRL data' });
  }
});

// Get AFL data from database
app.get('/api/sports/afl', (req, res) => {
  try {
    const events = SportsEvents.getBySport('AFL');
    const metadata = ScraperMetadata.get('afl');
    
    res.json({
      success: true,
      sport: 'AFL',
      events,
      scraperMetadata: metadata
    });
  } catch (error) {
    console.error('Error fetching AFL data:', error);
    res.status(500).json({ error: 'Failed to fetch AFL data' });
  }
});

// Get Bathurst data from database
app.get('/api/sports/bathurst', (req, res) => {
  try {
    const events = SportsEvents.getBySport('Bathurst');
    const metadata = ScraperMetadata.get('bathurst');
    
    res.json({
      success: true,
      sport: 'Bathurst',
      events,
      scraperMetadata: metadata
    });
  } catch (error) {
    console.error('Error fetching Bathurst data:', error);
    res.status(500).json({ error: 'Failed to fetch Bathurst data' });
  }
});

// Manually trigger data refresh (for testing/admin)
app.post('/api/sports/refresh', async (req, res) => {
  try {
    const { sport } = req.body; // Optional: refresh specific sport
    await refreshSportsData(sport);
    
    const allEvents = SportsEvents.getAll();
    const metadata = ScraperMetadata.getAll();
    
    res.json({
      success: true,
      message: sport ? `${sport.toUpperCase()} data refreshed successfully` : 'All sports data refreshed successfully',
      totalEvents: allEvents.length,
      scraperMetadata: metadata
    });
  } catch (error) {
    console.error('Error refreshing sports data:', error);
    res.status(500).json({ error: 'Failed to refresh sports data' });
  }
});

// Subscribe to email reminder - now stored in database
app.post('/api/reminders/subscribe', (req, res) => {
  try {
    const { email, event } = req.body;

    if (!email || !event) {
      return res.status(400).json({ error: 'Email and event are required' });
    }

    // Verify event exists
    const eventData = SportsEvents.getById(event.id);
    if (!eventData) {
      return res.status(404).json({ error: 'Event not found' });
    }

    EmailReminders.subscribe(email, event.id);
    console.log(`Subscribed ${email} to ${eventData.title}`);

    res.json({
      success: true,
      message: 'Successfully subscribed to email reminder',
      reminder: { email, event: eventData.title },
    });
  } catch (error) {
    console.error('Error subscribing to reminder:', error);
    res.status(500).json({ error: 'Failed to subscribe to reminder' });
  }
});

// Unsubscribe from email reminder
app.post('/api/reminders/unsubscribe', (req, res) => {
  try {
    const { email, eventId } = req.body;

    if (!email || !eventId) {
      return res.status(400).json({ error: 'Email and eventId are required' });
    }

    EmailReminders.unsubscribe(email, eventId);
    console.log(`Unsubscribed ${email} from event ${eventId}`);
    res.json({ success: true, message: 'Successfully unsubscribed from reminder' });
  } catch (error) {
    console.error('Error unsubscribing from reminder:', error);
    res.status(500).json({ error: 'Failed to unsubscribe from reminder' });
  }
});

// Get all reminders (for debugging)
app.get('/api/reminders', (req, res) => {
  const reminders = EmailReminders.getActive();
  res.json({ count: reminders.length, reminders });
});

// Send email reminder
async function sendEmailReminder(email, event) {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: `Reminder: ${event.sport} - ${event.title}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #007AFF;">Upcoming Event Reminder</h2>
          <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px;">
            <h3 style="color: #333; margin-top: 0;">${event.title}</h3>
            <p><strong>Sport:</strong> ${event.sport}</p>
            <p><strong>Date:</strong> ${new Date(event.date).toLocaleDateString('en-AU', {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
              year: 'numeric'
            })}</p>
            <p><strong>Time:</strong> ${event.time}</p>
            <p><strong>Location:</strong> ${event.location}</p>
            <p><strong>Description:</strong> ${event.description}</p>
          </div>
          <p style="color: #666; font-size: 12px; margin-top: 20px;">
            This is an automated reminder from Multi-Sport Australia Tracker.
          </p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Email sent to ${email} for ${event.title}`);
  } catch (error) {
    console.error(`Error sending email to ${email}:`, error);
  }
}

// Cron job to check and send reminders (runs every hour)
cron.schedule('0 * * * *', async () => {
  console.log('Checking for upcoming events...');
  
  try {
    const upcomingReminders = EmailReminders.getUpcoming(1); // Next 1 hour
    
    for (const reminder of upcomingReminders) {
      await sendEmailReminder(reminder.email, reminder);
      // Remove reminder after sending
      EmailReminders.delete(reminder.email, reminder.event_id);
    }
    
    // Clean up old reminders
    EmailReminders.cleanup();
  } catch (error) {
    console.error('Error in reminder cron job:', error);
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Backend API running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log(`Database: SQLite (sports.db)`);
  console.log(`Refresh schedule: Weekly (Sunday 2:00 AM)`);
});

module.exports = app;
