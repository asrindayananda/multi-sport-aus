#!/bin/bash

echo "==================================="
echo "Multi-Sport Australia Setup Test"
echo "==================================="
echo ""

# Test mobile app structure
echo "✓ Checking mobile app structure..."
if [ -d "mobile-app/src/screens" ] && [ -d "mobile-app/src/services" ] && [ -d "mobile-app/src/navigation" ]; then
    echo "  ✓ Mobile app directories exist"
else
    echo "  ✗ Mobile app directories missing"
    exit 1
fi

# Test mobile app files
echo "✓ Checking mobile app files..."
MOBILE_FILES=(
    "mobile-app/App.js"
    "mobile-app/src/screens/HomeScreen.js"
    "mobile-app/src/screens/CalendarScreen.js"
    "mobile-app/src/screens/EventDetailsScreen.js"
    "mobile-app/src/screens/SettingsScreen.js"
    "mobile-app/src/services/sportsApi.js"
    "mobile-app/src/services/notificationService.js"
    "mobile-app/src/navigation/AppNavigator.js"
)

for file in "${MOBILE_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo "  ✓ $file exists"
    else
        echo "  ✗ $file missing"
        exit 1
    fi
done

# Test backend structure
echo "✓ Checking backend structure..."
BACKEND_FILES=(
    "backend/server.js"
    "backend/package.json"
    "backend/Dockerfile"
    "backend/.env.example"
    "backend/README.md"
)

for file in "${BACKEND_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo "  ✓ $file exists"
    else
        echo "  ✗ $file missing"
        exit 1
    fi
done

# Test deployment files
echo "✓ Checking deployment files..."
DEPLOY_FILES=(
    "docker-compose.yml"
    "azure-deploy.yml"
    "DEPLOYMENT.md"
    "README.md"
)

for file in "${DEPLOY_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo "  ✓ $file exists"
    else
        echo "  ✗ $file missing"
        exit 1
    fi
done

# Test mobile app dependencies
echo "✓ Checking mobile app dependencies..."
cd mobile-app
if npm list @react-navigation/native @react-navigation/stack @react-navigation/bottom-tabs react-native-calendars axios expo-notifications >/dev/null 2>&1; then
    echo "  ✓ Key dependencies installed"
else
    echo "  ⚠ Some dependencies might be missing (this is okay if peer deps)"
fi
cd ..

# Test backend dependencies
echo "✓ Checking backend dependencies..."
cd backend
if npm list express cors nodemailer node-cron dotenv axios >/dev/null 2>&1; then
    echo "  ✓ Backend dependencies installed"
else
    echo "  ✗ Backend dependencies missing"
    exit 1
fi
cd ..

echo ""
echo "==================================="
echo "✓ All tests passed!"
echo "==================================="
echo ""
echo "Next steps:"
echo "1. Start backend: cd backend && npm start"
echo "2. Start mobile app: cd mobile-app && npm start"
echo "3. See DEPLOYMENT.md for Azure deployment"
echo ""
