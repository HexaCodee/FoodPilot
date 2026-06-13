$ErrorActionPreference = 'Continue'

$dbServices = @('mongodb', 'postgresql-x64-17', 'postgresql-x64-16', 'postgresql-x64-15')

foreach ($svc in $dbServices) {
    $service = Get-Service -Name $svc -ErrorAction SilentlyContinue
    if ($null -eq $service) {
        Write-Host "  $svc not installed."
        continue
    }

    if ($service.Status -ne 'Running') {
        Write-Host "  Starting $svc..."
        try {
            Start-Service -Name $svc -ErrorAction Stop
        } catch {
            Write-Warning "  Could not start ${svc}: $($_.Exception.Message)"
        }
    } else {
        Write-Host "  $svc already running."
    }
}
