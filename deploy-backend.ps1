# Backend Deployment for verifed-est.ee only (MechanicPro)
# Usage: .\deploy-backend.ps1

Write-Host "Starting backend deploy to verifed-est.ee server..." -ForegroundColor Green

Write-Host "Uploading backend..." -ForegroundColor Cyan
scp -r backend/src backend/package.json backend/tsconfig.json root@kontrollitud.ee:/var/www/mechanic-pro-demo/backend/
if ($LASTEXITCODE -ne 0) {
    Write-Host "SCP failed." -ForegroundColor Red
    exit 1
}

Write-Host "Rebuilding container on server (bash)..." -ForegroundColor Cyan
ssh root@kontrollitud.ee 'cd /var/www/mechanic-pro-demo && docker compose down && docker compose up -d --build'
if ($LASTEXITCODE -ne 0) {
    Write-Host "Docker compose failed on server." -ForegroundColor Red
    exit 1
}

Start-Sleep -Seconds 5
Write-Host "Recent logs:" -ForegroundColor Cyan
ssh root@kontrollitud.ee "docker logs mechanic-pro-demo --tail 15"

Write-Host "Done. Health: https://verifed-est.ee/health" -ForegroundColor Green
