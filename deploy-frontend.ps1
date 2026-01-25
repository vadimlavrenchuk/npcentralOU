# Frontend Deployment Script for verifed-est.ee
# Usage: .\deploy-frontend.ps1

Write-Host "🚀 Starting Frontend Deployment to verifed-est.ee..." -ForegroundColor Green

# Step 1: Build with production config
Write-Host "`n📦 Building frontend..." -ForegroundColor Cyan
$env:VITE_API_URL='/api'
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build failed!" -ForegroundColor Red
    exit 1
}

# Step 2: Upload to server
Write-Host "`n📤 Uploading to server..." -ForegroundColor Cyan
scp -r dist/* root@kontrollitud.ee:/tmp/frontend-verifed/

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Upload failed!" -ForegroundColor Red
    exit 1
}

# Step 3: Deploy to nginx container
Write-Host "`n🐳 Deploying to nginx container..." -ForegroundColor Cyan
ssh root@kontrollitud.ee "docker cp /tmp/frontend-verifed/. proxy_app_1:/var/www/mechanic-pro-demo/frontend/ && rm -rf /tmp/frontend-verifed"

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Deployment failed!" -ForegroundColor Red
    exit 1
}

Write-Host "`n✅ Frontend deployed successfully to https://verifed-est.ee" -ForegroundColor Green
Write-Host "💡 Clear browser cache (Ctrl+Shift+R) to see changes" -ForegroundColor Yellow
