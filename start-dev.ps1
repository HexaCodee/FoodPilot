$root = Split-Path -Parent $MyInvocation.MyCommand.Path

# ── 1. Start databases (requires admin rights) ────────────────────────────────
Write-Host "`n[DB] Starting databases..." -ForegroundColor Cyan

$dbServices = @("mongodb", "postgresql-x64-17", "postgresql-x64-16", "postgresql-x64-15")
foreach ($svc in $dbServices) {
    $s = Get-Service -Name $svc -ErrorAction SilentlyContinue
    if ($s) {
        if ($s.Status -ne 'Running') {
            Write-Host "  Starting $svc..." -ForegroundColor Yellow
            Start-Service $svc -ErrorAction SilentlyContinue
            Start-Sleep -Seconds 2
        } else {
            Write-Host "  $svc already running." -ForegroundColor Green
        }
    }
}

Start-Sleep -Seconds 2

# ── 2. Start application services ────────────────────────────────────────────
$services = @(
    @{ title = "AUTH";       dir = "$root\Authentication-service\auth-service\src\AuthService.Api"; cmd = "dotnet watch run" },
    @{ title = "RESTAURANT"; dir = "$root\restaurant-admin";   cmd = "pnpm run dev" },
    @{ title = "ORDERS";     dir = "$root\order-tracking-api"; cmd = "pnpm run dev" },
    @{ title = "EVENTS";     dir = "$root\event-service";      cmd = "pnpm run dev" },
    @{ title = "CLIENT";     dir = "$root\client-admin";       cmd = "pnpm run dev" },
    @{ title = "MOBILE";     dir = "$root\client-mobile";      cmd = "npx expo start" }
)

Write-Host "[SERVICES] Opening terminals..." -ForegroundColor Cyan
foreach ($s in $services) {
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$($s.dir)'; `$host.UI.RawUI.WindowTitle = '$($s.title)'; $($s.cmd)"
    Start-Sleep -Milliseconds 400
}

Write-Host "`n[OK] All services launched." -ForegroundColor Green
