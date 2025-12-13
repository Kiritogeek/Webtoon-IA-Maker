interface DashboardIconProps {
  className?: string
  size?: number
}

export default function DashboardIcon({ className = '', size = 20 }: DashboardIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Fond du dashboard - grille */}
      <rect
        x="3"
        y="3"
        width="18"
        height="18"
        rx="2"
        stroke="url(#dashboardGradient1)"
        strokeWidth="1.5"
        fill="none"
        opacity="0.4"
      />
      
      {/* Lignes de grille horizontales */}
      <line
        x1="3"
        y1="9"
        x2="21"
        y2="9"
        stroke="url(#dashboardGradient2)"
        strokeWidth="1"
        opacity="0.3"
      />
      <line
        x1="3"
        y1="15"
        x2="21"
        y2="15"
        stroke="url(#dashboardGradient2)"
        strokeWidth="1"
        opacity="0.3"
      />
      
      {/* Lignes de grille verticales */}
      <line
        x1="9"
        y1="3"
        x2="9"
        y2="21"
        stroke="url(#dashboardGradient2)"
        strokeWidth="1"
        opacity="0.3"
      />
      <line
        x1="15"
        y1="3"
        x2="15"
        y2="21"
        stroke="url(#dashboardGradient2)"
        strokeWidth="1"
        opacity="0.3"
      />
      
      {/* Barres graphiques */}
      {/* Barre 1 */}
      <rect
        x="5"
        y="16"
        width="2.5"
        height="4"
        rx="1"
        fill="url(#dashboardGradient3)"
        opacity="0.9"
      />
      
      {/* Barre 2 */}
      <rect
        x="8.5"
        y="13"
        width="2.5"
        height="7"
        rx="1"
        fill="url(#dashboardGradient3)"
        opacity="0.9"
      />
      
      {/* Barre 3 */}
      <rect
        x="12"
        y="10"
        width="2.5"
        height="10"
        rx="1"
        fill="url(#dashboardGradient4)"
        opacity="0.9"
      />
      
      {/* Barre 4 */}
      <rect
        x="15.5"
        y="14"
        width="2.5"
        height="6"
        rx="1"
        fill="url(#dashboardGradient4)"
        opacity="0.9"
      />
      
      {/* Ligne de graphique */}
      <path
        d="M5 18 L8.5 15 L12 12 L15.5 14 L19 11"
        stroke="url(#dashboardGradient5)"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.8"
      />
      
      {/* Points sur la ligne */}
      <circle cx="5" cy="18" r="1.5" fill="url(#dashboardGradient5)" />
      <circle cx="8.5" cy="15" r="1.5" fill="url(#dashboardGradient5)" />
      <circle cx="12" cy="12" r="1.5" fill="url(#dashboardGradient5)" />
      <circle cx="15.5" cy="14" r="1.5" fill="url(#dashboardGradient5)" />
      <circle cx="19" cy="11" r="1.5" fill="url(#dashboardGradient5)" />
      
      <defs>
        <linearGradient id="dashboardGradient1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#6366F1" />
          <stop offset="50%" stopColor="#8B5CF6" />
          <stop offset="100%" stopColor="#EC4899" />
        </linearGradient>
        <linearGradient id="dashboardGradient2" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#818CF8" />
          <stop offset="100%" stopColor="#A78BFA" />
        </linearGradient>
        <linearGradient id="dashboardGradient3" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#6366F1" />
          <stop offset="100%" stopColor="#818CF8" />
        </linearGradient>
        <linearGradient id="dashboardGradient4" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#8B5CF6" />
          <stop offset="100%" stopColor="#A78BFA" />
        </linearGradient>
        <linearGradient id="dashboardGradient5" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#EC4899" />
          <stop offset="50%" stopColor="#F472B6" />
          <stop offset="100%" stopColor="#A78BFA" />
        </linearGradient>
      </defs>
    </svg>
  )
}
