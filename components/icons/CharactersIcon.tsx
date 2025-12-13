interface CharactersIconProps {
  className?: string
  size?: number
}

export default function CharactersIcon({ className = '', size = 20 }: CharactersIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Tête */}
      <circle
        cx="12"
        cy="8"
        r="3.5"
        stroke="url(#charactersGradient1)"
        strokeWidth="1.5"
        fill="none"
        opacity="0.9"
      />
      
      {/* Corps */}
      <path
        d="M12 11.5 C12 11.5 8 13 8 16 L8 20 C8 20.5 8.5 21 9 21 L15 21 C15.5 21 16 20.5 16 20 L16 16 C16 13 12 11.5 12 11.5 Z"
        stroke="url(#charactersGradient2)"
        strokeWidth="1.5"
        fill="none"
        opacity="0.9"
      />
      
      {/* Bras gauche */}
      <path
        d="M8 14 C7 13 5 13 4 14"
        stroke="url(#charactersGradient3)"
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
        opacity="0.8"
      />
      
      {/* Bras droit */}
      <path
        d="M16 14 C17 13 19 13 20 14"
        stroke="url(#charactersGradient3)"
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
        opacity="0.8"
      />
      
      {/* Jambes */}
      <line
        x1="12"
        y1="20"
        x2="10"
        y2="23"
        stroke="url(#charactersGradient4)"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.8"
      />
      <line
        x1="12"
        y1="20"
        x2="14"
        y2="23"
        stroke="url(#charactersGradient4)"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.8"
      />
      
      <defs>
        <linearGradient id="charactersGradient1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#6366F1" />
          <stop offset="100%" stopColor="#8B5CF6" />
        </linearGradient>
        <linearGradient id="charactersGradient2" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#8B5CF6" />
          <stop offset="100%" stopColor="#EC4899" />
        </linearGradient>
        <linearGradient id="charactersGradient3" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#818CF8" />
          <stop offset="100%" stopColor="#A78BFA" />
        </linearGradient>
        <linearGradient id="charactersGradient4" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#A78BFA" />
          <stop offset="100%" stopColor="#F472B6" />
        </linearGradient>
      </defs>
    </svg>
  )
}
