# Assemble PRIME27 en un seul fichier (dist\prime27.html) pour la publication en artifact.
# Usage : powershell -ExecutionPolicy Bypass -File tools\build.ps1
$root = Split-Path -Parent $PSScriptRoot
$utf8 = New-Object System.Text.UTF8Encoding $false
function Get-Text([string]$rel) { return [IO.File]::ReadAllText((Join-Path $root $rel), $utf8) }

$parts = @(
  '<title>PRIME27</title>',
  '<meta name="claude:viewport-fit-sides" content="cover">',
  '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Big+Shoulders+Display:wght@700;800;900&family=Instrument+Sans:wght@400;500;600;700&display=swap">',
  '<style>', (Get-Text 'css\app.css'), '</style>',
  '<div id="app"></div>'
)
foreach ($js in @('js\figure.js', 'js\exercises.js', 'js\programs.js', 'js\app.js')) {
  $parts += '<script>'
  $parts += (Get-Text $js)
  $parts += '</script>'
}
$dist = Join-Path $root 'dist'
if (-not (Test-Path $dist)) { New-Item -ItemType Directory -Path $dist | Out-Null }
$out = Join-Path $dist 'prime27.html'
[IO.File]::WriteAllText($out, ($parts -join "`n"), $utf8)
Write-Host ("OK : " + $out + " (" + [math]::Round((Get-Item $out).Length / 1024) + " Ko)")
