interface ScenarioIconProps {
  className?: string
  size?: number
}

export default function ScenarioIcon({ className = '', size = 20 }: ScenarioIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Feuille de papier */}
      <path
        d="M5 3 L19 3 L19 21 L5 21 Z"
        stroke="url(#scenarioGradient1)"
        strokeWidth="1.5"
        fill="none"
        opacity="0.8"
      />
      
      {/* Coin plié */}
      <path
        d="M15 3 L19 3 L19 7"
        stroke="url(#scenarioGradient2)"
        strokeWidth="1.5"
        fill="none"
        strokeLinejoin="round"
        opacity="0.6"
      />
      
      {/* Lignes de texte */}
      <line
        x1="7"
        y1="7"
        x2="13"
        y2="7"
        stroke="url(#scenarioGradient3)"
        strokeWidth="1.2"
        opacity="0.7"
      />
      <line
        x1="7"
        y1="10"
        x2="15"
        y2="10"
        stroke="url(#scenarioGradient3)"
        strokeWidth="1.2"
        opacity="0.7"
      />
      <line
        x1="7"
        y1="13"
        x2="12"
        y2="13"
        stroke="url(#scenarioGradient3)"
        strokeWidth="1.2"
        opacity="0.7"
      />
      <line
        x1="7"
        y1="16"
        x2="14"
        y2="16"
        stroke="url(#scenarioGradient4)"
        strokeWidth="1.2"
        opacity="0.7"
      />
      <line
        x1="7"
        y1="19"
        x2="11"
        y2="19"
        stroke="url(#scenarioGradient4)"
        strokeWidth="1.2"
        opacity="0.7"
      />
      
      {/* Stylo/Plume */}
      <path
        d="M16 5 L18 7 L17 8 L15 6 Z"
        fill="url(#scenarioGradient5)"
        opacity="0.8"
      />
      <line
        x1="16"
        y1="5"
        x2="18"
        y2="7"
        stroke="url(#scenarioGradient5)"
        strokeWidth="0.5"
        opacity="0.6"
      />
      <line
        x1="17"
        y1="8"
        x2="15"
        y2="6"
        stroke="url(#scenarioGradient5)"
        strokeWidth="0.5"
        opacity="0.6"
      />
      
      <defs>
        <linearGradient id="scenarioGradient1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#6366F1" />
          <stop offset="100%" stopColor="#8B5CF6" />
        </linearGradient>
        <linearGradient id="scenarioGradient2" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#8B5CF6" />
          <stop offset="100%" stopColor="#EC4899" />
        </linearGradient>
        <linearGradient id="scenarioGradient3" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#818CF8" />
          <stop offset="100%" stopColor="#A78BFA" />
        </linearGradient>
        <linearGradient id="scenarioGradient4" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#A78BFA" />
          <stop offset="100%" stopColor="#F472B6" />
        </linearGradient>
        <linearGradient id="scenarioGradient5" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#EC4899" />
          <stop offset="100%" stopColor="#F472B6" />
        </linearGradient>
      </defs>
    </svg>
  )
}
