interface PlacesIconProps {
  className?: string
  size?: number
}

export default function PlacesIcon({ className = '', size = 20 }: PlacesIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Base du bâtiment */}
      <rect
        x="4"
        y="10"
        width="16"
        height="10"
        rx="1"
        stroke="url(#placesGradient1)"
        strokeWidth="1.5"
        fill="none"
        opacity="0.8"
      />
      
      {/* Colonnes */}
      <line
        x1="7"
        y1="10"
        x2="7"
        y2="20"
        stroke="url(#placesGradient2)"
        strokeWidth="1"
        opacity="0.6"
      />
      <line
        x1="12"
        y1="10"
        x2="12"
        y2="20"
        stroke="url(#placesGradient2)"
        strokeWidth="1"
        opacity="0.6"
      />
      <line
        x1="17"
        y1="10"
        x2="17"
        y2="20"
        stroke="url(#placesGradient2)"
        strokeWidth="1"
        opacity="0.6"
      />
      
      {/* Toit triangulaire */}
      <path
        d="M2 10 L12 4 L22 10"
        stroke="url(#placesGradient3)"
        strokeWidth="1.5"
        fill="none"
        strokeLinejoin="round"
        opacity="0.9"
      />
      
      {/* Détails du toit */}
      <line
        x1="7"
        y1="7"
        x2="7"
        y2="10"
        stroke="url(#placesGradient4)"
        strokeWidth="1"
        opacity="0.5"
      />
      <line
        x1="17"
        y1="7"
        x2="17"
        y2="10"
        stroke="url(#placesGradient4)"
        strokeWidth="1"
        opacity="0.5"
      />
      
      {/* Porte */}
      <rect
        x="9"
        y="15"
        width="6"
        height="5"
        rx="0.5"
        stroke="url(#placesGradient5)"
        strokeWidth="1"
        fill="none"
        opacity="0.7"
      />
      
      <defs>
        <linearGradient id="placesGradient1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#6366F1" />
          <stop offset="100%" stopColor="#8B5CF6" />
        </linearGradient>
        <linearGradient id="placesGradient2" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#818CF8" />
          <stop offset="100%" stopColor="#A78BFA" />
        </linearGradient>
        <linearGradient id="placesGradient3" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#8B5CF6" />
          <stop offset="50%" stopColor="#EC4899" />
          <stop offset="100%" stopColor="#A78BFA" />
        </linearGradient>
        <linearGradient id="placesGradient4" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#A78BFA" />
          <stop offset="100%" stopColor="#F472B6" />
        </linearGradient>
        <linearGradient id="placesGradient5" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#EC4899" />
          <stop offset="100%" stopColor="#F472B6" />
        </linearGradient>
      </defs>
    </svg>
  )
}
