# Speaks the four ad lines with the deeper en-AU voice, slow and warm.
#   powershell -File marketing/instagram/ad/voice.ps1
$here = Split-Path -Parent $MyInvocation.MyCommand.Path
$lines = @(
  @{ n = 1; rate = '-6%'; text = "Some kids quietly decide they're not smart." },
  @{ n = 2; rate = '-6%'; text = "Often, it's one small gap no one saw." },
  @{ n = 3; rate = '-6%'; text = "PrepNest finds it, and helps them close it." },
  @{ n = 4; rate = '-10%'; text = "Help them believe in themselves again." }
)
foreach ($l in $lines) {
  & "$here/tts.ps1" -Voice 'James' -Text $l.text -Out "$here/vo-$($l.n).wav" -Rate $l.rate -Pitch '-6%'
}
