/**
 * Constructeur de contexte IA pour garantir la cohérence graphique
 * 
 * Selon Produit.md, tout prompt IA doit inclure implicitement :
 * - Le style de la couverture
 * - L'identité visuelle du projet
 * - Le contexte narratif
 * - Le format Webtoon vertical
 * - La continuité inter-chapitres
 */

import type { Project, Character, Chapter, Scene } from '@/lib/supabase'

export interface AIContext {
  project: Project
  chapter?: Chapter | null
  scene?: Scene | null
  character?: Character | null
  objectives?: {
    readingTime?: string
    narrativeType?: string
    visualDensity?: string
    constraints?: string[]
  }
}

/**
 * Construit le contexte de base pour tous les prompts IA
 * Inclut automatiquement :
 * - Style graphique du projet
 * - Ambiance
 * - Image de référence (couverture)
 * - Format Webtoon vertical
 */
export function buildBaseContext(project: Project): string {
  const contextParts: string[] = []

  // Style graphique (CRITIQUE - ligne 63-100 Produit.md)
  if (project.style_graphique) {
    contextParts.push(`Style graphique: ${project.style_graphique}`)
  }

  // Ambiance
  if (project.ambiance) {
    contextParts.push(`Ambiance: ${project.ambiance}`)
  }

  // Références visuelles (nouveau système multi-références) - RÈGLE ABSOLUE
  // Toutes les images de référence définissent le style graphique de TOUS les éléments générés
  // L'IA doit déduire le style commun à toutes ces références
  // Le template sélectionné (identity_visual_reference_url) est TOUJOURS inclus
  const allReferences: string[] = []
  
  // Ajouter le template de référence en premier (priorité)
  if (project.identity_visual_reference_url) {
    allReferences.push(project.identity_visual_reference_url)
  }
  
  // Ajouter les références visuelles supplémentaires
  if (project.visual_references && project.visual_references.length > 0) {
    project.visual_references.forEach((ref: any) => {
      // Éviter les doublons si le template est déjà dans les références
      if (ref.image_url !== project.identity_visual_reference_url) {
        allReferences.push(ref.image_url)
      }
    })
  }
  
  if (allReferences.length > 0) {
    const imageUrls = allReferences.join(', ')
    contextParts.push(`Références visuelles du projet (toutes également importantes): ${imageUrls}`)
    if (project.identity_visual_reference_url) {
      contextParts.push(`Template principal (sélectionné dans la configuration): ${project.identity_visual_reference_url}`)
    }
    contextParts.push('Objectif: Déduire le style graphique commun à ces références et l\'appliquer de manière cohérente à toutes les générations')
    contextParts.push('Cohérence visuelle OBLIGATOIRE: Tous les éléments générés doivent respecter le style commun déduit de ces références')
    contextParts.push('Style, couleurs, traits, proportions, textures, ambiance - TOUT doit être cohérent avec le style commun')
  } else {
    // Fallback vers l'ancien système (1 image unique)
    const identityVisualReference = project.identity_visual_reference_url || project.style_reference_image_url
    if (identityVisualReference) {
      contextParts.push(`Référence visuelle ABSOLUE (Template de configuration): ${identityVisualReference}`)
      contextParts.push('Cohérence visuelle OBLIGATOIRE: Tous les éléments générés doivent être PARFAITEMENT cohérents avec cette image de référence')
      contextParts.push('Style, couleurs, traits, proportions, textures, ambiance - TOUT doit correspondre exactement à cette référence')
    }
  }

  // Résumé de style si disponible (généré automatiquement par l'IA)
  if (project.visual_style_summary) {
    contextParts.push(`Style compris par l'IA: ${project.visual_style_summary}`)
  }

  // Prompt de style ajustable manuellement (optionnel)
  if (project.visual_style_prompt) {
    contextParts.push(`Ajustement manuel du style: ${project.visual_style_prompt}`)
  }

  // Format Webtoon vertical (OBLIGATOIRE)
  contextParts.push('Format: Webtoon vertical, 800px de largeur, scroll vertical')
  contextParts.push('Format de lecture: Panels successifs avec espaces de respiration')

  // Style prompt personnalisé si défini (ancien système, conservé pour compatibilité)
  if (project.style_prompt) {
    contextParts.push(`Style personnalisé: ${project.style_prompt}`)
  }

  // Genre et univers
  if (project.genre) {
    contextParts.push(`Genre: ${project.genre}`)
  }
  if (project.univers_principal) {
    contextParts.push(`Univers: ${project.univers_principal}`)
  }

  return contextParts.join('\n')
}

