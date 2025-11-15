# Multi-Sport Australia Tracker

A React Native mobile application for tracking Australian sports events including Formula 1, Bathurst, NRL, and AFL. Features calendar integration, push notifications, and email reminders powered by a backend API that can be deployed to Azure.

## Features

- 📱 **Cross-platform Mobile App** - Built with React Native CLI (no Expo dependency)
- 🏎️ **Multiple Sports Coverage** - F1, Bathurst 1000, NRL, AFL
- 📅 **Calendar View** - Visual calendar with event markers
- 🔔 **Push Notifications** - Local notifications for upcoming events
- 📧 **Email Reminders** - Backend API for email notifications
- 🌐 **Live Web Scraping** - Automatically scrapes sports data from official websites
- 💾 **Database Storage** - SQLite database stores scraped data
- 🔄 **Weekly Auto-Refresh** - Data refreshed every Sunday at 2:00 AM
- ☁️ **Azure Ready** - Docker container ready for Azure deployment

## Web Scraping & Data

The backend automatically scrapes live sports data from official Australian sports websites:

- **NRL**: nrl.com/draw - Season fixtures, State of Origin, Grand Final
- **AFL**: afltables.com - Season fixtures, major events (ANZAC Day, Grand Final)
- **Bathurst**: supercars.com - Bathurst 12 Hour, 1000, 6 Hour races

**Data Refresh**: Automatic weekly refresh every Sunday at 2:00 AM (configurable)

**Database**: All scraped data is stored in a SQLite database (`sports.db`) for persistent storage and faster access. Email reminder subscriptions are also stored in the database.

**Fallback**: If web scraping fails, the app falls back to curated 2025 calendar data to ensure uninterrupted service.

## Important Notes

