# Speaks the "They grow up so quickly" reel's lines: a soft, slow en-AU
# female voice, as gentle as the system voices go.
#   powershell -File marketing/instagram/ad-grow/voice.ps1
# To use a recorded voice instead, save vo-1.wav ... vo-11.wav here (one line
# each, any sample rate, mono) and run audio.py; the animation follows.
$here = Split-Path -Parent $MyInvocation.MyCommand.Path
$tts = Join-Path $here '../ad/tts.ps1'
$lines = @(
  "They grow up so quickly.",
  "One day, it's counting on their fingers. The next, it's algebra you haven't seen in years.",
  "Between school runs, work and dinner, the weeks just fly by.",
  "And it's so easy to miss the quiet moment they start to fall behind.",
  "A topic that never quite clicked. A question they were too shy to ask.",
  "You wonder. Are they keeping up? Am I doing enough?",
  "PrepNest helps you see what's really going on.",
  "Our free test shows exactly where your child needs help.",
  "Then their practice is made just for those skills.",
  "So nothing slips through the cracks, and they grow up confident.",
  "Try the free test now, at prepnest.com.au"
)
for ($i = 0; $i -lt $lines.Count; $i++) {
  & $tts -Voice 'Catherine' -Text $lines[$i] -Out (Join-Path $here "vo-$($i + 1).wav") -Rate '-14%' -Pitch '-4%' | Out-Null
}
Write-Output "wrote $($lines.Count) lines"