/**
 * Construit le contexte pour un personnage
 * Inclut les informations du personnage + contexte du projet
 */
export function buildCharacterContext(
  project: Project,
  character: Character,
  additionalPrompt?: string
): string {
  const baseContext = buildBaseContext(project)
  const characterParts: string[] = []

  characterParts.push(`\n=== CONTEXTE PERSONNAGE ===`)
  characterParts.push(`Nom: ${character.name}`)

  // Description générale
  if (character.description) {
    characterParts.push(`Description: ${character.description}`)
  }

  // Identité visuelle (visage)
  if (character.face_description) {
    characterParts.push(`Visage: ${character.face_description}`)
  }
  if (character.face_image_url) {
    characterParts.push(`Référence visage: ${character.face_image_url}`)
  }

  // Identité visuelle (corps)
  if (character.body_description) {
    characterParts.push(`Corps: ${character.body_description}`)
  }
  if (character.body_image_url) {
    characterParts.push(`Référence corps: ${character.body_image_url}`)
  }

  // Traits de caractère
  if (character.personality_traits && character.personality_traits.length > 0) {
    characterParts.push(`Traits: ${character.personality_traits.join(', ')}`)
  }

  // Histoire
  if (character.history) {
    characterParts.push(`Histoire: ${character.history}`)
  }

  // Images de référence
  if (character.reference_images && character.reference_images.length > 0) {
    characterParts.push(`Images de référence: ${character.reference_images.join(', ')}`)
  }

  // Prompt additionnel
  if (additionalPrompt) {
    characterParts.push(`\nAction demandée: ${additionalPrompt}`)
  }

  return `${baseContext}\n${characterParts.join('\n')}`
}

/**
 * Construit le contexte pour un panel/scène
 * Inclut le contexte du chapitre + objectifs + éléments du panel
 */
export function buildPanelContext(
  project: Project,
  chapter: Chapter | null,
  scene: Scene | null,
  objectives?: AIContext['objectives'],
  additionalPrompt?: string
): string {
  const baseContext = buildBaseContext(project)
  const panelParts: string[] = []

  panelParts.push(`\n=== CONTEXTE PANEL ===`)

  // Contexte du chapitre
  if (chapter) {
    panelParts.push(`Chapitre: ${chapter.title}`)
    if (chapter.description) {
      panelParts.push(`Description chapitre: ${chapter.description}`)
    }
  }

  // Contexte de la scène
  if (scene) {
    panelParts.push(`Scène: ${scene.title}`)
    if (scene.description) {
      panelParts.push(`Description scène: ${scene.description}`)
    }

    // Données du canvas (éléments présents)
    if (scene.canvas_data) {
      const canvas = scene.canvas_data
      
      if (canvas.narrativeRole) {
        panelParts.push(`Rôle narratif: ${canvas.narrativeRole}`)
      }
      if (canvas.visualDensity) {
        panelParts.push(`Densité visuelle: ${canvas.visualDensity}`)
      }
      if (canvas.characters && canvas.characters.length > 0) {
        panelParts.push(`Personnages présents: ${canvas.characters.map((c: any) => c.name).join(', ')}`)
      }
      if (canvas.background) {
        panelParts.push(`Fond: ${canvas.background.placeId || 'défini'}`)
      }
    }
  }

  // Objectifs du chapitre (selon Produit.md ligne 594-604)
  if (objectives) {
    panelParts.push(`\n=== OBJECTIFS ===`)
    if (objectives.readingTime) {
      panelParts.push(`Temps de lecture cible: ${objectives.readingTime}`)
    }
    if (objectives.narrativeType) {
      panelParts.push(`Type narratif: ${objectives.narrativeType}`)
    }
    if (objectives.visualDensity) {
      panelParts.push(`Densité visuelle: ${objectives.visualDensity}`)
    }
    if (objectives.constraints && objectives.constraints.length > 0) {
      panelParts.push(`Contraintes: ${objectives.constraints.join(', ')}`)
    }
  }

  // Prompt additionnel
  if (additionalPrompt) {
    panelParts.push(`\nAction demandée: ${additionalPrompt}`)
  }

  return `${baseContext}\n${panelParts.join('\n')}`
}

/**
 * Construit le contexte pour une transition
 */
