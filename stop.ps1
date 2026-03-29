# IAM Project Stop Script
# Usage: .\stop.ps1

Write-Host "`n=== Stopping IAM Project ===" -ForegroundColor Cyan

function Stop-PortProcess($port, $serviceName) {
    $procIds = netstat -ano | Select-String ":$port\s.*LISTENING" |
        ForEach-Object { ($_ -split '\s+')[-1] } |
        Sort-Object -Unique
    
    if ($procIds) {
        foreach ($procId in $procIds) {
            if ($procId -and $procId -ne '0') {
                Write-Host "  Stopping $serviceName (PID: $procId on port $port)..." -ForegroundColor Yellow
                taskkill /PID $procId /F 2>$null | Out-Null
                Start-Sleep -Milliseconds 500
            }
        }
        Write-Host "  [OK] $serviceName stopped" -ForegroundColor Green
    } else {
        Write-Host "  [OK] $serviceName not running" -ForegroundColor Gray
    }
}

Write-Host "`n[1/2] Stopping Backend..." -ForegroundColor Cyan
Stop-PortProcess 8000 "Backend"

Write-Host "`n[2/2] Stopping Frontend..." -ForegroundColor Cyan
Stop-PortProcess 3001 "Frontend"

Write-Host "`n[OK] All services stopped.`n" -ForegroundColor Green
