# Renders the 1080x1080 social images in public/brand from the site icon's
# blue and "P" (src/app/icon.svg). Uses Inter if installed, else Segoe UI.
#   powershell -ExecutionPolicy Bypass -File scripts/make-brand-images.ps1
Add-Type -AssemblyName System.Drawing

$out = Join-Path $PSScriptRoot '..\public\brand'
New-Item -ItemType Directory -Force $out | Out-Null

$blue = [System.Drawing.Color]::FromArgb(255, 0x18, 0x5F, 0xA5)
$ink  = [System.Drawing.Color]::FromArgb(255, 0x1F, 0x29, 0x37)

$families = (New-Object System.Drawing.Text.InstalledFontCollection).Families | ForEach-Object { $_.Name }
$fontName = if ($families -contains 'Inter') { 'Inter' } elseif ($families -contains 'Segoe UI') { 'Segoe UI' } else { 'Arial' }
Write-Output "Font: $fontName"
$family = New-Object System.Drawing.FontFamily($fontName)

function New-Canvas($w, $h) {
  $bmp = New-Object System.Drawing.Bitmap($w, $h)
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.SmoothingMode = 'AntiAlias'
  $g.TextRenderingHint = 'AntiAliasGridFit'
  return @($bmp, $g)
}

function New-RoundRect($x, $y, $w, $h, $r) {
  $p = New-Object System.Drawing.Drawing2D.GraphicsPath
  $d = $r * 2
  $p.AddArc($x, $y, $d, $d, 180, 90)
  $p.AddArc($x + $w - $d, $y, $d, $d, 270, 90)
  $p.AddArc($x + $w - $d, $y + $h - $d, $d, $d, 0, 90)
  $p.AddArc($x, $y + $h - $d, $d, $d, 90, 90)
  $p.CloseFigure()
  return $p
}

# Text as a path, positioned so its ink bounds are centred on (cx, cy)
function Add-CentredText($g, $text, $size, $cx, $cy, $color) {
  $p = New-Object System.Drawing.Drawing2D.GraphicsPath
  $p.AddString($text, $family, [int][System.Drawing.FontStyle]::Bold, $size, (New-Object System.Drawing.PointF(0, 0)), [System.Drawing.StringFormat]::GenericTypographic)
  $b = $p.GetBounds()
  # Centre vertically on the cap height so descenders (the "p") don't pull the text up
  $v = Measure-Text 'N' $size
  $m = New-Object System.Drawing.Drawing2D.Matrix
  $m.Translate($cx - ($b.X + $b.Width / 2), $cy - ($v.Y + $v.Height / 2))
  $p.Transform($m)
  $g.FillPath((New-Object System.Drawing.SolidBrush($color)), $p)
}

function Measure-Text($text, $size) {
  $p = New-Object System.Drawing.Drawing2D.GraphicsPath
  $p.AddString($text, $family, [int][System.Drawing.FontStyle]::Bold, $size, (New-Object System.Drawing.PointF(0, 0)), [System.Drawing.StringFormat]::GenericTypographic)
  return $p.GetBounds()
}

# 1. Profile picture: full-bleed blue, "P" sized to sit inside Instagram's circle crop
$c = New-Canvas 1080 1080; $bmp = $c[0]; $g = $c[1]
$g.Clear($blue)
Add-CentredText $g 'P' 620 540 540 ([System.Drawing.Color]::White)
$bmp.Save("$out\prepnest-profile-1080.png", [System.Drawing.Imaging.ImageFormat]::Png)
$g.Dispose(); $bmp.Dispose()

# 2. Logo with name: white square, blue "P" tile + "PrepNest" wordmark
$c = New-Canvas 1080 1080; $bmp = $c[0]; $g = $c[1]
$g.Clear([System.Drawing.Color]::White)
$tile = 220; $gap = 48; $wordSize = 150
$wb = Measure-Text 'PrepNest' $wordSize
$total = $tile + $gap + $wb.Width
$x0 = (1080 - $total) / 2
$y0 = (1080 - $tile) / 2
$g.FillPath((New-Object System.Drawing.SolidBrush($blue)), (New-RoundRect $x0 $y0 $tile $tile ($tile * 14 / 64)))
Add-CentredText $g 'P' 150 ($x0 + $tile / 2) 540 ([System.Drawing.Color]::White)
Add-CentredText $g 'PrepNest' $wordSize ($x0 + $tile + $gap + $wb.Width / 2) 540 $ink
$bmp.Save("$out\prepnest-logo-1080.png", [System.Drawing.Imaging.ImageFormat]::Png)
$g.Dispose(); $bmp.Dispose()

Get-ChildItem $out | Select-Object Name, Length
