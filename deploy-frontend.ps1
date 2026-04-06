# Frontend only for verifed-est.ee
# Usage: .\deploy-frontend.ps1

Write-Host "Frontend deploy to verifed-est.ee..." -ForegroundColor Green

Write-Host "npm run build (VITE_API_URL=/api)..." -ForegroundColor Cyan
$env:VITE_API_URL = '/api'
npm run build
if ($LASTEXITCODE -ne 0) { Write-Host "Build failed." -ForegroundColor Red; exit 1 }

Write-Host "Upload..." -ForegroundColor Cyan
scp -r dist/* root@kontrollitud.ee:/tmp/frontend-verifed/
if ($LASTEXITCODE -ne 0) { Write-Host "SCP failed." -ForegroundColor Red; exit 1 }

Write-Host "docker cp to proxy_app_1..." -ForegroundColor Cyan
ssh root@kontrollitud.ee 'docker cp /tmp/frontend-verifed/. proxy_app_1:/var/www/mechanic-pro-demo/frontend/ && rm -rf /tmp/frontend-verifed'
if ($LASTEXITCODE -ne 0) { Write-Host "docker cp failed." -ForegroundColor Red; exit 1 }

Write-Host "Done: https://verifed-est.ee" -ForegroundColor Green
