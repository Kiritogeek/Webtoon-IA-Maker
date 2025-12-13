// Constantes pour la configuration des projets

export const GENRES = [
  { value: 'romance', label: 'Romance', color: '#EC4899' }, // Rose moderne
  { value: 'drame', label: 'Drame', color: '#EF4444' }, // Rouge moderne
  { value: 'fantasy', label: 'Fantasy', color: '#8B5CF6' }, // Violet moderne
  { value: 'action', label: 'Action', color: '#F59E0B' }, // Orange moderne
  { value: 'thriller', label: 'Thriller', color: '#DC2626' }, // Rouge foncé
  { value: 'science-fiction', label: 'Science-fiction', color: '#06B6D4' }, // Cyan moderne
  { value: 'comedie', label: 'Comédie', color: '#FCD34D' }, // Jaune doux
  { value: 'surnaturel', label: 'Surnaturel', color: '#7C3AED' }, // Violet foncé
  { value: 'slice-of-life', label: 'Slice of Life', color: '#10B981' }, // Vert émeraude
  { value: 'custom', label: 'Custom', color: '#FFFFFF' }, // Blanc
] as const

export const AMBIANCES = [
  { value: 'lumineuse', label: 'Lumineuse', color: '#FCD34D' }, // Jaune doux
  { value: 'sombre', label: 'Sombre', color: '#475569' }, // Slate gris
  { value: 'mature', label: 'Mature', color: '#92400E' }, // Marron moderne
  { value: 'enfantine', label: 'Enfantine', color: '#F472B6' }, // Rose moderne
  { value: 'poetique', label: 'Poétique', color: '#C084FC' }, // Violet clair
  { value: 'humoristique', label: 'Humoristique', color: '#FB923C' }, // Orange doux
  { value: 'custom', label: 'Custom + IA', color: '#FFFFFF' }, // Blanc
] as const

export const STYLES_GRAPHIQUES = [
  { 
    value: 'webtoon-standard', 
    label: 'Webtoon standard',
    description: 'Style classique des webtoons coréens, coloré et dynamique',
    color: '#EF4444', // Rouge moderne
  },
  { 
    value: 'manga-noir-blanc', 
    label: 'Manga noir & blanc',
    description: 'Style traditionnel manga avec traits nets et contrastes',
    color: '#1E293B', // Slate foncé
  },
  { 
    value: 'manhwa-semi-realiste', 
    label: 'Manhwa semi-réaliste',
    description: 'Style manhwa avec proportions plus réalistes',
    color: '#6366F1', // Indigo moderne
  },
  { 
    value: 'cartoon', 
    label: 'Cartoon',
    description: 'Style cartoon avec formes arrondies et expressives',
    color: '#EC4899', // Rose moderne
  },
  { 
    value: 'peinture-digitale', 
    label: 'Peinture digitale',
    description: 'Style artistique avec textures de peinture',
    color: '#8B5CF6', // Violet moderne
  },
  { 
    value: 'pixel-art', 
    label: 'Pixel art',
    description: 'Style rétro avec pixels visibles',
    color: '#10B981', // Vert émeraude moderne
  },
  { 
    value: 'custom', 
    label: 'Custom',
    description: 'Téléchargez une image de référence ou décrivez votre style',
    color: '#FFFFFF', // Blanc
  },
] as const

export type Genre = typeof GENRES[number]['value']
export type Ambiance = typeof AMBIANCES[number]['value']
export type StyleGraphique = typeof STYLES_GRAPHIQUES[number]['value']

// Interface pour la configuration complète d'un projet
export interface ProjectConfig {
  name: string
  description?: string
  genre: Genre
  genre_custom?: string
  ambiance: Ambiance
  ambiance_custom?: string
  style_graphique: StyleGraphique
  style_reference_image_url?: string // Ancien champ, conservé pour compatibilité
  identity_visual_reference_url?: string // Template/Identité visuelle (utilisé par l'IA pour la cohérence graphique)
  style_prompt?: string
  format?: 'vertical' | 'horizontal'
  nombre_personnages?: number | null // null = "Je ne sais pas encore"
  univers_principal?: string
  background_type?: 'black' | 'gray' | 'white' | 'custom'
  gradient_background?: string // Gradient CSS ou URL d'image pour le background
  background_image_url?: string // URL de l'image pour le background personnalisé
}

