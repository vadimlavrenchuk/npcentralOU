# MechanicPro Deployment Guide

## Deployment Architecture

- **Domain**: verifed-est.ee
- **Server**: kontrollitud.ee
- **Deploy Path**: /var/www/mechanic-pro-demo
- **External Port**: 5005 → Internal Port 5000
- **Database**: MongoDB on 172.17.0.1:27017

## Manual Deployment

### 1. Build and Deploy via Docker Compose

```bash
cd /var/www/mechanic-pro-demo
docker compose down
docker compose up -d --build
```

### 2. Check Status

```bash
# Check container status
docker ps | grep mechanic

# Check logs
docker logs mechanic-pro-demo --tail 50

# Test health endpoint
curl http://localhost:5005/health
```

## GitHub Actions Deployment

### Required Secrets

Add these secrets in your GitHub repository Settings → Secrets and variables → Actions:

- `SSH_HOST` = kontrollitud.ee
- `SSH_USERNAME` = root
- `SSH_PRIVATE_KEY` = Your SSH private key
- `SSH_PORT` = 22 (optional, defaults to 22)
- `MONGO_URI` = mongodb://172.17.0.1:27017/mechanic_db
- `CORS_ORIGIN` = https://verifed-est.ee

### Automatic Deployment

Deployment happens automatically on push to `main` branch or can be triggered manually via:
- GitHub Actions → Deploy MechanicPro Demo → Run workflow

## Environment Variables

The following environment variables are configured in `.env`:

```bash
NODE_ENV=production
PORT=5000
MONGO_URI=mongodb://172.17.0.1:27017/mechanic_db
CORS_ORIGIN=https://verifed-est.ee
```

## Nginx Proxy Manager Configuration

Configure a new proxy host in Nginx Proxy Manager:

- **Domain**: verifed-est.ee
- **Forward Hostname/IP**: localhost (or server IP)
- **Forward Port**: 5005
- **Block Common Exploits**: ✓
- **Websockets Support**: ✓
- **SSL**: Let's Encrypt certificate

## Troubleshooting

### Container Restarts

```bash
# Check logs for errors
docker logs mechanic-pro-demo

# Check MongoDB connection
docker exec mechanic-pro-demo env | grep MONGO
```

### Port Already in Use

```bash
# Find process using port 5005
netstat -tulpn | grep 5005

# Stop old container
docker stop mechanic-pro-demo && docker rm mechanic-pro-demo
```

### Build Failures

```bash
# Clean Docker cache
docker system prune -a

# Rebuild from scratch
docker compose build --no-cache
docker compose up -d
```

## Monitoring

- **Health Check**: `curl http://localhost:5005/health`
- **Container Stats**: `docker stats mechanic-pro-demo`
- **Container Logs**: `docker logs -f mechanic-pro-demo`
