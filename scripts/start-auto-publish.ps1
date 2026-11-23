$ErrorActionPreference = 'Stop'
$tcmRoot = Split-Path -Parent $PSScriptRoot
Set-Location -LiteralPath $tcmRoot
$tcmState = Join-Path $tcmRoot '.local-deploy'
New-Item -ItemType Directory -Force -Path $tcmState | Out-Null
$tcmNode = (Get-Command node -ErrorAction Stop).Source
& $tcmNode (Join-Path $PSScriptRoot 'auto-publish.cjs') *>> (Join-Path $tcmState 'publisher.log')
exit $LASTEXITCODE
