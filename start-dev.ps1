$root = Split-Path -Parent $MyInvocation.MyCommand.Path

$services = @(
    @{ title = "AUTH";       dir = "$root\Authentication-service\auth-service\src\AuthService.Api"; cmd = "dotnet watch run" },
    @{ title = "RESTAURANT"; dir = "$root\restaurant-admin";   cmd = "pnpm run dev" },
    @{ title = "ORDERS";     dir = "$root\order-tracking-api"; cmd = "pnpm run dev" },
    @{ title = "EVENTS";     dir = "$root\event-service";      cmd = "pnpm run dev" },
    @{ title = "CLIENT";     dir = "$root\client-admin";       cmd = "pnpm run dev" }
)

foreach ($s in $services) {
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$($s.dir)'; `$host.UI.RawUI.WindowTitle = '$($s.title)'; $($s.cmd)"
    Start-Sleep -Milliseconds 400
}
