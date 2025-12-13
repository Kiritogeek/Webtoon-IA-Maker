interface IdentityIconProps {
  className?: string
  size?: number
}

export default function IdentityIcon({ className = '', size = 20 }: IdentityIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Palette */}
      <ellipse
        cx="12"
        cy="16"
        rx="8"
        ry="4"
        stroke="url(#identityGradient1)"
        strokeWidth="1.5"
        fill="none"
        opacity="0.7"
      />
      
      {/* Trou pour le pouce */}
      <ellipse
        cx="12"
        cy="16"
        rx="2"
        ry="1.5"
        fill="url(#identityGradient2)"
        opacity="0.3"
      />
      
      {/* Taches de peinture */}
      <circle
        cx="8"
        cy="8"
        r="2.5"
        fill="url(#identityGradient3)"
        opacity="0.9"
      />
      <circle
        cx="14"
        cy="7"
        r="2"
        fill="url(#identityGradient4)"
        opacity="0.9"
      />
      <circle
        cx="17"
        cy="11"
        r="1.5"
        fill="url(#identityGradient5)"
        opacity="0.9"
      />
      <circle
        cx="6"
        cy="12"
        r="1.8"
        fill="url(#identityGradient6)"
        opacity="0.9"
      />
      
      {/* Pinceau */}
      <rect
        x="18"
        y="2"
        width="3"
        height="8"
        rx="1.5"
        fill="url(#identityGradient7)"
        opacity="0.8"
        transform="rotate(15 19.5 6)"
      />
      <line
        x1="19.5"
        y1="2"
        x2="19.5"
        y2="10"
        stroke="url(#identityGradient8)"
        strokeWidth="0.5"
        opacity="0.4"
        transform="rotate(15 19.5 6)"
      />
      
      <defs>
        <linearGradient id="identityGradient1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#6366F1" />
          <stop offset="100%" stopColor="#8B5CF6" />
        </linearGradient>
        <linearGradient id="identityGradient2" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#8B5CF6" />
          <stop offset="100%" stopColor="#EC4899" />
        </linearGradient>
        <radialGradient id="identityGradient3" cx="50%" cy="50%">
          <stop offset="0%" stopColor="#6366F1" />
          <stop offset="100%" stopColor="#818CF8" />
        </radialGradient>
        <radialGradient id="identityGradient4" cx="50%" cy="50%">
          <stop offset="0%" stopColor="#8B5CF6" />
          <stop offset="100%" stopColor="#A78BFA" />
        </radialGradient>
        <radialGradient id="identityGradient5" cx="50%" cy="50%">
          <stop offset="0%" stopColor="#EC4899" />
          <stop offset="100%" stopColor="#F472B6" />
        </radialGradient>
        <radialGradient id="identityGradient6" cx="50%" cy="50%">
          <stop offset="0%" stopColor="#A78BFA" />
          <stop offset="100%" stopColor="#C4B5FD" />
        </radialGradient>
        <linearGradient id="identityGradient7" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#818CF8" />
          <stop offset="100%" stopColor="#6366F1" />
        </linearGradient>
        <linearGradient id="identityGradient8" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#A78BFA" />
          <stop offset="100%" stopColor="#8B5CF6" />
        </linearGradient>
      </defs>
    </svg>
  )
}
