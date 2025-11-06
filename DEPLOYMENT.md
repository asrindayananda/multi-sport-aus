# Deployment Guide

## Azure Deployment Instructions

### Prerequisites
- Azure CLI installed
- Docker installed locally
- Azure subscription
- Azure Container Registry (ACR)

### Step 1: Build and Push Docker Image

```bash
# Login to Azure
az login

# Create a resource group
az group create --name multi-sport-rg --location australiaeast

# Create an Azure Container Registry
az acr create --resource-group multi-sport-rg \
  --name multisportacr --sku Basic

# Login to ACR
az acr login --name multisportacr

# Build and tag the Docker image
cd backend
docker build -t multisportacr.azurecr.io/multi-sport-backend:latest .

# Push the image to ACR
docker push multisportacr.azurecr.io/multi-sport-backend:latest
```

### Step 2: Deploy to Azure Container Instances

```bash
# Get ACR credentials
az acr credential show --name multisportacr

# Create container instance
az container create \
  --resource-group multi-sport-rg \
  --name multi-sport-backend \
  --image multisportacr.azurecr.io/multi-sport-backend:latest \
  --dns-name-label multi-sport-aus-backend \
  --ports 3001 \
  --environment-variables \
    PORT=3001 \
    EMAIL_HOST=smtp.gmail.com \
    EMAIL_PORT=587 \
  --secure-environment-variables \
    EMAIL_USER=your-email@gmail.com \
    EMAIL_PASSWORD=your-app-password \
  --registry-login-server multisportacr.azurecr.io \
  --registry-username <ACR_USERNAME> \
  --registry-password <ACR_PASSWORD>
```

### Step 3: Get the Public URL

```bash
# Get the container instance details
az container show \
  --resource-group multi-sport-rg \
  --name multi-sport-backend \
  --query "{FQDN:ipAddress.fqdn,IP:ipAddress.ip}" \
  --output table
```

Your backend will be available at: `http://<FQDN>:3001`

### Step 4: Update Mobile App

Update the `BACKEND_URL` in the mobile app:
- File: `mobile-app/src/services/notificationService.js`
- Change: `const BACKEND_URL = 'http://localhost:3001';`
- To: `const BACKEND_URL = 'http://<YOUR_AZURE_FQDN>:3001';`

### Alternative: Deploy with Docker Compose (Azure Container Instances)

```bash
# Create context for Azure
docker context create aci acicontext

# Use Azure context
docker context use acicontext

# Deploy using docker-compose
docker compose up
```

### Alternative: Deploy to Azure App Service

```bash
# Create an App Service plan
az appservice plan create \
  --name multi-sport-plan \
  --resource-group multi-sport-rg \
  --is-linux \
  --sku B1

# Create a web app
az webapp create \
  --resource-group multi-sport-rg \
  --plan multi-sport-plan \
  --name multi-sport-backend-app \
  --deployment-container-image-name multisportacr.azurecr.io/multi-sport-backend:latest

# Configure container registry credentials
az webapp config container set \
  --name multi-sport-backend-app \
  --resource-group multi-sport-rg \
  --docker-custom-image-name multisportacr.azurecr.io/multi-sport-backend:latest \
  --docker-registry-server-url https://multisportacr.azurecr.io \
  --docker-registry-server-user <ACR_USERNAME> \
  --docker-registry-server-password <ACR_PASSWORD>

# Configure environment variables
az webapp config appsettings set \
  --resource-group multi-sport-rg \
  --name multi-sport-backend-app \
  --settings \
    PORT=3001 \
    EMAIL_HOST=smtp.gmail.com \
    EMAIL_PORT=587 \
    EMAIL_USER=your-email@gmail.com \
    EMAIL_PASSWORD=your-app-password

# Restart the web app
az webapp restart \
  --name multi-sport-backend-app \
  --resource-group multi-sport-rg
```

Your backend will be available at: `https://multi-sport-backend-app.azurewebsites.net`

### Email Configuration

For Gmail:
1. Enable 2-factor authentication
2. Generate an app-specific password at: https://myaccount.google.com/apppasswords
3. Use the app password in EMAIL_PASSWORD environment variable

For other email providers:
- Update EMAIL_HOST and EMAIL_PORT accordingly
- Provide appropriate credentials

### Monitoring

```bash
# View logs
az container logs \
  --resource-group multi-sport-rg \
  --name multi-sport-backend

# Or for App Service
az webapp log tail \
  --name multi-sport-backend-app \
  --resource-group multi-sport-rg
```

### Cleanup

```bash
# Delete all resources
az group delete --name multi-sport-rg --yes
```

## Cost Estimation

- Azure Container Instances: ~$30-50/month (B1 tier)
- Azure Container Registry: ~$5/month (Basic tier)
- Azure App Service: ~$13-55/month (B1 tier)

Choose the deployment option that best fits your needs and budget.
