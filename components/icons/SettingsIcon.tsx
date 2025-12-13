interface SettingsIconProps {
  className?: string
  size?: number
}

export default function SettingsIcon({ className = '', size = 20 }: SettingsIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Engrenage extérieur */}
      <circle
        cx="12"
        cy="12"
        r="8"
        stroke="url(#settingsGradient1)"
        strokeWidth="1.5"
        fill="none"
        opacity="0.7"
      />
      
      {/* Dents de l'engrenage */}
      <rect
        x="11"
        y="2"
        width="2"
        height="3"
        rx="1"
        fill="url(#settingsGradient2)"
        opacity="0.8"
      />
      <rect
        x="11"
        y="19"
        width="2"
        height="3"
        rx="1"
        fill="url(#settingsGradient2)"
        opacity="0.8"
      />
      <rect
        x="2"
        y="11"
        width="3"
        height="2"
        rx="1"
        fill="url(#settingsGradient2)"
        opacity="0.8"
      />
      <rect
        x="19"
        y="11"
        width="3"
        height="2"
        rx="1"
        fill="url(#settingsGradient2)"
        opacity="0.8"
      />
      
      {/* Dents diagonales */}
      <rect
        x="16.5"
        y="3.5"
        width="2"
        height="3"
        rx="1"
        fill="url(#settingsGradient3)"
        opacity="0.7"
        transform="rotate(45 17.5 5)"
      />
      <rect
        x="5.5"
        y="17.5"
        width="2"
        height="3"
        rx="1"
        fill="url(#settingsGradient3)"
        opacity="0.7"
        transform="rotate(45 6.5 19)"
      />
      <rect
        x="5.5"
        y="3.5"
        width="2"
        height="3"
        rx="1"
        fill="url(#settingsGradient3)"
        opacity="0.7"
        transform="rotate(-45 6.5 5)"
      />
      <rect
        x="16.5"
        y="17.5"
        width="2"
        height="3"
        rx="1"
        fill="url(#settingsGradient3)"
        opacity="0.7"
        transform="rotate(-45 17.5 19)"
      />
      
      {/* Cercle intérieur */}
      <circle
        cx="12"
        cy="12"
        r="4"
        stroke="url(#settingsGradient4)"
        strokeWidth="1.5"
        fill="none"
        opacity="0.8"
      />
      
      {/* Centre */}
      <circle
        cx="12"
        cy="12"
        r="1.5"
        fill="url(#settingsGradient5)"
        opacity="0.9"
      />
      
      <defs>
        <linearGradient id="settingsGradient1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#6366F1" />
          <stop offset="50%" stopColor="#8B5CF6" />
          <stop offset="100%" stopColor="#EC4899" />
        </linearGradient>
        <linearGradient id="settingsGradient2" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#818CF8" />
          <stop offset="100%" stopColor="#A78BFA" />
        </linearGradient>
        <linearGradient id="settingsGradient3" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#A78BFA" />
          <stop offset="100%" stopColor="#F472B6" />
        </linearGradient>
        <linearGradient id="settingsGradient4" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#8B5CF6" />
          <stop offset="100%" stopColor="#EC4899" />
        </linearGradient>
        <radialGradient id="settingsGradient5" cx="50%" cy="50%">
          <stop offset="0%" stopColor="#EC4899" />
          <stop offset="100%" stopColor="#F472B6" />
        </radialGradient>
      </defs>
    </svg>
  )
}
