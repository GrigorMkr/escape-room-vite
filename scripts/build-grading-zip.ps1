<#
Creates id-grading.zip (no node_modules). Uses CompressionLevel NoCompression ("zip без сжатия").
Set STUDENT_GRADING_ZIP_NAME=12345678-grading.zip before running if the default filename is wrong.
Output folder: parent of the project directory (same level as repo root).
#>
$ErrorActionPreference = 'Stop'

$proj = Split-Path -Parent $PSScriptRoot
$studentIdArchiveName = $env:STUDENT_GRADING_ZIP_NAME
if (-not $studentIdArchiveName) {
  $studentIdArchiveName = '0010203-grading.zip'
}
$outZip = Join-Path (Split-Path -Parent $proj) $studentIdArchiveName

$stagingParent = Join-Path $env:TEMP ('grading-submit-' + [guid]::NewGuid().ToString('N'))
$stagingRoot = Join-Path $stagingParent 'escape-room-vite'
New-Item -ItemType Directory -Force -Path $stagingRoot | Out-Null

robocopy $proj $stagingRoot /E /MT:12 /NFL /NDL /NJH /NJS /NP /XD node_modules dist .git .cursor .vite .turbo coverage playwright-report playwright .husky
$rc = $LASTEXITCODE
if ($rc -ge 8) {
  Remove-Item -LiteralPath $stagingParent -Recurse -Force -ErrorAction SilentlyContinue
  throw "robocopy failed with exit code $rc"
}

if (Test-Path -LiteralPath $outZip) {
  Remove-Item -LiteralPath $outZip -Force
}

Add-Type -AssemblyName System.IO.Compression.FileSystem
[System.IO.Compression.ZipFile]::CreateFromDirectory(
  $stagingParent,
  $outZip,
  [System.IO.Compression.CompressionLevel]::NoCompression,
  $true
)

Remove-Item -LiteralPath $stagingParent -Recurse -Force

$item = Get-Item -LiteralPath $outZip
Write-Host ('Created: ' + $item.FullName)
Write-Host ('Size MB: ' + [math]::Round($item.Length / 1MB, 2))
