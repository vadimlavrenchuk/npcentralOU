# Full deploy: backend + frontend for verifed-est.ee (MechanicPro only)
# Usage: .\deploy-all.ps1

$sep = '=' * 60
Write-Host "Full deployment to verifed-est.ee..." -ForegroundColor Green
Write-Host $sep

# --- Backend ---
Write-Host "`n[1/2] Backend: upload..." -ForegroundColor Cyan
scp -r backend/src backend/package.json backend/tsconfig.json root@kontrollitud.ee:/var/www/mechanic-pro-demo/backend/
if ($LASTEXITCODE -ne 0) { Write-Host "Backend SCP failed." -ForegroundColor Red; exit 1 }

Write-Host "Backend: docker compose rebuild on server..." -ForegroundColor Cyan
ssh root@kontrollitud.ee 'cd /var/www/mechanic-pro-demo && docker compose down && docker compose up -d --build'
if ($LASTEXITCODE -ne 0) { Write-Host "Backend docker failed." -ForegroundColor Red; exit 1 }

Start-Sleep -Seconds 5

# --- Frontend ---
Write-Host "`n[2/2] Frontend: npm run build..." -ForegroundColor Cyan
$env:VITE_API_URL = '/api'
npm run build
if ($LASTEXITCODE -ne 0) { Write-Host "Frontend build failed." -ForegroundColor Red; exit 1 }

Write-Host "Frontend: upload to server..." -ForegroundColor Cyan
scp -r dist/* root@kontrollitud.ee:/tmp/frontend-verifed/
if ($LASTEXITCODE -ne 0) { Write-Host "Frontend SCP failed." -ForegroundColor Red; exit 1 }

Write-Host "Frontend: rsync to host /var/www (proxy_app_1 mounts /var/www read-only)..." -ForegroundColor Cyan
ssh root@kontrollitud.ee 'rsync -a --delete /tmp/frontend-verifed/ /var/www/mechanic-pro-demo/frontend/ && rm -rf /tmp/frontend-verifed'
if ($LASTEXITCODE -ne 0) { Write-Host "Frontend rsync failed." -ForegroundColor Red; exit 1 }

Write-Host "`nBackend logs (last 8):" -ForegroundColor Cyan
ssh root@kontrollitud.ee "docker logs mechanic-pro-demo --tail 8"

Write-Host "`nDone: https://verifed-est.ee (Ctrl+Shift+R if cached)" -ForegroundColor Green
