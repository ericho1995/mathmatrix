export default function HeroIllustration() {
  return (
    <svg viewBox="0 0 420 380" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto" role="img" aria-label="Illustration of a student practising quiz questions at a desk">
      <circle cx="210" cy="190" r="170" fill="#E6F1FB" />

      {/* Desk */}
      <rect x="60" y="255" width="300" height="16" rx="8" fill="#B5D4F4" />
      <rect x="80" y="271" width="14" height="60" rx="4" fill="#85B7EB" />
      <rect x="326" y="271" width="14" height="60" rx="4" fill="#85B7EB" />

      {/* Laptop */}
      <rect x="150" y="200" width="120" height="80" rx="8" fill="#0C447C" />
      <rect x="158" y="208" width="104" height="64" rx="4" fill="#E6F1FB" />
      <rect x="170" y="220" width="80" height="8" rx="4" fill="#B5D4F4" />
      <rect x="170" y="234" width="60" height="8" rx="4" fill="#B5D4F4" />
      <rect x="170" y="248" width="70" height="8" rx="4" fill="#1D9E75" />
      <rect x="130" y="278" width="160" height="10" rx="5" fill="#042C53" />

      {/* Quiz paper beside laptop */}
      <g transform="rotate(-8 100 235)">
        <rect x="70" y="215" width="60" height="76" rx="6" fill="#ffffff" stroke="#B5D4F4" strokeWidth="2" />
        <rect x="80" y="228" width="40" height="5" rx="2.5" fill="#85B7EB" />
        <rect x="80" y="240" width="30" height="5" rx="2.5" fill="#E1F5EE" />
        <circle cx="86" cy="255" r="5" fill="#1D9E75" />
        <path d="M83.5 255l2 2.5 4-5" stroke="white" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
        <rect x="96" y="252.5" width="20" height="5" rx="2.5" fill="#E1F5EE" />
        <circle cx="86" cy="270" r="5" fill="#B5D4F4" />
        <rect x="96" y="267.5" width="20" height="5" rx="2.5" fill="#E1F5EE" />
      </g>

      {/* Student */}
      <ellipse cx="210" cy="150" rx="30" ry="32" fill="#FAEEDA" />
      <path d="M182 140c0-18 12-32 28-32s28 14 28 32" fill="#3A2A18" />
      <rect x="186" y="178" width="48" height="70" rx="20" fill="#378ADD" />
      <rect x="176" y="196" width="20" height="56" rx="10" fill="#378ADD" />
      <rect x="224" y="196" width="20" height="56" rx="10" fill="#378ADD" />
      <circle cx="182" cy="248" r="9" fill="#FAEEDA" />
      <circle cx="238" cy="248" r="9" fill="#FAEEDA" />

      {/* Floating XP / achievement badge */}
      <g>
        <circle cx="330" cy="110" r="30" fill="#BA7517" />
        <path d="M318 110l8 8 16-16" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
      </g>
      <g>
        <rect x="42" y="90" width="70" height="34" rx="17" fill="#ffffff" stroke="#E1F5EE" strokeWidth="2" />
        <text x="77" y="112" textAnchor="middle" fontSize="15" fontWeight="600" fill="#0F6E56" fontFamily="system-ui, sans-serif">+10 XP</text>
      </g>
    </svg>
  )
}
