# Multi-Sport Australia Backend API

Backend service for managing email reminders for sports events.

## Features

- RESTful API for managing event reminders
- Email notifications using Nodemailer
- Automated cron job for sending scheduled reminders
- Docker support for easy deployment
- Azure-ready configuration

## API Documentation

### Health Check

Check if the API is running.

**Endpoint:** `GET /health`

**Response:**
```json
{
  "status": "ok",
  "message": "Multi-Sport Australia Backend API"
}
```

### Subscribe to Email Reminder

Subscribe a user to receive email reminders for a specific event.

**Endpoint:** `POST /api/reminders/subscribe`

**Request Body:**
```json
{
  "email": "user@example.com",
  "event": {
    "id": "f1-1",
    "title": "Australian Grand Prix",
    "date": "2024-03-24",
    "time": "15:00",
    "location": "Melbourne, Australia",
    "sport": "F1",
    "description": "Formula 1 Australian Grand Prix"
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Successfully subscribed to email reminder",
  "reminder": {
    "email": "user@example.com",
    "event": "Australian Grand Prix"
  }
}
```

### Unsubscribe from Email Reminder

Unsubscribe from email reminders for a specific event.

**Endpoint:** `POST /api/reminders/unsubscribe`

**Request Body:**
```json
{
  "email": "user@example.com",
  "eventId": "f1-1"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Successfully unsubscribed from reminder"
}
```

### Get All Reminders (Debug)

Get a list of all active reminders.

**Endpoint:** `GET /api/reminders`

**Response:**
```json
{
  "count": 2,
  "reminders": [
    {
      "email": "user@example.com",
      "event": {
        "id": "f1-1",
        "title": "Australian Grand Prix",
        "date": "2024-03-24",
        "time": "15:00"
      },
      "subscribed": true,
      "createdAt": "2024-01-15T10:30:00.000Z"
    }
  ]
}
```

## Email Configuration

### Gmail Setup

1. Enable 2-factor authentication on your Google account
2. Go to https://myaccount.google.com/apppasswords
3. Generate an app-specific password
4. Use these settings in your `.env` file:

```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
```

### Other Email Providers

#### Outlook/Office 365
```env
EMAIL_HOST=smtp.office365.com
EMAIL_PORT=587
EMAIL_USER=your-email@outlook.com
EMAIL_PASSWORD=your-password
```

#### SendGrid
```env
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_USER=apikey
EMAIL_PASSWORD=your-sendgrid-api-key
```

#### AWS SES
```env
EMAIL_HOST=email-smtp.us-east-1.amazonaws.com
EMAIL_PORT=587
EMAIL_USER=your-aws-smtp-username
EMAIL_PASSWORD=your-aws-smtp-password
```

## Scheduled Tasks

The backend runs a cron job every hour to check for upcoming events and send email reminders.

**Schedule:** Every hour at minute 0 (`0 * * * *`)

**Process:**
1. Check all subscribed reminders
2. Send emails for events starting within the next hour
3. Remove sent reminders
4. Clean up past events

## Development

### Install Dependencies
```bash
npm install
```

### Run Locally
```bash
npm start
```

### Run with Hot Reload
```bash
npm run dev  # requires nodemon
```

### Environment Variables
Copy `.env.example` to `.env` and configure your settings.

## Docker Deployment

### Build Image
```bash
docker build -t multi-sport-backend .
```

### Run Container
```bash
docker run -p 3001:3001 \
  -e EMAIL_USER=your-email@gmail.com \
  -e EMAIL_PASSWORD=your-password \
  multi-sport-backend
```

### Using Docker Compose
```bash
docker-compose up -d
```

## Production Considerations

### Security
- Use environment variables for sensitive data
- Enable HTTPS in production
- Implement rate limiting
- Add authentication/authorization if needed

### Database
The current implementation uses in-memory storage. For production:
- Migrate to a persistent database (PostgreSQL, MongoDB, etc.)
- Implement proper data models
- Add database migrations

### Scaling
- Use a message queue (Redis, RabbitMQ) for email processing
- Implement horizontal scaling with load balancer
- Use a dedicated email service (SendGrid, AWS SES)

### Monitoring
- Add logging (Winston, Pino)
- Implement error tracking (Sentry)
- Set up health checks
- Monitor email delivery rates

## Testing

```bash
npm test
```

## License

ISC
