Write-Host "Starting PayZenix Payroll Application..." -ForegroundColor Cyan
Write-Host "----------------------------------------" -ForegroundColor Gray

# 1. Start Backend
Write-Host "Launching Backend Server..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd server; npm run dev"

# 2. Wait a bit for backend to initialize
Write-Host "Waiting for backend to initialize..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# 3. Start Frontend
Write-Host "Launching Frontend Application..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm run dev"

Write-Host "----------------------------------------" -ForegroundColor Gray
Write-Host "Both servers should be running in new windows." -ForegroundColor White
Write-Host "Please check the backend window for 'Server running on port 3001'" -ForegroundColor White
Write-Host "Please check the frontend window for 'http://localhost:8080'" -ForegroundColor White
Write-Host "Press any key to exit this launcher..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
