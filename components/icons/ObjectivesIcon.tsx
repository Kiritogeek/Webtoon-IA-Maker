interface ObjectivesIconProps {
  className?: string
  size?: number
}

export default function ObjectivesIcon({ className = '', size = 20 }: ObjectivesIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Cercle extérieur */}
      <circle
        cx="12"
        cy="12"
        r="10"
        stroke="url(#gradient1)"
        strokeWidth="1.5"
        fill="none"
        opacity="0.6"
      />
      {/* Cercle moyen */}
      <circle
        cx="12"
        cy="12"
        r="6"
        stroke="url(#gradient2)"
        strokeWidth="1.5"
        fill="none"
        opacity="0.8"
      />
      {/* Cercle intérieur / centre */}
      <circle
        cx="12"
        cy="12"
        r="2"
        fill="url(#gradient3)"
      />
      {/* Flèche pointant vers le centre */}
      <path
        d="M12 2 L12 6 M12 18 L12 22 M2 12 L6 12 M18 12 L22 12"
        stroke="url(#gradient2)"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.7"
      />
      <defs>
        <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#8B5CF6" />
          <stop offset="100%" stopColor="#EC4899" />
        </linearGradient>
        <linearGradient id="gradient2" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#A78BFA" />
          <stop offset="100%" stopColor="#F472B6" />
        </linearGradient>
        <linearGradient id="gradient3" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#C4B5FD" />
          <stop offset="100%" stopColor="#F9A8D4" />
        </linearGradient>
      </defs>
    </svg>
  )
}
