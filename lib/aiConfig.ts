/**
 * Configuration et validation des services IA
 * Vérifie que les clés API sont correctement configurées
 */

export interface AIConfigStatus {
  service: 'openai' | 'replicate' | 'huggingface' | 'grok' | 'none'
  configured: boolean
  hasKey: boolean
  keyValid: boolean
  message: string
  hasGrok?: boolean // Grok peut être utilisé pour améliorer les prompts même avec un autre service
}

/**
 * Vérifie la configuration des services IA
 */
export function checkAIConfig(): AIConfigStatus {
  const aiService = (process.env.AI_SERVICE || '').toLowerCase()
  
  // Détection automatique si AI_SERVICE n'est pas défini
  let detectedService: 'openai' | 'replicate' | 'huggingface' | 'grok' | 'none' = 'none'
  if (aiService === 'openai' || process.env.OPENAI_API_KEY) {
    detectedService = 'openai'
  } else if (aiService === 'replicate' || process.env.REPLICATE_API_TOKEN) {
    detectedService = 'replicate'
  } else if (aiService === 'huggingface' || process.env.HUGGINGFACE_API_KEY) {
    detectedService = 'huggingface'
  } else if (aiService === 'grok' || process.env.GROK_API_KEY) {
    detectedService = 'grok'
  }

  const service = aiService && ['openai', 'replicate', 'huggingface', 'grok'].includes(aiService) 
    ? aiService as 'openai' | 'replicate' | 'huggingface' | 'grok'
    : detectedService

  // Vérifier si Grok est disponible (peut être utilisé pour améliorer les prompts)
  const hasGrok = !!(process.env.GROK_API_KEY && process.env.GROK_API_KEY.length > 0)

  let hasKey = false
  let keyValid = false
  let message = ''

  switch (service) {
    case 'openai':
      hasKey = !!process.env.OPENAI_API_KEY
      keyValid = hasKey && (process.env.OPENAI_API_KEY?.startsWith('sk-') || false)
      message = keyValid 
        ? '✅ OpenAI DALL-E 3 configuré et prêt'
        : hasKey
        ? '⚠️ Clé OpenAI invalide (doit commencer par sk-)'
        : '❌ OpenAI non configuré (OPENAI_API_KEY manquante)'
      break

    case 'replicate':
      hasKey = !!process.env.REPLICATE_API_TOKEN
      keyValid = hasKey && (process.env.REPLICATE_API_TOKEN?.startsWith('r8_') || false)
      message = keyValid
        ? '✅ Replicate configuré et prêt'
        : hasKey
        ? '⚠️ Token Replicate invalide (doit commencer par r8_)'
        : '❌ Replicate non configuré (REPLICATE_API_TOKEN manquant)'
      break

    case 'huggingface':
      hasKey = !!process.env.HUGGINGFACE_API_KEY
      keyValid = hasKey && (process.env.HUGGINGFACE_API_KEY?.startsWith('hf_') || false)
      message = keyValid
        ? '✅ Hugging Face configuré et prêt'
        : hasKey
        ? '⚠️ Clé Hugging Face invalide (doit commencer par hf_)'
        : '❌ Hugging Face non configuré (HUGGINGFACE_API_KEY manquante)'
      break

    case 'grok':
      hasKey = !!process.env.GROK_API_KEY
      keyValid = hasKey && (process.env.GROK_API_KEY?.length || 0) > 0
      message = keyValid
        ? '✅ Grok (xAI) configuré et prêt'
        : '❌ Grok non configuré (GROK_API_KEY manquante)'
      break

    default:
      message = '❌ Aucun service IA configuré. Voir docs/AI_API_SETUP.md'
  }

  return {
    service,
    configured: keyValid,
    hasKey,
    keyValid,
    message,
    hasGrok
  }
}

/**
 * Retourne un message d'aide pour configurer l'IA
 */
export function getAISetupHelp(): string {
  const status = checkAIConfig()
  
  if (status.configured) {
    return `Service IA actif: ${status.service}`
  }

  return `
📝 Pour activer la génération IA, ajoutez dans .env.local :

1. Choisissez un service :
   AI_SERVICE=openai|replicate|huggingface|grok

2. Ajoutez la clé API correspondante :
   - OpenAI: OPENAI_API_KEY=sk-... (https://platform.openai.com/api-keys)
   - Replicate: REPLICATE_API_TOKEN=r8_... (https://replicate.com/account/api-tokens)
   - Hugging Face: HUGGINGFACE_API_KEY=hf_... (https://huggingface.co/settings/tokens)
   - Grok (xAI): GROK_API_KEY=xai-... (https://console.x.ai/api-keys)

3. Redémarrez le serveur (npm run dev)

📖 Documentation complète: docs/AI_API_SETUP.md
  `.trim()
}

