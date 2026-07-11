param(
  [string]$WorkerUrl = $env:WORKER_URL,
  [string]$WorkerSecret = $env:WORKER_SECRET
)

$ErrorActionPreference = 'Stop'

Write-Host '== Worker Trigger Health Check ==' -ForegroundColor Cyan

if ([string]::IsNullOrWhiteSpace($WorkerUrl)) {
  Write-Host 'WORKER_URL: MISSING' -ForegroundColor Red
} else {
  Write-Host "WORKER_URL: SET ($WorkerUrl)" -ForegroundColor Green
}

if ([string]::IsNullOrWhiteSpace($WorkerSecret)) {
  Write-Host 'WORKER_SECRET: MISSING' -ForegroundColor Red
} else {
  Write-Host 'WORKER_SECRET: SET' -ForegroundColor Green
}

if ([string]::IsNullOrWhiteSpace($WorkerUrl)) {
  Write-Host 'Cannot continue without WORKER_URL.' -ForegroundColor Yellow
  exit 1
}

try {
  $health = Invoke-RestMethod -Method Get -Uri "$WorkerUrl/health" -TimeoutSec 8
  Write-Host "GET /health: OK (status=$($health.status))" -ForegroundColor Green
} catch {
  Write-Host "GET /health: FAILED ($($_.Exception.Message))" -ForegroundColor Red
  exit 1
}

if ([string]::IsNullOrWhiteSpace($WorkerSecret)) {
  Write-Host 'Skipping trigger test because WORKER_SECRET is missing.' -ForegroundColor Yellow
  exit 1
}

$headers = @{ 'Content-Type' = 'application/json'; 'x-worker-secret' = $WorkerSecret }
$payload = @{ userId = 'health-check-user' } | ConvertTo-Json

try {
  $response = Invoke-WebRequest -Method Post -Uri "$WorkerUrl/trigger-signals" -Headers $headers -Body $payload -TimeoutSec 8 -UseBasicParsing
  if ($response.StatusCode -eq 202) {
    Write-Host 'POST /trigger-signals: OK (202 Accepted)' -ForegroundColor Green
    exit 0
  }

  Write-Host "POST /trigger-signals: Unexpected status ($($response.StatusCode))" -ForegroundColor Yellow
  exit 1
} catch {
  if ($_.Exception.Response -and $_.Exception.Response.StatusCode.value__ -eq 400) {
    Write-Host 'POST /trigger-signals: Endpoint reachable and auth valid (400 due to dummy payload accepted path check).' -ForegroundColor Yellow
    exit 0
  }

  Write-Host "POST /trigger-signals: FAILED ($($_.Exception.Message))" -ForegroundColor Red
  exit 1
}