**API Status**: The Ergast F1 API has shut down. The app now uses curated 2025 calendar data based on the official F1 schedule. For live API integration, consider:
- [OpenF1 API](https://openf1.org/) - Real-time telemetry and session data
- [RapidAPI Formula 1](https://rapidapi.com/api-sports/api/api-formula-1) - Comprehensive F1 data (requires API key)

The app structure supports easy integration with these or other APIs.

## Project Structure

```
multi-sport-aus/
├── mobile-app/          # React Native mobile application
│   ├── src/
│   │   ├── screens/     # Screen components
│   │   ├── services/    # API and notification services
│   │   ├── navigation/  # Navigation configuration
│   │   └── components/  # Reusable components
│   ├── App.js
│   └── package.json
│
├── backend/             # Node.js Express backend API
│   ├── server.js        # Main server file
│   ├── Dockerfile       # Docker configuration
│   └── package.json
│
├── docker-compose.yml   # Docker Compose configuration
├── azure-deploy.yml     # Azure deployment configuration
└── DEPLOYMENT.md        # Detailed deployment instructions
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- React Native development environment ([Setup Guide](https://reactnative.dev/docs/environment-setup))
  - For iOS: Xcode (macOS only)
  - For Android: Android Studio and SDK
- Docker (for backend deployment)
- Azure CLI (for Azure deployment)

### Mobile App Setup

1. Navigate to the mobile app directory:
```bash
cd mobile-app
```

2. Install dependencies:
```bash
npm install
```

3. For iOS (macOS only), install pods:
```bash
cd ios && pod install && cd ..
```

4. Start Metro bundler:
```bash
npm start
```

5. Run on your device (in a new terminal):
```bash
# Android
npm run android

# iOS (macOS only)
npm run ios
```

**Note**: This app uses React Native CLI, not Expo. You'll need to set up your development environment according to the [React Native environment setup guide](https://reactnative.dev/docs/environment-setup).

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file from the example:
```bash
cp .env.example .env
```

4. Configure your email settings in `.env`:
```env
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
```

5. Start the backend server:
```bash
npm start
```

The backend API will be available at `http://localhost:3001`

### Docker Deployment

1. Build and run with Docker Compose:
```bash
docker-compose up -d
```

2. Check the logs:
```bash
docker-compose logs -f
```

3. Stop the services:
```bash
docker-compose down
```

## Sports Data Sources

**Web Scraping Implemented!** The backend now includes web scrapers that fetch data from official sports websites.

The app uses:
- **F1**: Curated 2025 calendar data based on official F1 schedule
- **NRL**: **Web scraper** from nrl.com/draw (State of Origin, Grand Final, key matches)
- **AFL**: **Web scraper** from afltables.com (Round 1, ANZAC Day, Grand Final, etc.)
- **Bathurst**: **Web scraper** from supercars.com (12 Hour, 1000, 6 Hour races)

### How Web Scraping Works

The backend API automatically scrapes sports websites:
- **On startup**: Immediate data fetch
- **Every 6 hours**: Automatic refresh via cron job
- **Fallback data**: Uses curated calendars if scraping fails
- **API endpoints**: 
  - `GET /api/sports/nrl` - NRL events
  - `GET /api/sports/afl` - AFL events
  - `GET /api/sports/bathurst` - Bathurst events
  - `GET /api/sports/all` - All sports combined

See [WEB_SCRAPING.md](WEB_SCRAPING.md) for implementation details.

### Alternative Live APIs

For F1 and other integrations:

**F1 Data:**
- **[OpenF1 API](https://openf1.org/)** - Free, real-time telemetry and session data
- **[RapidAPI Formula 1](https://rapidapi.com/api-sports/api/api-formula-1)** - Comprehensive data (requires API key)

**Paid Sports Data Services:**
- **SportsData.io** - Comprehensive sports data APIs
- **The Odds API** - Sports odds and scores

Update scraper logic in `backend/scrapers/` to enhance data collection.

## Features Overview

### Home Screen
- List of upcoming sports events
- Filter by sport type (All, F1, Bathurst, NRL, AFL)
- Pull-to-refresh functionality
- Tap event to view details

### Calendar Screen
- Monthly calendar view
- Color-coded event markers
- Select date to view events
- Legend showing sport colors

### Event Details Screen
- Full event information
- Push notification toggle
- Email reminder subscription
- Customizable reminder timing

### Settings Screen
- Email configuration
- Backend URL configuration
- Notification permissions
- Clear all reminders

## API Endpoints

### Backend API

- `GET /health` - Health check endpoint
- `POST /api/reminders/subscribe` - Subscribe to email reminder
- `POST /api/reminders/unsubscribe` - Unsubscribe from email reminder
- `GET /api/reminders` - Get all reminders (debugging)

## Azure Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed instructions on deploying to Azure.

Quick deployment:
```bash
# Build and push Docker image
az acr build --registry multisportacr --image multi-sport-backend:latest ./backend

# Deploy to Azure Container Instances
az container create \
  --resource-group multi-sport-rg \
  --name multi-sport-backend \
  --image multisportacr.azurecr.io/multi-sport-backend:latest \
  --dns-name-label multi-sport-aus-backend \
  --ports 3001
```

## Configuration

### Mobile App Configuration

Update backend URL in `mobile-app/src/services/notificationService.js`:
```javascript
const BACKEND_URL = 'http://your-azure-url:3001';
```

### Email Configuration

The backend uses Nodemailer for sending emails. Configure your email provider in the `.env` file:

For Gmail:
1. Enable 2-factor authentication
2. Generate an app-specific password
3. Use the app password in `EMAIL_PASSWORD`

For other providers, update `EMAIL_HOST` and `EMAIL_PORT` accordingly.

## Development

### Running Tests
```bash
# Mobile app
cd mobile-app
npm test

# Backend
cd backend
npm test
```

### Building for Production

#### Mobile App (iOS)
```bash
cd mobile-app
npx expo build:ios
```

#### Mobile App (Android)
```bash
cd mobile-app
npx expo build:android
```

## Troubleshooting

### Notifications not working
- Ensure notification permissions are granted
- Check that the event date is in the future
- Verify reminder is scheduled in Settings

### Email reminders not working
- Verify backend is running and accessible
- Check email configuration in `.env`
- Ensure email provider allows app passwords
- Check backend logs for errors

### API data not loading
- Check internet connection
- Verify API endpoints are accessible
- Check console logs for errors
- Try refreshing the data

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

ISC

## Support

For issues and questions, please open an issue on GitHub.