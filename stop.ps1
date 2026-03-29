# IAM Project Stop Script
# Usage: .\stop.ps1

Write-Host "`n=== Stopping IAM Project ===" -ForegroundColor Cyan

function Stop-PortProcess($port) {
    $procIds = netstat -ano | Select-String ":$port\s.*LISTENING" |
        ForEach-Object { ($_ -split '\s+')[-1] } |
        Sort-Object -Unique
    foreach ($procId in $procIds) {
        if ($procId -and $procId -ne '0') {
            Write-Host "  Killed PID $procId on port $port" -ForegroundColor Yellow
            taskkill /PID $procId /F 2>$null | Out-Null
        }
    }
}

Stop-PortProcess 8000
Stop-PortProcess 3001

Write-Host "`nAll services stopped.`n" -ForegroundColor Green
