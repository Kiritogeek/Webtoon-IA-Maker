/**
 * API endpoint pour générer une image via IA avec contexte complet
 * 
 * Utilise aiContextBuilder pour garantir la cohérence graphique
 * selon les spécifications du Produit.md
 */

import type { NextApiRequest, NextApiResponse } from 'next'
import { supabase } from '@/lib/supabase'
import { buildImageGenerationPrompt, validateAgainstObjectives } from '@/lib/aiContextBuilder'
import type { Project, Character, Chapter, Scene } from '@/lib/supabase'

interface GenerateImageRequest {
  prompt: string
  styleReference?: string
  format?: string
  // Contexte optionnel pour construire le prompt complet
  projectId?: string
  chapterId?: string
  sceneId?: string
  characterId?: string
  imageType?: 'character' | 'panel' | 'transition' | 'cover'
  // Objectifs pour validation
  objectives?: {
    readingTime?: string
    narrativeType?: string
    visualDensity?: string
    constraints?: string[]
  }
  // Champs legacy pour compatibilité
  characters?: string
  characterName?: string
  existingImage?: string
}

interface GenerateImageResponse {
  success?: boolean
  imageUrl?: string
  warnings?: string[]
  error?: string
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<GenerateImageResponse>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' })
  }

  try {
    const {
      prompt,
      styleReference,
      format = 'webtoon_vertical',
      projectId,
      chapterId,
      sceneId,
      characterId,
      imageType = 'panel',
      objectives,
      // Legacy fields
      characters,
      characterName,
      existingImage
    }: GenerateImageRequest = req.body

    if (!prompt) {
      return res.status(400).json({ success: false, error: 'Prompt is required' })
    }

    // Charger le contexte si projectId est fourni
    let project: Project | null = null
    let chapter: Chapter | null = null
    let scene: Scene | null = null
    let character: Character | null = null

    if (projectId) {
      const { data: projectData, error: projectError } = await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .single()

      if (projectError) {
        console.error('Error loading project:', projectError)
      } else {
        project = projectData
      }

      // Charger le chapitre si nécessaire
      if (chapterId && project) {
        const { data: chapterData, error: chapterError } = await supabase
          .from('chapters')
          .select('*')
          .eq('id', chapterId)
          .single()

        if (!chapterError) {
          chapter = chapterData
        }
      }

      // Charger la scène si nécessaire
      if (sceneId && project) {
        const { data: sceneData, error: sceneError } = await supabase
          .from('scenes')
          .select('*')
          .eq('id', sceneId)
          .single()

        if (!sceneError) {
          scene = sceneData
        }
      }

      // Charger le personnage si nécessaire
      if (characterId && project) {
        const { data: characterData, error: characterError } = await supabase
          .from('characters')
          .select('*')
          .eq('id', characterId)
          .single()

        if (!characterError) {
          character = characterData
        }
      }
    }

    // Construire le contexte complet si on a le projet
    let finalPrompt = prompt
    let finalStyleReference = styleReference
    const warnings: string[] = []

    if (project) {
      // Utiliser le nouveau système de contexte
      const { prompt: contextPrompt, styleReference: contextStyle } = buildImageGenerationPrompt(
        {
          project,
          chapter: chapter || undefined,
          scene: scene || undefined,
          character: character || undefined,
          objectives
        },
        prompt,
        imageType
      )

      finalPrompt = contextPrompt
      finalStyleReference = contextStyle || styleReference

      // Valider contre les objectifs si fournis
      if (objectives) {
        const validation = validateAgainstObjectives(objectives)
        if (!validation.valid) {
          warnings.push(...validation.warnings)
        }
      }
    } else {
      // Mode legacy : ajouter les infos basiques si disponibles
      if (characters) {
        finalPrompt = `${prompt}. Characters: ${characters}`
      }
      if (characterName) {
        finalPrompt = `${prompt}. Personnage: ${characterName}`
      }
    }

    // ============================================
    // INTÉGRATION SERVICE IA
    // ============================================
    // Choisissez un service et décommentez la section correspondante
    // N'oubliez pas d'ajouter la clé API dans .env.local
    
    let imageUrl: string | null = null
    const aiService = process.env.AI_SERVICE || 'none'

    try {
      if (aiService === 'openai' && process.env.OPENAI_API_KEY) {
        // ========== OPTION 1: OpenAI DALL-E 3 ==========
        const OpenAI = (await import('openai')).default
        const openai = new OpenAI({
          apiKey: process.env.OPENAI_API_KEY
        })

        const response = await openai.images.generate({
          model: "dall-e-3",
          prompt: finalPrompt.substring(0, 1000), // DALL-E 3 limite à 1000 caractères
          size: "1024x1792", // Format vertical Webtoon (ratio ~1.75)
          quality: "standard",
          n: 1,
        })

        imageUrl = response.data[0].url || null

      } else if (aiService === 'replicate' && process.env.REPLICATE_API_TOKEN) {
        // ========== OPTION 2: Replicate (Stable Diffusion) ==========
        const Replicate = (await import('replicate')).default
        const replicate = new Replicate({
          auth: process.env.REPLICATE_API_TOKEN,
        })

        const input: any = {
          prompt: finalPrompt,
          width: 800,
          height: 1200,
          num_outputs: 1,
        }

        // Ajouter l'image de référence si disponible (img2img)
        if (finalStyleReference) {
          input.image = finalStyleReference
        }

        const output = await replicate.run(
          "stability-ai/stable-diffusion-xl-base-1.0:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b",
          { input }
        )

        imageUrl = Array.isArray(output) ? output[0] : output

      } else if (aiService === 'huggingface' && process.env.HUGGINGFACE_API_KEY) {
        // ========== OPTION 3: Hugging Face ==========
        const response = await fetch(
          "https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-xl-base-1.0",
          {
            headers: {
              Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
              "Content-Type": "application/json",
            },
            method: "POST",
            body: JSON.stringify({
              inputs: finalPrompt,
            }),
          }
        )

        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.error || 'Hugging Face API error')
        }

        const imageBlob = await response.blob()
        // Convertir le blob en URL (vous devrez l'uploader vers Supabase Storage)
        // Pour l'instant, on utilise un placeholder
        imageUrl = URL.createObjectURL(imageBlob)

      } else {
        // ========== MODE DÉVELOPPEMENT: Placeholder ==========
        // Afficher un message d'erreur clair si aucun service n'est configuré
        console.warn('⚠️ Aucun service IA configuré. Utilisation du placeholder.')
        console.warn('📝 Pour activer la génération IA, configurez un service dans .env.local:')
        console.warn('   - OPENAI_API_KEY pour OpenAI DALL-E 3')
        console.warn('   - REPLICATE_API_TOKEN pour Replicate')
        console.warn('   - HUGGINGFACE_API_KEY pour Hugging Face')
        console.warn('   - AI_SERVICE=openai|replicate|huggingface')
        
        imageUrl = `https://via.placeholder.com/800x1200/4F46E5/FFFFFF?text=${encodeURIComponent('Service IA non configuré - Voir docs/AI_SERVICE_INTEGRATION.md')}`
      }

      if (!imageUrl) {
        throw new Error('Aucune image générée par le service IA')
      }

    } catch (aiError: any) {
      console.error('Erreur lors de la génération IA:', aiError)
      
      // Si c'est une erreur de configuration, retourner un message clair
      const hasNoService = aiService === 'none' || 
        (!process.env.OPENAI_API_KEY && !process.env.REPLICATE_API_TOKEN && !process.env.HUGGINGFACE_API_KEY)
      
      if (hasNoService) {
        return res.status(503).json({
          success: false,
          error: 'Service IA non configuré. Veuillez configurer une clé API dans .env.local (voir docs/AI_SERVICE_INTEGRATION.md)',
          imageUrl: null
        })
      }
      
      // Pour les autres erreurs, retourner l'erreur avec un placeholder
      return res.status(500).json({
        success: false,
        error: aiError.message || 'Erreur lors de la génération de l\'image',
        imageUrl: null
      })
    }

    return res.status(200).json({
      success: true,
      imageUrl,
      warnings: warnings.length > 0 ? warnings : undefined
    })

  } catch (error: any) {
    console.error('Error generating image:', error)
    return res.status(500).json({
      success: false,
      error: error.message || 'Erreur lors de la génération de l\'image'
    })
  }
}
