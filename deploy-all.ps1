# Full Deployment Script (Frontend + Backend) for verifed-est.ee
# Usage: .\deploy-all.ps1

Write-Host "🚀 Starting Full Deployment to verifed-est.ee..." -ForegroundColor Green
Write-Host "=" -repeat 60 -ForegroundColor Gray

# Backend Deployment
Write-Host "`n📦 PART 1: Backend Deployment" -ForegroundColor Magenta
Write-Host "=" -repeat 60 -ForegroundColor Gray

Write-Host "`n📤 Uploading backend code..." -ForegroundColor Cyan
scp -r backend/src backend/package.json backend/tsconfig.json root@kontrollitud.ee:/var/www/mechanic-pro-demo/backend/

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Backend upload failed!" -ForegroundColor Red
    exit 1
}

Write-Host "`n🐳 Rebuilding backend container..." -ForegroundColor Cyan
ssh root@kontrollitud.ee "cd /var/www/mechanic-pro-demo && docker compose down && docker compose up -d --build"

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Backend container rebuild failed!" -ForegroundColor Red
    exit 1
}

Write-Host "`n⏳ Waiting for backend to start..." -ForegroundColor Cyan
Start-Sleep -Seconds 5

# Frontend Deployment
Write-Host "`n📦 PART 2: Frontend Deployment" -ForegroundColor Magenta
Write-Host "=" -repeat 60 -ForegroundColor Gray

Write-Host "`n🔨 Building frontend..." -ForegroundColor Cyan
$env:VITE_API_URL='/api'
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Frontend build failed!" -ForegroundColor Red
    exit 1
}

Write-Host "`n📤 Uploading frontend..." -ForegroundColor Cyan
scp -r dist/* root@kontrollitud.ee:/tmp/frontend-verifed/

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Frontend upload failed!" -ForegroundColor Red
    exit 1
}

Write-Host "`n🐳 Deploying to nginx container..." -ForegroundColor Cyan
ssh root@kontrollitud.ee "docker cp /tmp/frontend-verifed/. proxy_app_1:/var/www/mechanic-pro-demo/frontend/ && rm -rf /tmp/frontend-verifed"

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Frontend deployment failed!" -ForegroundColor Red
    exit 1
}

# Final checks
Write-Host "`n📋 Checking deployment..." -ForegroundColor Magenta
Write-Host "=" -repeat 60 -ForegroundColor Gray

Write-Host "`n🔍 Backend logs:" -ForegroundColor Cyan
ssh root@kontrollitud.ee "docker logs mechanic-pro-demo --tail 5"

Write-Host "`n✅ DEPLOYMENT COMPLETED!" -ForegroundColor Green
Write-Host "=" -repeat 60 -ForegroundColor Gray
Write-Host "`n🌐 URL: https://verifed-est.ee" -ForegroundColor Yellow
Write-Host "🔐 Вход: учётные данные из вашей MongoDB (не храните в репозитории)" -ForegroundColor Yellow
Write-Host "💡 Remember: Ctrl+Shift+R to clear browser cache" -ForegroundColor Yellow
Write-Host ""
