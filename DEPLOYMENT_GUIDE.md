# Deployment Guide

> ⚠️ **Note:** Full deployment configuration with server details is in `DEPLOYMENT.local` (not in Git for security reasons)

## Overview

This project uses Docker containers for backend and nginx for frontend hosting.

## Structure

```
Production Environment
├── Frontend: Static files served by nginx
├── Backend: Node.js API in Docker container
└── Database: MongoDB Atlas (cloud)
```

## Prerequisites

- SSH access to production server
- Docker and Docker Compose on server
- Build tools (Node.js, npm) on local machine

## Deployment Process

### Frontend

1. Build production bundle:
```bash
npm run build
```

2. Upload to server:
```bash
scp -r dist/* [user]@[server]:/tmp/frontend-temp/
```

3. Deploy to nginx:
```bash
ssh [user]@[server] "cp -r /tmp/frontend-temp/* [frontend-path]/"
```

### Backend

1. Upload backend code:
```bash
scp -r backend/src backend/package.json backend/tsconfig.json [user]@[server]:[backend-path]/
```

2. Rebuild and restart container:
```bash
ssh [user]@[server] "cd [project-path] && docker compose up -d --build"
```

## Environment Variables

Create `.env` file in backend directory:

```env
# MongoDB
MONGODB_URI=mongodb+srv://username:your_password_here@cluster.mongodb.net/dbname

# Server
PORT=5000
NODE_ENV=production

# CORS
CORS_ORIGIN=https://your-domain.com

# JWT
JWT_SECRET=your_jwt_secret_here

# Firebase (for frontend)
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
```

## Health Checks

```bash
# Backend health
curl https://[your-domain]/health

# View logs
docker logs [container-name] --tail 50
```

## Troubleshooting

### Backend not starting
- Check logs: `docker logs [container-name]`
- Verify .env variables
- Check MongoDB connection

### Frontend shows old version
- Hard refresh: Ctrl+Shift+R
- Clear browser cache
- Check file timestamps on server

### CORS errors
- Verify CORS_ORIGIN in backend .env
- Check nginx configuration

## Rollback

To rollback to previous version:
1. Restore backup of frontend/backend
2. Or deploy from previous Git commit

## Security Notes

- Never commit `.env` files
- Never commit `DEPLOYMENT.local` 
- Keep SSH keys secure
- Use strong passwords for admin access
- Regularly update dependencies

## For Detailed Instructions

See `DEPLOYMENT.local` file on your local machine (not in Git).
This file contains:
- Exact server addresses
- SSH commands
- Container names
- Directory paths
- Admin credentials

---

**Remember:** Production deployment requires proper access rights and should be done carefully!
