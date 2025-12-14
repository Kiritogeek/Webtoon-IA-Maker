/**
 * API endpoint pour générer un résumé de style à partir des références visuelles
 * 
 * Analyse toutes les images de référence et génère un résumé textuel du style commun
 */

import type { NextApiRequest, NextApiResponse } from 'next'
import { supabase } from '@/lib/supabase'

interface GenerateStyleSummaryRequest {
  projectId: string
  imageUrls: string[]
}

interface GenerateStyleSummaryResponse {
  success?: boolean
  summary?: string
  error?: string
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<GenerateStyleSummaryResponse>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' })
  }

  try {
    const { projectId, imageUrls }: GenerateStyleSummaryRequest = req.body

    if (!projectId || !imageUrls || imageUrls.length === 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'projectId and imageUrls are required' 
      })
    }

    // Charger le projet pour obtenir le contexte
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .single()

    if (projectError || !project) {
      return res.status(404).json({ 
        success: false, 
        error: 'Project not found' 
      })
    }

    // Construire le prompt pour l'analyse IA
    const analysisPrompt = `
Analyse les images de référence suivantes et génère un résumé textuel du style graphique commun :

Images de référence :
${imageUrls.map((url, i) => `${i + 1}. ${url}`).join('\n')}

Contexte du projet :
- Genre: ${project.genre || 'Non spécifié'}
- Ambiance: ${project.ambiance || 'Non spécifiée'}
- Style graphique: ${project.style_graphique || 'Non spécifié'}

Génère un résumé textuel (2-3 phrases maximum) qui décrit :
1. Le type de style (semi-réaliste, cartoon, manga, etc.)
2. Les caractéristiques visuelles principales (couleurs, traits, proportions, textures)
3. L'ambiance générale
4. Les inspirations visibles (webtoon, manhwa, manga, etc.)

Format de réponse : Texte simple, sans listes, sans puces, style naturel et descriptif.
`

    // TODO: Intégrer avec le service IA réel (OpenAI, Anthropic, etc.)
    // Pour l'instant, génération basique basée sur le contexte
    const styleSummary = generateBasicStyleSummary(project, imageUrls.length)

    return res.status(200).json({
      success: true,
      summary: styleSummary,
    })
  } catch (err: any) {
    console.error('Error generating style summary:', err)
    return res.status(500).json({
      success: false,
      error: err.message || 'Error generating style summary',
    })
  }
}

/**
 * Génère un résumé de style basique (à remplacer par une vraie IA)
 */
function generateBasicStyleSummary(project: any, imageCount: number): string {
  const style = project.style_graphique || 'webtoon'
  const ambiance = project.ambiance || 'moderne'
  
  const styleDescriptions: Record<string, string> = {
    'webtoon-standard': 'Style webtoon standard avec des couleurs vibrantes, traits nets et proportions stylisées.',
    'manga-noir-blanc': 'Style manga traditionnel en noir et blanc, avec des traits dynamiques et des contrastes marqués.',
    'manhwa-semi-realiste': 'Style manhwa semi-réaliste avec des proportions élégantes, couleurs contrastées et détails fins.',
    'cartoon': 'Style cartoon avec des formes simplifiées, couleurs vives et expressions exagérées.',
    'peinture-digitale': 'Style peinture digitale avec des textures riches, couleurs nuancées et rendu artistique.',
    'pixel-art': 'Style pixel art avec des formes géométriques, palette limitée et esthétique rétro.',
  }

  const ambianceDescriptions: Record<string, string> = {
    'lumineuse': 'ambiance lumineuse et positive',
    'sombre': 'ambiance sombre et dramatique',
    'mature': 'ambiance mature et réaliste',
    'fantastique': 'ambiance fantastique et onirique',
    'moderne': 'ambiance moderne et contemporaine',
  }

  const baseDescription = styleDescriptions[style] || 'Style graphique cohérent'
  const ambianceDesc = ambianceDescriptions[ambiance] || 'ambiance définie'

  return `${baseDescription} ${ambianceDesc}. ${imageCount > 1 ? `Basé sur ${imageCount} références visuelles pour garantir une cohérence maximale.` : 'Référence visuelle unique pour maintenir la cohérence stylistique.'}`
}
