param([ValidateSet('start','restart','stop','status')][string]$Action='start')
$ErrorActionPreference='Stop'
$projectDirectory=Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$nodeExecutable='C:\Users\zheng_jie\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe'

function Get-SmartWikiProcess {
  $listenerLine=netstat -ano -p TCP | Select-String '^\s*TCP\s+\S+:3000\s+\S+\s+LISTENING\s+(\d+)\s*$' | Select-Object -First 1
  if($listenerLine -and $listenerLine.Matches.Count){
    $listenerPid=[int]$listenerLine.Matches[0].Groups[1].Value
    $process=Get-Process -Id $listenerPid -ErrorAction SilentlyContinue
    if($process -and $process.ProcessName -eq 'node'){return $process}
  }
  return $null
}

function Stop-SmartWiki {
  $process=Get-SmartWikiProcess
  if($process){Stop-Process -Id $process.Id -Force -ErrorAction Stop}
}

function Start-SmartWiki {
  $existing=Get-SmartWikiProcess
  if($existing){return $existing.Id}
  if(-not (Test-Path -LiteralPath $nodeExecutable)){throw 'The bundled Node.js runtime was not found.'}
  $process=Start-Process -FilePath $nodeExecutable -ArgumentList 'server.mjs' -WorkingDirectory $projectDirectory -WindowStyle Hidden -PassThru
  for($attempt=0;$attempt -lt 20;$attempt++){Start-Sleep -Milliseconds 200;$running=Get-SmartWikiProcess;if($running){return $running.Id}}
  throw 'Smart Wiki failed to start.'
}

switch($Action){
  'start'   { Start-SmartWiki | Out-Null }
  'restart' { Stop-SmartWiki; Start-Sleep -Milliseconds 500; Start-SmartWiki | Out-Null }
  'stop'    { Stop-SmartWiki }
  'status'  { $process=Get-SmartWikiProcess; if($process){"running:$($process.Id)"}else{'stopped'} }
}