export function buildTransitionContext(
  project: Project,
  chapter: Chapter | null,
  transitionType: string,
  additionalPrompt?: string
): string {
  const baseContext = buildBaseContext(project)
  const transitionParts: string[] = []

  transitionParts.push(`\n=== CONTEXTE TRANSITION ===`)
  transitionParts.push(`Type: ${transitionType}`)
  
  if (chapter) {
    transitionParts.push(`Chapitre: ${chapter.title}`)
  }

  transitionParts.push('Rôle: Créer du rythme de lecture entre deux panels')
  transitionParts.push('Format: Vertical, hauteur variable selon l\'effet souhaité')

  if (additionalPrompt) {
    transitionParts.push(`\nEffet demandé: ${additionalPrompt}`)
  }

  return `${baseContext}\n${transitionParts.join('\n')}`
}

/**
 * Construit le contexte complet pour une génération IA
 * Utilise tous les éléments disponibles pour garantir la cohérence
 */
export function buildFullContext(context: AIContext, userPrompt: string): string {
  const parts: string[] = []

  // Contexte de base (toujours présent)
  parts.push(buildBaseContext(context.project))

  // Contexte personnage si présent
  if (context.character) {
    parts.push(buildCharacterContext(context.project, context.character))
  }

  // Contexte panel si présent
  if (context.scene || context.chapter) {
    parts.push(buildPanelContext(
      context.project,
      context.chapter || null,
      context.scene || null,
      context.objectives
    ))
  }

  // Prompt utilisateur
  parts.push(`\n=== PROMPT UTILISATEUR ===`)
  parts.push(userPrompt)

  // Instructions finales
  parts.push(`\n=== INSTRUCTIONS ===`)
  parts.push('- Respecter la cohérence visuelle du projet')
  parts.push('- Format Webtoon vertical obligatoire')
  parts.push('- Maintenir la continuité avec les éléments existants')
  if (context.objectives?.constraints) {
    parts.push(`- Respecter les contraintes: ${context.objectives.constraints.join(', ')}`)
  }

  return parts.join('\n\n')
}

/**
 * Vérifie si une action IA respecte les objectifs
 * Selon Produit.md ligne 594-604
 */
export function validateAgainstObjectives(
  objectives: AIContext['objectives'],
  currentReadingTime?: number,
  currentPanels?: number
): { valid: boolean; warnings: string[] } {
  const warnings: string[] = []

  if (!objectives) {
    return { valid: true, warnings: [] }
  }

  // Vérification du temps de lecture (si défini)
  if (objectives.readingTime && currentReadingTime) {
    const [min, max] = objectives.readingTime.split('-').map(s => parseFloat(s.trim()))
    if (currentReadingTime < min) {
      warnings.push(`Temps de lecture trop court (${currentReadingTime}min < ${min}min cible)`)
    } else if (currentReadingTime > max) {
      warnings.push(`Temps de lecture trop long (${currentReadingTime}min > ${max}min cible)`)
    }
  }

  // Vérification des contraintes
  if (objectives.constraints && objectives.constraints.length > 0) {
    // Les contraintes sont vérifiées dans le prompt, mais on peut ajouter des warnings
    warnings.push(`Contraintes actives: ${objectives.constraints.length}`)
  }

  return {
    valid: warnings.length === 0,
    warnings
  }
}

/**
 * Construit un prompt optimisé pour l'API de génération d'images
 */
export function buildImageGenerationPrompt(
  context: AIContext,
  userPrompt: string,
  imageType: 'character' | 'panel' | 'transition' | 'cover'
): {
  prompt: string
  styleReference?: string
  format: string
} {
  let fullPrompt = ''

  switch (imageType) {
    case 'character':
      if (context.character) {
        fullPrompt = buildCharacterContext(context.project, context.character, userPrompt)
      } else {
        fullPrompt = `${buildBaseContext(context.project)}\n${userPrompt}`
      }
      break

    case 'panel':
      fullPrompt = buildPanelContext(
        context.project,
        context.chapter || null,
        context.scene || null,
        context.objectives,
        userPrompt
      )
      break

    case 'transition':
      fullPrompt = buildTransitionContext(
        context.project,
        context.chapter || null,
        userPrompt,
        userPrompt
      )
      break

    case 'cover':
      fullPrompt = `${buildBaseContext(context.project)}\n${userPrompt}\nImage de couverture Webtoon avec nom du projet intégré`
      break
  }

  // Utiliser identity_visual_reference_url en priorité, fallback sur style_reference_image_url pour compatibilité
  const identityVisualReference = context.project.identity_visual_reference_url || context.project.style_reference_image_url

  return {
    prompt: fullPrompt,
    styleReference: identityVisualReference || undefined,
    format: 'webtoon_vertical'
  }
}
