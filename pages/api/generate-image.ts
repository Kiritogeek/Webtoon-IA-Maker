/**
 * API endpoint pour générer une image via IA avec contexte complet
 * 
 * Utilise aiContextBuilder pour garantir la cohérence graphique
 * selon les spécifications du Produit.md
 */

import type { NextApiRequest, NextApiResponse } from 'next'
import { supabase } from '@/lib/supabase'
import { buildImageGenerationPrompt, validateAgainstObjectives } from '@/lib/aiContextBuilder'
import { checkAIConfig } from '@/lib/aiConfig'
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
  message?: string // Message explicatif de l'IA
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

    // Améliorer le prompt avec Grok si disponible (même si ce n'est pas le service principal)
    // Cela permet d'avoir des prompts de meilleure qualité
    const grokKey = process.env.GROK_API_KEY
    if (grokKey && grokKey.length > 0) {
      try {
        const grokResponse = await fetch('https://api.x.ai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${grokKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'grok-beta',
            messages: [
              {
                role: 'system',
                content: 'Tu es un expert en création de prompts pour la génération d\'images de webtoon. Améliore le prompt fourni pour qu\'il soit plus détaillé, cohérent et adapté à la génération d\'images de style webtoon vertical. Réponds UNIQUEMENT avec le prompt amélioré, sans explication ni préambule.'
              },
              {
                role: 'user',
                content: `Améliore ce prompt pour la génération d'image webtoon: ${finalPrompt}`
              }
            ],
            max_tokens: 500,
            temperature: 0.7,
          }),
        })

        if (grokResponse.ok) {
          const grokData = await grokResponse.json()
          if (grokData.choices && grokData.choices[0]?.message?.content) {
            const improvedPrompt = grokData.choices[0].message.content.trim()
            // Utiliser le prompt amélioré seulement s'il est valide
            if (improvedPrompt && improvedPrompt.length > 0) {
              finalPrompt = improvedPrompt
              console.log('✅ Prompt amélioré avec Grok (xAI)')
            }
          }
        } else {
          const errorData = await grokResponse.json().catch(() => ({}))
          console.warn('⚠️ Erreur Grok API:', grokResponse.status, errorData)
        }
      } catch (grokError: any) {
        // Ne pas bloquer si Grok échoue, utiliser le prompt original
        console.warn('⚠️ Erreur lors de l\'amélioration du prompt avec Grok, utilisation du prompt original:', grokError.message || grokError)
      }
    }

    // ============================================
    // INTÉGRATION SERVICE IA
    // ============================================
    // Vérification et sélection automatique du service IA configuré
    
    let imageUrl: string | null = null
    const aiConfig = checkAIConfig()
    
    // Log de la configuration au démarrage (une seule fois)
    if (!aiConfig.configured) {
      console.warn('⚠️', aiConfig.message)
      console.warn('📝', 'Voir docs/AI_API_SETUP.md pour la configuration')
    } else {
      console.log('✅', aiConfig.message)
    }

    try {
      if (aiConfig.service === 'openai' && aiConfig.keyValid) {
        // ========== OPTION 1: OpenAI DALL-E 3 ==========
        let OpenAIClass: any
        try {
          // @ts-expect-error - Module optionnel, peut ne pas être installé
          const openaiModule = await import('openai')
          // Gérer les différents formats d'export
          OpenAIClass = openaiModule.default || openaiModule.OpenAI || openaiModule
          // Si c'est un objet avec une propriété default, l'utiliser
          if (typeof OpenAIClass !== 'function' && OpenAIClass?.default) {
            OpenAIClass = OpenAIClass.default
          }
          if (typeof OpenAIClass !== 'function') {
            throw new Error('OpenAI constructor not found in module')
          }
        } catch (importError: any) {
          console.error('Erreur import OpenAI:', importError)
          return res.status(500).json({ 
            error: `Le module openai n'est pas installé ou invalide. Erreur: ${importError.message}. Installez-le avec: npm install openai` 
          })
        }
        const openai = new OpenAIClass({
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
        console.log('✅ Image générée avec OpenAI DALL-E 3')

      } else if (aiConfig.service === 'replicate' && aiConfig.keyValid) {
        // ========== OPTION 2: Replicate (Stable Diffusion) ==========
        let Replicate: any
        try {
          // @ts-expect-error - Module optionnel, peut ne pas être installé
          Replicate = (await import('replicate')).default
        } catch (importError) {
          return res.status(500).json({ 
            error: 'Le module replicate n\'est pas installé. Installez-le avec: npm install replicate' 
          })
        }
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
        console.log('✅ Image générée avec Replicate')

      } else if (aiConfig.service === 'huggingface' && aiConfig.keyValid) {
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
        console.log('✅ Image générée avec Hugging Face')

      } else if (aiConfig.service === 'grok' && aiConfig.keyValid) {
        // ========== OPTION 4: Grok (xAI) - Génère avec service de fallback ==========
        // Le prompt a déjà été amélioré par Grok plus haut (si disponible)
        // Ici on génère juste l'image avec un service de fallback
        
        // Générer l'image avec un service de fallback
        // Priorité: OpenAI > Replicate > Hugging Face
        const openaiKey = process.env.OPENAI_API_KEY
        if (openaiKey && openaiKey.startsWith('sk-')) {
          // Utiliser OpenAI pour générer
          let OpenAI: any
          try {
            // @ts-expect-error - Module optionnel, peut ne pas être installé
            OpenAI = (await import('openai')).default
          } catch (importError) {
            throw new Error('Le module openai n\'est pas installé. Installez-le avec: npm install openai')
          }
          
          const openai = new OpenAI({
            apiKey: openaiKey
          })

          const response = await openai.images.generate({
            model: "dall-e-3",
            prompt: finalPrompt.substring(0, 1000),
            size: "1024x1792",
            quality: "standard",
            n: 1,
          })

          imageUrl = response.data[0].url || null
          console.log('✅ Image générée avec OpenAI (prompt amélioré par Grok)')
          
        } else {
          const replicateToken = process.env.REPLICATE_API_TOKEN
          if (replicateToken && replicateToken.startsWith('r8_')) {
            // Utiliser Replicate pour générer
            let Replicate: any
            try {
              // @ts-expect-error - Module optionnel, peut ne pas être installé
              Replicate = (await import('replicate')).default
            } catch (importError) {
              throw new Error('Le module replicate n\'est pas installé. Installez-le avec: npm install replicate')
            }
            
            const replicate = new Replicate({
              auth: replicateToken,
            })

            const output = await replicate.run(
              "stability-ai/stable-diffusion-xl-base-1.0:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b",
              {
                input: {
                  prompt: finalPrompt,
                  width: 800,
                  height: 1200,
                  num_outputs: 1,
                }
              }
            )

            imageUrl = Array.isArray(output) ? output[0] : output
            console.log('✅ Image générée avec Replicate (prompt amélioré par Grok)')
          } else {
            throw new Error('Grok nécessite un service de génération d\'images (OpenAI ou Replicate) pour générer les images. Configurez OPENAI_API_KEY ou REPLICATE_API_TOKEN dans .env.local.')
          }
        }

      } else {
        // ========== MODE DÉVELOPPEMENT: Placeholder ==========
        // Afficher un message d'erreur clair si aucun service n'est configuré
        console.error('❌', aiConfig.message)
        console.error('📝', 'Pour activer la génération IA:')
        console.error('   1. Ajoutez AI_SERVICE=openai|replicate|huggingface|grok dans .env.local')
        console.error('   2. Ajoutez la clé API correspondante')
        console.error('   3. Redémarrez le serveur (npm run dev)')
        console.error('📖', 'Documentation: docs/AI_API_SETUP.md')
        
        throw new Error(`Service IA non configuré: ${aiConfig.message}. Voir docs/AI_API_SETUP.md`)
      }

      if (!imageUrl) {
        throw new Error('Aucune image générée par le service IA')
      }

    } catch (aiError: any) {
      console.error('Erreur lors de la génération IA:', aiError)
      
      // Si c'est une erreur de configuration, retourner un message clair
      if (!aiConfig.configured) {
        return res.status(503).json({
          success: false,
          error: `${aiConfig.message}. Veuillez configurer une clé API dans .env.local (voir docs/AI_API_SETUP.md). Redémarrez le serveur après modification.`
        })
      }
      
      // Pour les autres erreurs, retourner l'erreur avec un placeholder
      return res.status(500).json({
        success: false,
        error: aiError.message || 'Erreur lors de la génération de l\'image'
      })
    }

    // Construire le message explicatif de l'IA
    let aiMessage = ''
    const usedGrok = grokKey && grokKey.length > 0
    if (project) {
      aiMessage = `Image générée avec le style du projet "${project.name}"`
      if (usedGrok) {
        aiMessage += ' (prompt optimisé par Grok)'
      }
      if (imageType === 'character') {
        aiMessage += '. Personnage cohérent avec l\'identité visuelle.'
      } else if (imageType === 'panel') {
        aiMessage += '. Panel adapté au format Webtoon vertical.'
      } else if (imageType === 'cover') {
        aiMessage += '. Couverture respectant l\'identité visuelle.'
      }
      if (warnings.length > 0) {
        aiMessage += ` ⚠️ ${warnings[0]}`
      }
    } else {
      aiMessage = usedGrok 
        ? 'Image générée avec succès (prompt optimisé par Grok).'
        : 'Image générée avec succès.'
    }

    return res.status(200).json({
      success: true,
      imageUrl,
      warnings: warnings.length > 0 ? warnings : undefined,
      message: aiMessage // Message explicatif pour l'utilisateur
    })

  } catch (error: any) {
    console.error('Error generating image:', error)
    return res.status(500).json({
      success: false,
      error: error.message || 'Erreur lors de la génération de l\'image'
    })
  }
}
