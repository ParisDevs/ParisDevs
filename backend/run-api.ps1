$ErrorActionPreference = 'Stop'
$env:Path = "C:\Windows\System32;C:\Windows\System32\WindowsPowerShell\v1.0;" + $env:Path
Set-Location $PSScriptRoot
& "$PSScriptRoot\mvnw.cmd" spring-boot:run @args
