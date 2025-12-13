interface AssetsIconProps {
  className?: string
  size?: number
}

export default function AssetsIcon({ className = '', size = 20 }: AssetsIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Boîte principale */}
      <path
        d="M4 7 L12 3 L20 7 L20 17 L12 21 L4 17 Z"
        stroke="url(#assetsGradient1)"
        strokeWidth="1.5"
        fill="none"
        strokeLinejoin="round"
        opacity="0.8"
      />
      
      {/* Face avant */}
      <path
        d="M4 7 L12 11 L20 7"
        stroke="url(#assetsGradient2)"
        strokeWidth="1.5"
        fill="none"
        opacity="0.6"
      />
      
      {/* Face droite */}
      <path
        d="M20 7 L20 17 L12 21 L12 11"
        stroke="url(#assetsGradient3)"
        strokeWidth="1.5"
        fill="none"
        opacity="0.6"
      />
      
      {/* Lignes de séparation */}
      <line
        x1="8"
        y1="9"
        x2="8"
        y2="15"
        stroke="url(#assetsGradient4)"
        strokeWidth="1"
        opacity="0.5"
      />
      <line
        x1="12"
        y1="11"
        x2="12"
        y2="17"
        stroke="url(#assetsGradient4)"
        strokeWidth="1"
        opacity="0.5"
      />
      <line
        x1="16"
        y1="9"
        x2="16"
        y2="15"
        stroke="url(#assetsGradient4)"
        strokeWidth="1"
        opacity="0.5"
      />
      
      {/* Étiquette */}
      <rect
        x="9"
        y="13"
        width="6"
        height="2"
        rx="0.5"
        fill="url(#assetsGradient5)"
        opacity="0.7"
      />
      
      <defs>
        <linearGradient id="assetsGradient1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#6366F1" />
          <stop offset="50%" stopColor="#8B5CF6" />
          <stop offset="100%" stopColor="#EC4899" />
        </linearGradient>
        <linearGradient id="assetsGradient2" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#818CF8" />
          <stop offset="100%" stopColor="#A78BFA" />
        </linearGradient>
        <linearGradient id="assetsGradient3" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#A78BFA" />
          <stop offset="100%" stopColor="#F472B6" />
        </linearGradient>
        <linearGradient id="assetsGradient4" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#818CF8" />
          <stop offset="100%" stopColor="#A78BFA" />
        </linearGradient>
        <linearGradient id="assetsGradient5" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#EC4899" />
          <stop offset="100%" stopColor="#F472B6" />
        </linearGradient>
      </defs>
    </svg>
  )
}
