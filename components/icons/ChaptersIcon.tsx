interface ChaptersIconProps {
  className?: string
  size?: number
}

export default function ChaptersIcon({ className = '', size = 20 }: ChaptersIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Livre ouvert */}
      <path
        d="M4 6 C4 5 5 4 6 4 L10 4 C11 4 12 5 12 6 L12 20 C12 21 11 22 10 22 L6 22 C5 22 4 21 4 20 Z"
        stroke="url(#chaptersGradient1)"
        strokeWidth="1.5"
        fill="none"
        opacity="0.8"
      />
      <path
        d="M12 6 C12 5 13 4 14 4 L18 4 C19 4 20 5 20 6 L20 20 C20 21 19 22 18 22 L14 22 C13 22 12 21 12 20 Z"
        stroke="url(#chaptersGradient2)"
        strokeWidth="1.5"
        fill="none"
        opacity="0.8"
      />
      
      {/* Lignes de texte */}
      <line
        x1="6"
        y1="8"
        x2="10"
        y2="8"
        stroke="url(#chaptersGradient3)"
        strokeWidth="1"
        opacity="0.6"
      />
      <line
        x1="6"
        y1="10"
        x2="9"
        y2="10"
        stroke="url(#chaptersGradient3)"
        strokeWidth="1"
        opacity="0.6"
      />
      <line
        x1="6"
        y1="12"
        x2="10"
        y2="12"
        stroke="url(#chaptersGradient3)"
        strokeWidth="1"
        opacity="0.6"
      />
      
      <line
        x1="14"
        y1="8"
        x2="18"
        y2="8"
        stroke="url(#chaptersGradient4)"
        strokeWidth="1"
        opacity="0.6"
      />
      <line
        x1="14"
        y1="10"
        x2="17"
        y2="10"
        stroke="url(#chaptersGradient4)"
        strokeWidth="1"
        opacity="0.6"
      />
      <line
        x1="14"
        y1="12"
        x2="18"
        y2="12"
        stroke="url(#chaptersGradient4)"
        strokeWidth="1"
        opacity="0.6"
      />
      
      {/* Reliure centrale */}
      <line
        x1="12"
        y1="4"
        x2="12"
        y2="22"
        stroke="url(#chaptersGradient5)"
        strokeWidth="1.5"
        opacity="0.5"
      />
      
      <defs>
        <linearGradient id="chaptersGradient1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#6366F1" />
          <stop offset="100%" stopColor="#8B5CF6" />
        </linearGradient>
        <linearGradient id="chaptersGradient2" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#8B5CF6" />
          <stop offset="100%" stopColor="#EC4899" />
        </linearGradient>
        <linearGradient id="chaptersGradient3" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#818CF8" />
          <stop offset="100%" stopColor="#A78BFA" />
        </linearGradient>
        <linearGradient id="chaptersGradient4" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#A78BFA" />
          <stop offset="100%" stopColor="#F472B6" />
        </linearGradient>
        <linearGradient id="chaptersGradient5" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#6366F1" />
          <stop offset="50%" stopColor="#8B5CF6" />
          <stop offset="100%" stopColor="#EC4899" />
        </linearGradient>
      </defs>
    </svg>
  )
}
