# Multi-Sport Australia Tracker

A React Native mobile application for tracking Australian sports events including Formula 1, Bathurst, NRL, and AFL. Features calendar integration, push notifications, and email reminders powered by a backend API that can be deployed to Azure.

## Features

- 📱 **Cross-platform Mobile App** - Built with React Native CLI (no Expo dependency)
- 🏎️ **Multiple Sports Coverage** - F1, Bathurst 1000, NRL, AFL
- 📅 **Calendar View** - Visual calendar with event markers
- 🔔 **Push Notifications** - Local notifications for upcoming events
- 📧 **Email Reminders** - Backend API for email notifications
- 🌐 **2025 Sports Data** - Curated event schedules based on official calendars
- ☁️ **Azure Ready** - Docker container ready for Azure deployment

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

**Important Update**: The Ergast F1 API shut down in 2024. The app now uses curated 2025 calendar data.

The app currently uses:
- **F1**: Curated 2025 calendar data based on official F1 schedule
- **Bathurst**: 2025 event data (Bathurst 12 Hour, Bathurst 1000)
- **NRL**: 2025 season data including State of Origin and Grand Final
- **AFL**: 2025 season data including key matches and Grand Final

### Integrating Live Sports APIs

For live, real-time data integration, consider these options:

**F1 Data:**
- **[OpenF1 API](https://openf1.org/)** - Free, real-time telemetry and session data
- **[Jolpi Ergast Mirror](https://documenter.getpostman.com/view/11586746/SztEa7bL)** - Community-maintained Ergast clone (may be temporary)
- **[RapidAPI Formula 1](https://rapidapi.com/api-sports/api/api-formula-1)** - Comprehensive data (requires API key)

**Other Sports:**
- **NRL**: [NRL Official API](https://www.nrl.com/draw/) or sports data providers like SportsData.io
- **AFL**: [AFL Official API](https://www.afl.com.au/fixture) or AFL Tables  
- **Bathurst**: Supercars official API or motorsport data sources

Update the API calls in `mobile-app/src/services/sportsApi.ts` to integrate with these APIs.

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