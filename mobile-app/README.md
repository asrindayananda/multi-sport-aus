# Multi-Sport Australia Mobile App

React Native mobile application for tracking Australian sports events.

## Features

- 📅 Calendar view of sports events
- 🔔 Push notifications for upcoming events
- 📧 Email reminders via backend API
- 🏎️ F1, Bathurst, NRL, AFL coverage
- 🔄 Pull-to-refresh data updates
- 📱 Cross-platform (iOS, Android, Web)

## Tech Stack

- React Native 0.81.5
- Expo SDK ~54
- React Navigation v7
- React Native Calendars
- Expo Notifications
- AsyncStorage
- Axios

## Project Structure

```
src/
├── screens/
│   ├── HomeScreen.js           # Main event list
│   ├── CalendarScreen.js       # Calendar view
│   ├── EventDetailsScreen.js   # Event details & reminders
│   └── SettingsScreen.js       # App settings
├── services/
│   ├── sportsApi.js            # Sports data API client
│   └── notificationService.js  # Notification management
├── navigation/
│   └── AppNavigator.js         # Navigation configuration
└── components/
    └── (reusable components)
```

## Setup

### Install Dependencies
```bash
npm install
```

### Start Development Server
```bash
npm start
```

### Run on Device/Emulator
```bash
npm run android  # Android
npm run ios      # iOS (macOS only)
npm run web      # Web browser
```

## Configuration

### Backend URL
Update in `src/services/notificationService.js`:
```javascript
const BACKEND_URL = 'http://your-backend-url:3001';
```

### App Configuration
Edit `app.json` for:
- App name and slug
- Bundle identifier
- Permissions
- Splash screen
- Icons

## Screens

### Home Screen
- Lists upcoming events
- Filter by sport
- Pull-to-refresh
- Tap to view details

### Calendar Screen
- Monthly calendar
- Color-coded events
- Date selection
- Event list

### Event Details Screen
- Full event info
- Push notification toggle
- Email reminder subscription
- Reminder timing

### Settings Screen
- Email configuration
- Backend URL
- Notification permissions
- Clear reminders

## Services

### Sports API Service
Fetches data from:
- Ergast F1 API (real data)
- Mock data for Bathurst, NRL, AFL

Add real APIs by modifying `src/services/sportsApi.js`

### Notification Service
Handles:
- Push notification permissions
- Scheduling local notifications
- Email reminder subscriptions
- User preference storage

## Building

### Development Build
```bash
npx expo prebuild
npm run android
npm run ios
```

### Production Build
```bash
npx expo build:android
npx expo build:ios
```

### EAS Build (Recommended)
```bash
npm install -g eas-cli
eas login
eas build --platform android
eas build --platform ios
```

## Environment Variables

Create `.env` file (optional):
```env
BACKEND_URL=http://localhost:3001
```

## Testing

```bash
npm test
```

## Troubleshooting

### Metro bundler issues
```bash
npm start -- --reset-cache
```

### Node modules issues
```bash
rm -rf node_modules
npm install
```

### iOS build issues
```bash
cd ios && pod install && cd ..
```

### Clear Expo cache
```bash
npx expo start -c
```

## Permissions

### iOS
- Notifications (configured in app.json)

### Android
- Notifications
- Schedule exact alarms

## Dependencies

Key dependencies:
- `expo`: ~54.0.22
- `react-native`: 0.81.5
- `@react-navigation/native`: ^7.1.19
- `react-native-calendars`: ^1.1313.0
- `expo-notifications`: ^0.32.12
- `axios`: ^1.13.2

See `package.json` for complete list.

## Contributing

See [CONTRIBUTING.md](../CONTRIBUTING.md) in the root directory.

## License

ISC - See [LICENSE](../LICENSE) file.
