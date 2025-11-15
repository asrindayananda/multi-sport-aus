# Architecture Overview

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Mobile Application                       │
│                    (React Native + Expo)                     │
├─────────────────────────────────────────────────────────────┤
│  ┌────────────┐  ┌────────────┐  ┌────────────┐            │
│  │   Home     │  │  Calendar  │  │  Settings  │            │
│  │   Screen   │  │   Screen   │  │   Screen   │            │
│  └─────┬──────┘  └─────┬──────┘  └─────┬──────┘            │
│        │                │                │                   │
│        └────────────────┴────────────────┘                   │
│                         │                                    │
│        ┌────────────────┴────────────────┐                  │
│        │                                  │                  │
│  ┌─────▼──────┐                  ┌───────▼────────┐         │
│  │  Sports    │                  │  Notification  │         │
│  │  API       │                  │  Service       │         │
│  │  Service   │                  │                │         │
│  └─────┬──────┘                  └───────┬────────┘         │
│        │                                  │                  │
└────────┼──────────────────────────────────┼──────────────────┘
         │                                  │
         │ HTTP                             │ Local Push
         │                                  │ Email via API
         │                                  │
         ▼                                  ▼
┌─────────────────────┐         ┌──────────────────────┐
│   External APIs     │         │   Backend API        │
│  - Ergast F1 API    │         │  (Node.js/Express)   │
│  - Sports Data APIs │         │                      │
└─────────────────────┘         │  ┌────────────────┐  │
                                │  │ Email Service  │  │
                                │  │  (Nodemailer)  │  │
                                │  └────────────────┘  │
                                │                      │
                                │  ┌────────────────┐  │
                                │  │  Cron Jobs     │  │
                                │  │  (node-cron)   │  │
                                │  └────────────────┘  │
                                │                      │
                                │  ┌────────────────┐  │
                                │  │ In-Memory DB   │  │
                                │  │    (Map)       │  │
                                │  └────────────────┘  │
                                └──────────────────────┘
                                         │
                                         │ Docker
                                         ▼
                                ┌────────────────────┐
                                │  Azure Container   │
                                │    Instances       │
                                └────────────────────┘
```

## Component Details

### Mobile Application

#### Technology Stack
- **Framework**: React Native 0.81.5
- **Runtime**: Expo SDK ~54
- **Navigation**: React Navigation v7
- **State Management**: React Hooks (useState, useEffect)
- **Storage**: AsyncStorage
- **Notifications**: Expo Notifications
- **HTTP Client**: Axios

#### Screen Components

1. **HomeScreen**
   - Lists upcoming sports events
   - Sports filter (All, F1, Bathurst, NRL, AFL)
   - Pull-to-refresh
   - Navigation to event details

2. **CalendarScreen**
   - Monthly calendar view using react-native-calendars
   - Color-coded event markers
   - Date selection
   - Event list for selected date

3. **EventDetailsScreen**
   - Full event information
   - Push notification toggle
   - Email reminder subscription
   - Reminder timing configuration

4. **SettingsScreen**
   - Email configuration
   - Backend URL configuration
   - Notification permissions
   - Clear all reminders

#### Services

1. **sportsApi.js**
   - Fetches F1 data from Ergast API
   - Provides mock data for Bathurst, NRL, AFL
   - Aggregates all sports schedules
   - Error handling and fallbacks

2. **notificationService.js**
   - Manages local push notifications
   - Handles notification permissions
   - Schedules/cancels notifications
   - Integrates with backend for email reminders
   - Stores user preferences in AsyncStorage

### Backend API

#### Technology Stack
- **Runtime**: Node.js 20
- **Framework**: Express 5
- **Email**: Nodemailer
- **Scheduler**: node-cron
- **CORS**: cors middleware
- **Environment**: dotenv

#### API Endpoints

1. **GET /health**
   - Health check endpoint
   - Returns API status

2. **POST /api/reminders/subscribe**
   - Subscribe to email reminders
   - Stores reminder in memory
   - Validates email and event data

3. **POST /api/reminders/unsubscribe**
   - Unsubscribe from email reminders
   - Removes reminder from storage

4. **GET /api/reminders**
   - Lists all active reminders
   - Debug/admin endpoint

#### Background Jobs

- **Cron Schedule**: Every hour (0 * * * *)
- **Function**: Check for upcoming events within next hour
- **Action**: Send email reminders
- **Cleanup**: Remove sent reminders and past events

### Data Flow

#### Event Loading Flow
```
User opens app
  ↓
