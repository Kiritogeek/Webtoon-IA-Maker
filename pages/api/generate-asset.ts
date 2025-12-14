/**
 * API endpoint pour générer un asset via IA
 * 
 * Génère un asset cohérent avec l'identité visuelle du projet
 */

import type { NextApiRequest, NextApiResponse } from 'next'
import { supabase } from '@/lib/supabase'
import { buildImageGenerationPrompt } from '@/lib/aiContextBuilder'
import type { Project, ProjectVisualReference } from '@/lib/supabase'

interface GenerateAssetRequest {
  projectId: string
  name: string
  description: string
  type: 'object' | 'effect' | 'symbol' | 'environment' | 'narrative' | 'custom'
  usageContext?: string | null
  emotionIntensity?: string | null
}

interface GenerateAssetResponse {
  success?: boolean
  asset?: {
    id: string
    name: string
    image_url: string
  }
  error?: string
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<GenerateAssetResponse>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' })
  }

  try {
    const { projectId, name, description, type, usageContext, emotionIntensity }: GenerateAssetRequest = req.body

    if (!projectId || !name || !type) {
      return res.status(400).json({
        success: false,
        error: 'projectId, name et type sont requis'
      })
    }

    // Charger le projet et ses références visuelles
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .single()

    if (projectError || !project) {
      return res.status(404).json({
        success: false,
        error: 'Projet non trouvé'
      })
    }

    // Charger les références visuelles si elles ne sont pas déjà dans le projet
    if (!project.visual_references || project.visual_references.length === 0) {
      const { data: references } = await supabase
        .from('project_visual_references')
        .select('image_url')
        .eq('project_id', projectId)
        .order('display_order', { ascending: true })
      
      if (references) {
        project.visual_references = references.map(ref => ({ image_url: ref.image_url }))
      } else {
        project.visual_references = []
      }
    }

    // Construire le prompt pour l'asset
    const assetTypeLabels: Record<string, string> = {
      object: 'objet (arme, outil, accessoire)',
      effect: 'effet visuel (feu, magie, explosion, aura)',
      symbol: 'symbole ou élément UI diégétique (icône, signe, glyphe)',
      environment: 'élément d\'environnement isolé (porte, table, rocher, arbre)',
      narrative: 'élément narratif (bulle, onomatopée stylisée)',
      custom: 'élément personnalisé'
    }

    let prompt = `Crée un asset de type "${assetTypeLabels[type] || type}" pour un webtoon vertical.\n\n`
    prompt += `Nom de l'asset: ${name}\n`
    prompt += `Description: ${description || 'Aucune description spécifique'}\n\n`

    if (usageContext) {
      prompt += `Contexte d'utilisation: ${usageContext}\n`
    }

    if (emotionIntensity) {
      prompt += `Intensité émotionnelle: ${emotionIntensity}\n`
    }

    prompt += `\nContraintes techniques:\n`
    prompt += `- Asset isolé sur fond transparent (PNG avec transparence)\n`
    prompt += `- Lisible et réutilisable dans différents contextes\n`
    prompt += `- Adapté à un format webtoon vertical\n`
    prompt += `- Style graphique strictement cohérent avec l'identité visuelle du projet\n`

    // Le contexte visuel sera ajouté automatiquement par buildImageGenerationPrompt
    // via project.visual_references et project.visual_style_summary

    // Construire le contexte IA pour la génération
    const aiContext = {
      project,
    }

    // Construire le prompt final avec le contexte du projet
    const { prompt: finalPrompt } = buildImageGenerationPrompt(
      aiContext,
      prompt,
      'panel' // Utiliser 'panel' comme type par défaut pour les assets
    )

    // Générer l'image via l'API de génération d'images
    const imageResponse = await fetch(`${req.headers.origin || 'http://localhost:3000'}/api/generate-image`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': req.headers.cookie || '',
      },
      body: JSON.stringify({
        prompt: finalPrompt,
        projectId,
        imageType: 'asset',
        format: 'png', // Format avec transparence pour les assets
      }),
    })

    if (!imageResponse.ok) {
      const errorData = await imageResponse.json()
      throw new Error(errorData.error || 'Erreur lors de la génération de l\'image')
    }

    const { imageUrl } = await imageResponse.json()

    if (!imageUrl) {
      throw new Error('Aucune image générée')
    }

    // Créer l'asset dans la base de données
    const { data: asset, error: assetError } = await supabase
      .from('assets')
      .insert([
        {
          project_id: projectId,
          name,
          description: description || null,
          type,
          usage_context: usageContext || null,
          emotion_intensity: emotionIntensity || null,
          image_url: imageUrl,
          created_by_ai: true,
        },
      ])
      .select()
      .single()

    if (assetError) {
      throw assetError
    }

    return res.status(200).json({
      success: true,
      asset: {
        id: asset.id,
        name: asset.name,
        image_url: asset.image_url,
      },
    })
  } catch (error: any) {
    console.error('Error generating asset:', error)
    return res.status(500).json({
      success: false,
      error: error.message || 'Erreur lors de la génération de l\'asset',
    })
  }
}

