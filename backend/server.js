const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const cron = require('node-cron');
require('dotenv').config();

// Import scrapers
const { scrapeNRLData } = require('./scrapers/nrlScraper');
const { scrapeAFLData } = require('./scrapers/aflScraper');
const { scrapeBathurstData } = require('./scrapers/bathurstScraper');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// In-memory storage (in production, use a database)
const emailReminders = new Map();

// Cache for scraped data (refreshed periodically)
let sportsDataCache = {
  nrl: [],
  afl: [],
  bathurst: [],
  lastUpdated: null
};

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

// Function to refresh sports data from scrapers
async function refreshSportsData() {
  console.log('Refreshing sports data from web scrapers...');
  try {
    const [nrlData, aflData, bathurstData] = await Promise.all([
      scrapeNRLData(),
      scrapeAFLData(),
      scrapeBathurstData()
    ]);
    
    sportsDataCache = {
      nrl: nrlData,
      afl: aflData,
      bathurst: bathurstData,
      lastUpdated: new Date().toISOString()
    };
    
    console.log(`Sports data refreshed: ${nrlData.length} NRL, ${aflData.length} AFL, ${bathurstData.length} Bathurst events`);
  } catch (error) {
    console.error('Error refreshing sports data:', error);
  }
}

// Refresh sports data on startup
refreshSportsData();

// Refresh sports data every 6 hours
cron.schedule('0 */6 * * *', refreshSportsData);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Multi-Sport Australia Backend API' });
});

// Get all sports data
app.get('/api/sports/all', (req, res) => {
  try {
    const allEvents = [
      ...sportsDataCache.nrl,
      ...sportsDataCache.afl,
      ...sportsDataCache.bathurst
    ].sort((a, b) => new Date(a.date) - new Date(b.date));
    
    res.json({
      success: true,
      lastUpdated: sportsDataCache.lastUpdated,
      totalEvents: allEvents.length,
      events: allEvents
    });
  } catch (error) {
    console.error('Error fetching all sports data:', error);
    res.status(500).json({ error: 'Failed to fetch sports data' });
  }
});

// Get NRL data
app.get('/api/sports/nrl', (req, res) => {
  try {
    res.json({
      success: true,
      sport: 'NRL',
      lastUpdated: sportsDataCache.lastUpdated,
      events: sportsDataCache.nrl
    });
  } catch (error) {
    console.error('Error fetching NRL data:', error);
    res.status(500).json({ error: 'Failed to fetch NRL data' });
  }
});

// Get AFL data
app.get('/api/sports/afl', (req, res) => {
  try {
    res.json({
      success: true,
      sport: 'AFL',
      lastUpdated: sportsDataCache.lastUpdated,
      events: sportsDataCache.afl
    });
  } catch (error) {
    console.error('Error fetching AFL data:', error);
    res.status(500).json({ error: 'Failed to fetch AFL data' });
  }
});

// Get Bathurst data
app.get('/api/sports/bathurst', (req, res) => {
  try {
    res.json({
      success: true,
      sport: 'Bathurst',
      lastUpdated: sportsDataCache.lastUpdated,
      events: sportsDataCache.bathurst
    });
  } catch (error) {
    console.error('Error fetching Bathurst data:', error);
    res.status(500).json({ error: 'Failed to fetch Bathurst data' });
  }
});

// Manually trigger data refresh (for testing/admin)
app.post('/api/sports/refresh', async (req, res) => {
  try {
    await refreshSportsData();
    res.json({
      success: true,
      message: 'Sports data refreshed successfully',
      lastUpdated: sportsDataCache.lastUpdated
    });
  } catch (error) {
    console.error('Error refreshing sports data:', error);
    res.status(500).json({ error: 'Failed to refresh sports data' });
  }
});

// Subscribe to email reminder
app.post('/api/reminders/subscribe', (req, res) => {
  try {
    const { email, event } = req.body;

    if (!email || !event) {
      return res.status(400).json({ error: 'Email and event are required' });
    }

    const key = `${email}-${event.id}`;
    emailReminders.set(key, {
      email,
      event,
      subscribed: true,
      createdAt: new Date(),
    });

    console.log(`Subscribed ${email} to ${event.title}`);

    res.json({
      success: true,
      message: 'Successfully subscribed to email reminder',
      reminder: { email, event: event.title },
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

    const key = `${email}-${eventId}`;
    if (emailReminders.has(key)) {
      emailReminders.delete(key);
      console.log(`Unsubscribed ${email} from event ${eventId}`);
      res.json({ success: true, message: 'Successfully unsubscribed from reminder' });
    } else {
      res.status(404).json({ error: 'Reminder not found' });
    }
  } catch (error) {
    console.error('Error unsubscribing from reminder:', error);
    res.status(500).json({ error: 'Failed to unsubscribe from reminder' });
  }
});

// Get all reminders (for debugging)
app.get('/api/reminders', (req, res) => {
  const reminders = Array.from(emailReminders.values());
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
  const now = new Date();
  const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000);

  for (const [key, reminder] of emailReminders.entries()) {
    const eventDate = new Date(`${reminder.event.date}T${reminder.event.time}`);
    
    // Send reminder if event is within the next hour
    if (eventDate > now && eventDate <= oneHourFromNow) {
      await sendEmailReminder(reminder.email, reminder.event);
      // Remove reminder after sending
      emailReminders.delete(key);
    }
    
    // Clean up past events
    if (eventDate < now) {
      emailReminders.delete(key);
    }
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Backend API running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log(`Active reminders: ${emailReminders.size}`);
});

module.exports = app;
