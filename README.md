# Multi-Sport Australia Tracker

A React Native mobile application for tracking Australian sports events including Formula 1, Bathurst, NRL, and AFL. Features calendar integration, push notifications, and email reminders powered by a backend API that can be deployed to Azure.

## Features

- 📱 **Cross-platform Mobile App** - Built with React Native and Expo
- 🏎️ **Multiple Sports Coverage** - F1, Bathurst 1000, NRL, AFL
- 📅 **Calendar View** - Visual calendar with event markers
- 🔔 **Push Notifications** - Local notifications for upcoming events
- 📧 **Email Reminders** - Backend API for email notifications
- 🌐 **Live Data** - Integrates with real sports APIs (F1 Ergast API)
- ☁️ **Azure Ready** - Docker container ready for Azure deployment

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
- Expo CLI (`npm install -g expo-cli`)
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

3. Start the development server:
```bash
npm start
# or
npx expo start
```

4. Run on your device:
   - Scan the QR code with Expo Go app (iOS/Android)
   - Press `a` for Android emulator
   - Press `i` for iOS simulator (macOS only)
   - Press `w` for web browser

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

The app currently uses:
- **F1**: [Ergast F1 API](http://ergast.com/mrd/) - Real-time Formula 1 race data
- **Bathurst, NRL, AFL**: Mock data (can be replaced with real APIs)

### Integrating Real Sports APIs

To use real data for other sports, you can integrate with:
- **NRL**: [NRL API](https://www.nrl.com/draw/) or sports data providers
- **AFL**: [AFL API](https://www.afl.com.au/fixture) or sports data providers
- **Bathurst**: Supercars API or similar motorsport data sources

Update the API calls in `mobile-app/src/services/sportsApi.js`

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