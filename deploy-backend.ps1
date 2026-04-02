# Backend Deployment Script for verifed-est.ee
# Usage: .\deploy-backend.ps1

Write-Host "🚀 Starting Backend Deployment to verifed-est.ee..." -ForegroundColor Green

# Step 1: Upload backend code
Write-Host "`n📤 Uploading backend code..." -ForegroundColor Cyan
scp -r backend/src backend/package.json backend/tsconfig.json root@kontrollitud.ee:/var/www/mechanic-pro-demo/backend/

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Upload failed!" -ForegroundColor Red
    exit 1
}

# Step 2: Rebuild and restart container
Write-Host "`n🐳 Rebuilding Docker container..." -ForegroundColor Cyan
ssh root@kontrollitud.ee "cd /var/www/mechanic-pro-demo && docker compose down && docker compose up -d --build"

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Container rebuild failed!" -ForegroundColor Red
    exit 1
}

# Step 3: Wait for container to start
Write-Host "`n⏳ Waiting for backend to start..." -ForegroundColor Cyan
Start-Sleep -Seconds 5

# Step 4: Check logs
Write-Host "`n📋 Checking backend logs..." -ForegroundColor Cyan
ssh root@kontrollitud.ee "docker logs mechanic-pro-demo --tail 10"

Write-Host "`n✅ Backend deployed successfully!" -ForegroundColor Green
Write-Host "🔗 Test at: https://verifed-est.ee/health" -ForegroundColor Yellow
