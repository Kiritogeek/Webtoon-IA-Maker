/**
 * API endpoint pour générer un aperçu de cohérence
 * 
 * Génère des mini previews (visage, décor, panel) pour montrer ce que l'IA a compris
 */

import type { NextApiRequest, NextApiResponse } from 'next'
import { supabase } from '@/lib/supabase'
import { buildImageGenerationPrompt } from '@/lib/aiContextBuilder'

interface GenerateCoherencePreviewRequest {
  projectId: string
  imageUrls: string[]
}

interface GenerateCoherencePreviewResponse {
  success?: boolean
  preview?: {
    face?: string
    place?: string
    panel?: string
  }
  error?: string
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<GenerateCoherencePreviewResponse>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' })
  }

  try {
    const { projectId, imageUrls }: GenerateCoherencePreviewRequest = req.body

    if (!projectId || !imageUrls || imageUrls.length === 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'projectId and imageUrls are required' 
      })
    }

    // Charger le projet
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

    // Construire les prompts pour chaque type de preview
    const facePrompt = `Visage de personnage féminin, style cohérent avec les références, expression neutre, portrait, webtoon vertical`
    const placePrompt = `Décor intérieur moderne, style cohérent avec les références, ambiance calme, webtoon vertical`
    const panelPrompt = `Panel webtoon vertical, scène simple, style cohérent avec les références, format 800px de largeur`

    // TODO: Intégrer avec le service IA réel pour générer les images
    // Pour l'instant, retourner des placeholders
    // Dans une vraie implémentation, on appellerait l'API de génération d'images
    // avec les références visuelles et les prompts construits

    const preview = {
      // Placeholders - à remplacer par de vraies générations IA
      face: undefined,
      place: undefined,
      panel: undefined,
    }

    // Note: Pour l'instant, on retourne un objet vide car la génération d'images
    // nécessite une intégration avec un service IA (OpenAI DALL-E, Midjourney, etc.)
    // L'utilisateur verra un message indiquant que la fonctionnalité est en développement

    return res.status(200).json({
      success: true,
      preview,
    })
  } catch (err: any) {
    console.error('Error generating coherence preview:', err)
    return res.status(500).json({
      success: false,
      error: err.message || 'Error generating coherence preview',
    })
  }
}
