const Database = require('better-sqlite3');
const path = require('path');

// Initialize SQLite database
const dbPath = process.env.DATABASE_PATH || path.join(__dirname, 'sports.db');
const db = new Database(dbPath);

// Enable WAL mode for better concurrent access
db.pragma('journal_mode = WAL');

// Create tables
function initializeDatabase() {
  // Sports events table
  db.exec(`
    CREATE TABLE IF NOT EXISTS sports_events (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      date TEXT NOT NULL,
      time TEXT NOT NULL,
      location TEXT NOT NULL,
      sport TEXT NOT NULL,
      description TEXT,
      source TEXT DEFAULT 'scraped',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Email reminders table
  db.exec(`
    CREATE TABLE IF NOT EXISTS email_reminders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL,
      event_id TEXT NOT NULL,
      subscribed INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (event_id) REFERENCES sports_events(id),
      UNIQUE(email, event_id)
    )
  `);

  // Scraper metadata table
  db.exec(`
    CREATE TABLE IF NOT EXISTS scraper_metadata (
      sport TEXT PRIMARY KEY,
      last_scraped DATETIME,
      last_success DATETIME,
      error_count INTEGER DEFAULT 0,
      last_error TEXT
    )
  `);

  console.log('Database initialized successfully');
}

// Sports Events CRUD operations
const SportsEvents = {
  // Insert or update event
  upsert: (event) => {
    const stmt = db.prepare(`
      INSERT INTO sports_events (id, title, date, time, location, sport, description, source, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(id) DO UPDATE SET
        title = excluded.title,
        date = excluded.date,
        time = excluded.time,
        location = excluded.location,
        sport = excluded.sport,
        description = excluded.description,
        source = excluded.source,
        updated_at = CURRENT_TIMESTAMP
    `);
    return stmt.run(
      event.id,
      event.title,
      event.date,
      event.time,
      event.location,
      event.sport,
      event.description || '',
      event.source || 'scraped'
    );
  },

  // Insert multiple events in a transaction
  upsertMany: (events) => {
    const upsertTransaction = db.transaction((eventsArray) => {
      for (const event of eventsArray) {
        SportsEvents.upsert(event);
      }
    });
    return upsertTransaction(events);
  },

  // Get all events
  getAll: () => {
    const stmt = db.prepare('SELECT * FROM sports_events ORDER BY date ASC, time ASC');
    return stmt.all();
  },

  // Get events by sport
  getBySport: (sport) => {
    const stmt = db.prepare('SELECT * FROM sports_events WHERE sport = ? ORDER BY date ASC, time ASC');
    return stmt.all(sport);
  },

  // Get upcoming events
  getUpcoming: () => {
    const now = new Date().toISOString().split('T')[0];
    const stmt = db.prepare('SELECT * FROM sports_events WHERE date >= ? ORDER BY date ASC, time ASC');
    return stmt.all(now);
  },

  // Delete events by sport (for refresh)
  deleteBySport: (sport) => {
    const stmt = db.prepare('DELETE FROM sports_events WHERE sport = ?');
    return stmt.run(sport);
  },

  // Get event by ID
  getById: (id) => {
    const stmt = db.prepare('SELECT * FROM sports_events WHERE id = ?');
    return stmt.get(id);
  }
};

// Email Reminders CRUD operations
const EmailReminders = {
  // Subscribe to event
  subscribe: (email, eventId) => {
    const stmt = db.prepare(`
      INSERT INTO email_reminders (email, event_id, subscribed)
      VALUES (?, ?, 1)
      ON CONFLICT(email, event_id) DO UPDATE SET subscribed = 1
    `);
    return stmt.run(email, eventId);
  },

  // Unsubscribe from event
  unsubscribe: (email, eventId) => {
    const stmt = db.prepare(`
      UPDATE email_reminders 
      SET subscribed = 0 
      WHERE email = ? AND event_id = ?
    `);
    return stmt.run(email, eventId);
  },

  // Get all active reminders
  getActive: () => {
    const stmt = db.prepare(`
      SELECT r.*, e.title, e.date, e.time, e.location, e.sport, e.description
      FROM email_reminders r
      JOIN sports_events e ON r.event_id = e.id
      WHERE r.subscribed = 1
      ORDER BY e.date ASC, e.time ASC
    `);
    return stmt.all();
  },

  // Get upcoming reminders (within specified hours)
  getUpcoming: (hours = 1) => {
    const now = new Date();
    const futureTime = new Date(now.getTime() + hours * 60 * 60 * 1000);
    
    const stmt = db.prepare(`
      SELECT r.*, e.*
      FROM email_reminders r
      JOIN sports_events e ON r.event_id = e.id
      WHERE r.subscribed = 1
        AND datetime(e.date || ' ' || e.time) > datetime('now')
        AND datetime(e.date || ' ' || e.time) <= datetime('now', '+' || ? || ' hours')
    `);
    return stmt.all(hours);
  },

  // Delete reminder
  delete: (email, eventId) => {
    const stmt = db.prepare('DELETE FROM email_reminders WHERE email = ? AND event_id = ?');
    return stmt.run(email, eventId);
  },

  // Clean up old reminders (past events)
  cleanup: () => {
    const stmt = db.prepare(`
      DELETE FROM email_reminders
      WHERE event_id IN (
        SELECT id FROM sports_events
        WHERE date < date('now')
      )
    `);
    return stmt.run();
  }
};

// Scraper Metadata operations
const ScraperMetadata = {
  // Update scraper metadata
  update: (sport, success, error = null) => {
    const stmt = db.prepare(`
      INSERT INTO scraper_metadata (sport, last_scraped, last_success, error_count, last_error)
      VALUES (?, datetime('now'), ?, 0, ?)
      ON CONFLICT(sport) DO UPDATE SET
        last_scraped = datetime('now'),
        last_success = CASE WHEN ? THEN datetime('now') ELSE last_success END,
        error_count = CASE WHEN ? THEN 0 ELSE error_count + 1 END,
        last_error = ?
    `);
    const lastSuccess = success ? 1 : 0;
    return stmt.run(sport, lastSuccess ? new Date().toISOString() : null, error, lastSuccess, lastSuccess, error);
  },

  // Get metadata for a sport
  get: (sport) => {
    const stmt = db.prepare('SELECT * FROM scraper_metadata WHERE sport = ?');
    return stmt.get(sport);
  },

  // Get all metadata
  getAll: () => {
    const stmt = db.prepare('SELECT * FROM scraper_metadata');
    return stmt.all();
  }
};

// Initialize database on module load
initializeDatabase();

module.exports = {
  db,
  SportsEvents,
  EmailReminders,
  ScraperMetadata
};
