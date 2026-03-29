# IAM Project Startup Script
# Usage: Run from project root directory:  .\start.ps1

Write-Host "`n=== IAM Project Startup ===" -ForegroundColor Cyan

# --- Kill any existing processes on required ports ---
function Stop-PortProcess($port) {
    $procIds = netstat -ano | Select-String ":$port\s.*LISTENING" |
        ForEach-Object { ($_ -split '\s+')[-1] } |
        Sort-Object -Unique
    foreach ($procId in $procIds) {
        if ($procId -and $procId -ne '0') {
            Write-Host "  Killing PID $procId on port $port" -ForegroundColor Yellow
            taskkill /PID $procId /F 2>$null | Out-Null
        }
    }
}

Write-Host "`n[1/4] Freeing ports..." -ForegroundColor Green
Stop-PortProcess 8000
Stop-PortProcess 3001
Start-Sleep -Seconds 1

# --- Start Backend ---
Write-Host "[2/4] Starting Backend (http://localhost:8000)..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "& '$PSScriptRoot\.venv\Scripts\Activate.ps1'; Set-Location '$PSScriptRoot\backend'; python main.py" -PassThru

Start-Sleep -Seconds 3

# --- Start Frontend ---
Write-Host "[3/4] Starting Frontend (http://localhost:3001)..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\frontend'; npm run dev" -PassThru

Start-Sleep -Seconds 3

# --- Done ---
Write-Host "`n[4/4] All services started!" -ForegroundColor Green
Write-Host @"

  Backend  -> http://localhost:8000  (API docs: http://localhost:8000/docs)
  Frontend -> http://localhost:3001

  To stop: Run .\stop.ps1
  
  Or close the PowerShell windows manually (Ctrl+C in each window)

"@ -ForegroundColor Cyan
