# Quick Start Guide

Get your Multi-Sport Australia Tracker up and running in minutes!

## Prerequisites

- Node.js 18+ and npm
- Expo Go app on your mobile device (iOS/Android)
- Git

## 1. Clone and Setup

```bash
# Clone the repository
git clone <your-repo-url>
cd multi-sport-aus

# Install mobile app dependencies
cd mobile-app
npm install
cd ..

# Install backend dependencies
cd backend
npm install
cd ..
```

## 2. Configure Backend (Optional for email reminders)

```bash
cd backend
cp .env.example .env
# Edit .env and add your email credentials
cd ..
```

For Gmail:
1. Enable 2-factor authentication
2. Generate app password at: https://myaccount.google.com/apppasswords
3. Add to `.env`:
   ```
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASSWORD=your-app-password
   ```

## 3. Start the Backend

```bash
cd backend
npm start
```

Backend will run at: http://localhost:3001

## 4. Start the Mobile App

In a new terminal:

```bash
cd mobile-app
npm start
```

## 5. Run on Your Device

1. Install **Expo Go** app from App Store or Play Store
2. Scan the QR code displayed in terminal with:
   - **iOS**: Camera app
   - **Android**: Expo Go app
3. The app will load on your device!

## Features to Try

### 📱 Home Screen
- View upcoming sports events
- Filter by sport (F1, Bathurst, NRL, AFL)
- Pull down to refresh
- Tap event to see details

### 📅 Calendar
- View events on calendar
- Color-coded by sport
- Tap date to see events

### 🔔 Event Details
- Toggle push notifications
- Subscribe to email reminders
- Set reminder timing

### ⚙️ Settings
- Configure email
- Manage notifications
- Clear all reminders

## Using with Emulator

### iOS Simulator (macOS only)
```bash
cd mobile-app
npm run ios
```

### Android Emulator
```bash
cd mobile-app
npm run android
```

### Web Browser
```bash
cd mobile-app
npm run web
```

## Testing Email Reminders

1. Start the backend
2. In mobile app, go to Settings
3. Enter your email address
4. Go to an event
5. Toggle "Email Reminder"
6. Backend will send email 1 hour before event

## Building for Production

### Android
```bash
cd mobile-app
npx expo build:android
```

### iOS
```bash
cd mobile-app
npx expo build:ios
```

## Docker Deployment (Local)

```bash
# Build and run backend
docker-compose up -d

# Check logs
docker-compose logs -f

# Stop
docker-compose down
```

## Common Issues

### Push notifications not working?
- Grant notification permissions when prompted
- Check Settings > Notifications on your device

### Email reminders not working?
- Ensure backend is running
- Check email configuration in backend/.env
- Review backend logs for errors

### API data not loading?
- Check internet connection
- Pull down to refresh

## Next Steps

- See [README.md](README.md) for detailed documentation
- See [DEPLOYMENT.md](DEPLOYMENT.md) for Azure deployment
- Customize sports data in `mobile-app/src/services/sportsApi.js`

## Support

Having issues? Check the README or open an issue on GitHub.

---

Happy tracking! 🏎️🏉🏈