HomeScreen mounted
  ↓
Call sportsApi.getAllSchedules()
  ↓
Fetch F1 data from Ergast API
Fetch mock data for other sports
  ↓
Aggregate and sort by date
  ↓
Display in UI
```

#### Push Notification Flow
```
User enables reminder on event
  ↓
Request notification permissions
  ↓
Calculate reminder time (event time - X minutes)
  ↓
Schedule local notification
  ↓
Store notification ID in AsyncStorage
  ↓
At scheduled time: Display notification
```

#### Email Reminder Flow
```
User subscribes to email reminder
  ↓
POST to /api/reminders/subscribe
  ↓
Store in backend Map (email, event, timestamp)
  ↓
Cron job runs every hour
  ↓
Check if event is within next hour
  ↓
Send email via Nodemailer
  ↓
Remove reminder from Map
```

## Deployment Architecture

### Local Development
```
Mobile App (Expo Dev Client)
  ↓ localhost:3001
Backend (Node.js)
```

### Production (Azure)
```
Mobile App (Standalone Build)
  ↓ HTTPS
Backend in Azure Container Instances
  ↓ SMTP
Email Service (Gmail/SendGrid/etc)
```

### Docker Container
```
Dockerfile
  ↓
Docker Image
  ↓
Azure Container Registry
  ↓
Azure Container Instances
```

## Data Storage

### Mobile App
- **AsyncStorage**: User preferences, scheduled notification IDs
- **In-Memory**: Fetched sports events (refreshed on app launch)

### Backend
- **In-Memory Map**: Active email reminders
- **Future**: PostgreSQL/MongoDB for persistence

## Security Considerations

### Mobile App
- No sensitive data stored
- Local notifications only
- HTTPS for API calls (production)

### Backend
- Environment variables for secrets
- CORS protection
- Email credentials secured
- Input validation
- Rate limiting (future enhancement)

## Scalability Considerations

### Current Limitations
- In-memory storage (not persistent)
- Single instance backend
- No caching
- No database

### Future Improvements
1. **Database**: Add PostgreSQL/MongoDB
2. **Queue**: Use Redis/RabbitMQ for email processing
3. **Caching**: Add Redis for API responses
4. **Load Balancer**: Multiple backend instances
5. **CDN**: Static asset delivery
6. **Authentication**: User accounts and JWT
7. **Analytics**: Track usage patterns
8. **Monitoring**: Application insights

## API Integration Points

### Current
- **F1**: Ergast API (http://ergast.com/mrd/)
- **Others**: Mock data

### Future Integration Options
- **NRL**: Official NRL API or SportsData.io
- **AFL**: Official AFL API or similar
- **Bathurst**: Supercars API
- **Weather**: OpenWeatherMap for event day weather
- **News**: RSS feeds for sports news

## Testing Strategy

### Mobile App
- Component testing with Jest
- E2E testing with Detox
- Manual testing on devices

### Backend
- Unit tests with Jest
- Integration tests for API endpoints
- Load testing with Artillery

## Monitoring & Logging

### Current
- Console logs
- Express default logging

### Recommended (Production)
- **Application Monitoring**: Azure Application Insights
- **Error Tracking**: Sentry
- **Logging**: Winston/Pino
- **Metrics**: Prometheus + Grafana
- **Alerting**: Azure Alerts or PagerDuty

## Performance Optimization

### Mobile App
- Lazy loading for screens
- Memoization for expensive calculations
- Image optimization
- List virtualization

### Backend
- Connection pooling
- Request caching
- Gzip compression
- Database indexing (when added)

## Disaster Recovery

### Backup Strategy
- Database backups (when implemented)
- Container image versioning
- Configuration backups

### Recovery Plan
1. Restore from latest container image
2. Restore database from backup
3. Update DNS if needed
4. Verify functionality

## Compliance

- GDPR: Email storage and opt-out
- Privacy: No personal data collection beyond email
- Terms: User agreement for notifications

## Development Workflow

```
Feature Branch
  ↓
Local Development
  ↓
Testing
  ↓
Code Review
  ↓
Main Branch
  ↓
CI/CD Pipeline
  ↓
Docker Build
  ↓
Push to ACR
  ↓
Deploy to Azure
  ↓
Production
```
