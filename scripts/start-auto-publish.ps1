$ErrorActionPreference = 'Stop'
$tcmRoot = Split-Path -Parent $PSScriptRoot
Set-Location -LiteralPath $tcmRoot
$tcmState = Join-Path $tcmRoot '.local-deploy'
New-Item -ItemType Directory -Force -Path $tcmState | Out-Null
$tcmNode = (Get-Command node -ErrorAction Stop).Source
$tcmPublisher = '"' + (Join-Path $PSScriptRoot 'auto-publish.cjs') + '"'
$tcmProcess = Start-Process -FilePath $tcmNode -ArgumentList $tcmPublisher -WorkingDirectory $tcmRoot -WindowStyle Hidden -RedirectStandardOutput (Join-Path $tcmState 'publisher.log') -RedirectStandardError (Join-Path $tcmState 'publisher-error.log') -PassThru
$tcmHandle = $tcmProcess.Handle
$tcmProcess.WaitForExit()
$tcmProcess.Refresh()
exit $tcmProcess.ExitCode
