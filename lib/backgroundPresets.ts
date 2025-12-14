/**
 * Source unique de vérité pour les backgrounds de projet
 * 
 * Le background est un CHOIX D'AMBIANCE, pas un style CSS.
 * Ce fichier centralise tous les presets et la logique de rendu.
 */

export type BackgroundPreset = 
  | 'indigo-violet'
  | 'rose-violet'
  | 'dark-creative'
  | 'colorful-gradient'
  | 'dark-indigo'

export interface BackgroundPresetConfig {
  label: string
  css: string
  previewColor: string // Pour les aperçus visuels
}

/**
 * Tous les presets de background disponibles
 */
export const BACKGROUND_PRESETS: Record<BackgroundPreset, BackgroundPresetConfig> = {
  'indigo-violet': {
    label: 'Indigo / Violet',
    css: 'linear-gradient(135deg, #050510 0%, #1a1a2e 25%, #4F46E5 50%, #8B5CF6 75%, #050510 100%)',
    previewColor: 'from-indigo-600 via-purple-600 to-indigo-600',
  },
  'rose-violet': {
    label: 'Rose / Violet',
    css: 'linear-gradient(135deg, #050510 0%, #2d1b3d 25%, #EC4899 50%, #8B5CF6 75%, #050510 100%)',
    previewColor: 'from-pink-600 via-purple-600 to-pink-600',
  },
  'dark-creative': {
    label: 'Sombre créatif',
    css: 'linear-gradient(135deg, #050510 0%, #0A0A1A 20%, #0F0F1F 40%, #141428 60%, #191932 80%, #1E1E3C 100%)',
    previewColor: 'from-slate-900 via-purple-900 to-slate-900',
  },
  'colorful-gradient': {
    label: 'Gradient coloré',
    css: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 25%, #EC4899 50%, #F472B6 75%, #6366F1 100%)',
    previewColor: 'from-indigo-500 via-purple-500 via-pink-500 to-indigo-500',
  },
  'dark-indigo': {
    label: 'Sombre indigo',
    css: 'linear-gradient(135deg, #050510 0%, #0a0a1a 30%, #1a1a3e 60%, #2d1b4e 90%, #050510 100%)',
    previewColor: 'from-slate-950 via-indigo-950 to-slate-950',
  },
}

/**
 * Preset par défaut (utilisé si aucun background n'est défini)
 */
export const DEFAULT_BACKGROUND_PRESET: BackgroundPreset = 'dark-creative'

/**
 * Interface pour un projet avec background
 */
export interface ProjectWithBackground {
  background_type?: 'preset' | 'custom' | null
  background_preset?: BackgroundPreset | null
  background_image_url?: string | null
  // Ancien champ pour compatibilité (ne plus utiliser)
  gradient_background?: string | null
}

/**
 * Fonction unique de rendu du background
 * 
 * Règle simple et robuste : ZÉRO détection, ZÉRO parsing CSS
 * 
 * @param project - Projet avec les champs de background
 * @returns CSS string pour le background (gradient ou url)
 */
export function getProjectBackground(project: ProjectWithBackground | null | undefined): string {
  if (!project) {
    return BACKGROUND_PRESETS[DEFAULT_BACKGROUND_PRESET].css
  }

  // Priorité 1 : Custom avec image
  if (project.background_type === 'custom' && project.background_image_url) {
    return `url(${project.background_image_url})`
  }

  // Priorité 2 : Preset défini
  if (project.background_type === 'preset' && project.background_preset) {
    const preset = BACKGROUND_PRESETS[project.background_preset]
    if (preset) {
      return preset.css
    }
  }

  // Fallback : Compatibilité avec l'ancien système (gradient_background)
  // À supprimer une fois la migration complète
  if (project.gradient_background) {
    return project.gradient_background
  }

  // Fallback final : Preset par défaut
  return BACKGROUND_PRESETS[DEFAULT_BACKGROUND_PRESET].css
}

/**
 * Obtient le label d'un preset
 */
export function getBackgroundPresetLabel(preset: BackgroundPreset): string {
  return BACKGROUND_PRESETS[preset].label
}

/**
 * Liste tous les presets disponibles (pour les sélecteurs)
 */
export function getAllBackgroundPresets(): Array<{ value: BackgroundPreset; label: string; previewColor: string }> {
  return Object.entries(BACKGROUND_PRESETS).map(([value, config]) => ({
    value: value as BackgroundPreset,
    label: config.label,
    previewColor: config.previewColor,
  }))
}
