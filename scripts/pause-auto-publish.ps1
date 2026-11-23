param([switch]$Resume)
$ErrorActionPreference = 'Stop'
$tcmState = Join-Path (Split-Path -Parent $PSScriptRoot) '.local-deploy'
New-Item -ItemType Directory -Force -Path $tcmState | Out-Null
$tcmPauseFile = Join-Path $tcmState 'paused'
if ($Resume) {
    Remove-Item -LiteralPath $tcmPauseFile -Force -ErrorAction SilentlyContinue
    Write-Output 'Automatic publishing resumed.'
} else {
    Set-Content -LiteralPath $tcmPauseFile -Value 'Paused by local operator'
    Write-Output 'Automatic publishing paused. Run this script with -Resume to continue.'
}
