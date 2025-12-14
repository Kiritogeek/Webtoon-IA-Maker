import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { supabase, getUser } from '@/lib/supabase'
import { GENRES, AMBIANCES, STYLES_GRAPHIQUES, type ProjectConfig } from '@/lib/projectConfig'
import { getAllBackgroundPresets, getBackgroundPresetLabel, getProjectBackground, type BackgroundPreset } from '@/lib/backgroundPresets'

// Interface pour les designs de webtoon
interface WebtoonDesign {
  id: string
  name: string
  description?: string
  imageUrl: string
  style: string
  category?: string
  tags?: string[]
}

// Fonction helper pour obtenir les templates d'images depuis l'API externe ou Supabase Storage
// Priorité : API externe > Supabase Storage > Placeholder
const getStyleExamples = async (styleValue: string): Promise<{ imageUrl: string; design?: WebtoonDesign }[]> => {
  // Ne pas exécuter côté serveur (SSR)
  if (typeof window === 'undefined') {
    return []
  }
  
  try {
    // Essayer d'appeler l'API externe
    const response = await fetch(`/api/webtoon-designs?style=${encodeURIComponent(styleValue)}`)
    
    if (response.ok) {
      const data = await response.json()
      if (data.designs && data.designs.length > 0) {
        // Retourner les designs de l'API avec leurs métadonnées
        return data.designs.map((design: WebtoonDesign) => ({
          imageUrl: design.imageUrl,
          design: design,
        }))
      }
    }
    
    // Fallback vers Supabase Storage si l'API n'a pas retourné de résultats
    return await getStyleExamplesFromSupabase(styleValue)
  } catch (error) {
    console.error('Error getting style examples from API:', error)
    // Fallback vers Supabase Storage en cas d'erreur
    return await getStyleExamplesFromSupabase(styleValue)
  }
}

// Fonction de fallback vers Supabase Storage
const getStyleExamplesFromSupabase = async (styleValue: string): Promise<{ imageUrl: string; design?: WebtoonDesign }[]> => {
  // Ne pas exécuter côté serveur (SSR)
  if (typeof window === 'undefined') {
    return []
  }
  
  const bucketName = 'style-references'
  
  try {
    const getSupabaseImageUrl = (style: string, exampleNum: number, ext: string = 'jpg') => {
      const filePath = `style-examples/${style}/exemple-${exampleNum}.${ext}`
      const { data } = supabase.storage.from(bucketName).getPublicUrl(filePath)
      return data.publicUrl
    }
    
    // Retourner les URLs Supabase pour chaque style
    const examples: Record<string, string[]> = {
      'webtoon-standard': [
        getSupabaseImageUrl('webtoon-standard', 1, 'jpg'),
        getSupabaseImageUrl('webtoon-standard', 2, 'webp'),
        getSupabaseImageUrl('webtoon-standard', 3, 'jpg'),
      ],
      'manga-noir-blanc': [
        getSupabaseImageUrl('manga-noir-blanc', 1),
        getSupabaseImageUrl('manga-noir-blanc', 2),
        getSupabaseImageUrl('manga-noir-blanc', 3),
      ],
      'manhwa-semi-realiste': [
        getSupabaseImageUrl('manhwa-semi-realiste', 1),
        getSupabaseImageUrl('manhwa-semi-realiste', 2),
        getSupabaseImageUrl('manhwa-semi-realiste', 3),
      ],
      'cartoon': [
        getSupabaseImageUrl('cartoon', 1),
        getSupabaseImageUrl('cartoon', 2),
        getSupabaseImageUrl('cartoon', 3),
      ],
      'peinture-digitale': [
        getSupabaseImageUrl('peinture-digitale', 1),
        getSupabaseImageUrl('peinture-digitale', 2),
        getSupabaseImageUrl('peinture-digitale', 3),
      ],
      'pixel-art': [
        getSupabaseImageUrl('pixel-art', 1),
        getSupabaseImageUrl('pixel-art', 2),
        getSupabaseImageUrl('pixel-art', 3),
      ],
    }
    
    const urls = examples[styleValue] || []
    return urls.map((url, index) => ({
      imageUrl: url,
      design: {
        id: `supabase-${styleValue}-${index + 1}`,
        name: `Template ${index + 1}`,
        description: `Template de référence pour le style ${styleValue}`,
        imageUrl: url,
        style: styleValue,
      },
    }))
  } catch (error) {
    console.error('Error getting style examples from Supabase:', error)
    // Dernier fallback vers placeholder
    const styleColor = STYLES_GRAPHIQUES.find(s => s.value === styleValue)?.color || '#FF6B6B'
    const colorHex = styleColor.replace('#', '')
    return [
      {
        imageUrl: `https://via.placeholder.com/400x600/${colorHex}/FFFFFF?text=Exemple+1`,
        design: {
          id: `placeholder-${styleValue}-1`,
          name: 'Exemple 1',
          imageUrl: `https://via.placeholder.com/400x600/${colorHex}/FFFFFF?text=Exemple+1`,
          style: styleValue,
        },
      },
      {
        imageUrl: `https://via.placeholder.com/400x600/${colorHex}/FFFFFF?text=Exemple+2`,
        design: {
          id: `placeholder-${styleValue}-2`,
          name: 'Exemple 2',
          imageUrl: `https://via.placeholder.com/400x600/${colorHex}/FFFFFF?text=Exemple+2`,
          style: styleValue,
        },
      },
      {
        imageUrl: `https://via.placeholder.com/400x600/${colorHex}/FFFFFF?text=Exemple+3`,
        design: {
          id: `placeholder-${styleValue}-3`,
          name: 'Exemple 3',
          imageUrl: `https://via.placeholder.com/400x600/${colorHex}/FFFFFF?text=Exemple+3`,
          style: styleValue,
        },
      },
    ]
  }
}

// Fonction helper pour obtenir la couleur actuelle
const getCurrentColor = (config: Partial<ProjectConfig>) => {
  if (config.genre) {
    return GENRES.find(g => g.value === config.genre)?.color || '#FFFFFF'
  }
  if (config.ambiance) {
    return AMBIANCES.find(a => a.value === config.ambiance)?.color || '#FFFFFF'
  }
  if (config.style_graphique) {
    return STYLES_GRAPHIQUES.find(s => s.value === config.style_graphique)?.color || '#FFFFFF'
  }
  return '#FFFFFF'
}
import AuthGuard from '@/components/AuthGuard'

function NewProjectContent() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isGoingBack, setIsGoingBack] = useState(false)
  const [displayStep, setDisplayStep] = useState(1) // Étape affichée (pour l'animation)
  const [animationKey, setAnimationKey] = useState(0) // Clé pour forcer le re-render de l'animation
  const [justAdvanced, setJustAdvanced] = useState(false) // Indique si on vient de cliquer sur "Suivant"
  const [isSubmitting, setIsSubmitting] = useState(false) // Indique si on est en train de soumettre (animation de disparition)
  const [showSuccess, setShowSuccess] = useState(false) // Affiche le popup de succès
  const [gradientVisible, setGradientVisible] = useState(false) // Contrôle l'animation du dégradé
  const [styleExamples, setStyleExamples] = useState<{ imageUrl: string; design?: WebtoonDesign }[]>([]) // Exemples d'images pour le style sélectionné
  const [loadingExamples, setLoadingExamples] = useState(false) // Chargement des exemples
  const [selectedTemplateIndex, setSelectedTemplateIndex] = useState<number | null>(null) // Index du template sélectionné
  
  // État du formulaire
  const [config, setConfig] = useState<Partial<ProjectConfig>>({
    name: '',
    description: '',
    genre: undefined,
    genre_custom: '',
    ambiance: undefined,
    ambiance_custom: '',
    style_graphique: undefined,
    style_reference_image_url: '', // Conservé pour compatibilité
    identity_visual_reference_url: '', // Template/Identité visuelle
    style_prompt: '',
    format: 'vertical',
    univers_principal: '',
    background_type: undefined,
    background_preset: undefined,
    background_image_url: null,
  })

  const totalSteps = 7

  // Charger les exemples quand un style est sélectionné
  useEffect(() => {
    // Ne pas exécuter côté serveur (SSR)
    if (typeof window === 'undefined') {
      return
    }
    
    if (config.style_graphique && config.style_graphique !== 'custom') {
      setLoadingExamples(true)
      getStyleExamples(config.style_graphique)
        .then(examples => {
          setStyleExamples(examples)
          setLoadingExamples(false)
        })
        .catch((error) => {
          console.error('Error loading style examples:', error)
          setStyleExamples([])
          setLoadingExamples(false)
        })
    } else {
      setStyleExamples([])
      setSelectedTemplateIndex(null)
    }
  }, [config.style_graphique])

  const handleNext = () => {
    // Validation par étape
    if (currentStep === 1 && !config.name?.trim()) {
      setError('Le nom du projet est obligatoire')
      return
    }
    if (currentStep === 2 && !config.genre) {
      setError('Veuillez sélectionner un genre')
      return
    }
    if (currentStep === 2 && config.genre === 'custom' && !config.genre_custom?.trim()) {
      setError('Veuillez entrer votre genre personnalisé')
      return
    }
    if (currentStep === 3 && !config.ambiance) {
      setError('Veuillez sélectionner une ambiance')
      return
    }
    if (currentStep === 3 && config.ambiance === 'custom' && !config.ambiance_custom?.trim()) {
      setError('Veuillez décrire votre ambiance personnalisée')
      return
    }
    if (currentStep === 4 && !config.style_graphique) {
      setError('Veuillez sélectionner un style graphique')
      return
    }
    if (currentStep === 4 && config.style_graphique !== 'custom' && !config.identity_visual_reference_url) {
      setError('Veuillez sélectionner un template de référence')
      return
    }
    if (currentStep === 4 && config.style_graphique === 'custom' && !config.identity_visual_reference_url && !config.style_prompt?.trim()) {
      setError('Veuillez uploader une image de référence ou décrire votre style')
      return
    }
    // Étape 5 : Univers principal (optionnel, pas de validation nécessaire)
    // Étape 6 : Background (optionnel, pas de validation nécessaire)
    // Étape 7 : Validation finale (soumet le formulaire)

    setError(null)
    setIsGoingBack(false)
    if (currentStep < totalSteps) {
      const nextStep = currentStep + 1
      console.log('🟢 handleNext - Avant:', { currentStep, nextStep, justAdvanced, animationKey })
      // Mettre à jour les étapes d'abord
      setCurrentStep(nextStep)
      setDisplayStep(nextStep)
      // Ensuite activer justAdvanced et incrémenter animationKey pour déclencher l'animation
      setJustAdvanced(true)
      setAnimationKey(prev => {
        const newKey = prev + 1
        console.log('🟢 handleNext - Nouvelle animationKey:', newKey)
        return newKey
      })
      // Réinitialiser justAdvanced après que l'animation se soit déclenchée
      setTimeout(() => {
        console.log('🟢 handleNext - Réinitialisation justAdvanced')
        setJustAdvanced(false)
      }, 1100) // Après 1.1s (légèrement après la fin de l'animation de 1s)
    } else if (currentStep === totalSteps) {
      // Étape 7 : Validation finale - soumettre
      handleSubmit()
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setError(null)
      const newStep = currentStep - 1
      // Mettre à jour les étapes immédiatement (comme handleNext)
      setCurrentStep(newStep)
      setDisplayStep(newStep)
      // Activer isGoingBack et incrémenter animationKey pour déclencher l'animation
      setIsGoingBack(true)
      setAnimationKey(prev => prev + 1)
      // Réinitialiser isGoingBack après que l'animation se soit déclenchée
      setTimeout(() => {
        setIsGoingBack(false)
      }, 600) // Après 0.6s (légèrement après la fin de l'animation de 0.5s)
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Vérifier la taille (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setError('L\'image ne doit pas dépasser 5MB')
      return
    }

    // Vérifier le type
    if (!file.type.startsWith('image/')) {
      setError('Le fichier doit être une image')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const { user } = await getUser()
      if (!user) {
        router.push('/auth/login')
        return
      }

      // Générer un nom de fichier unique
      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}/${Date.now()}.${fileExt}`

      // Upload vers Supabase Storage
      const { data, error: uploadError } = await supabase.storage
        .from('style-references')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (uploadError) throw uploadError

      // Obtenir l'URL publique
      const { data: { publicUrl } } = supabase.storage
        .from('style-references')
        .getPublicUrl(data.path)

      setConfig({ ...config, identity_visual_reference_url: publicUrl })
    } catch (err: any) {
      setError(err.message || 'Erreur lors de l\'upload de l\'image')
    } finally {
      setLoading(false)
    }
  }

  // Obtenir le background du projet (ambiance sélectionnée)
  const getProjectBackgroundStyle = () => {
    // Créer un objet projet temporaire avec les valeurs de config pour utiliser getProjectBackground
    const tempProject = {
      background_type: config.background_type,
      background_preset: config.background_preset,
      background_image_url: config.background_image_url,
    }
    return getProjectBackground(tempProject)
  }

  const handleSubmit = async () => {
    setError(null)
    
    // Déclencher l'animation de disparition de l'étape 9 (1 seconde)
    setIsSubmitting(true)
    
    // Après 1 seconde, faire apparaître le dégradé (3 secondes)
    setTimeout(() => {
      setGradientVisible(true)
    }, 1000)
    
    // Après 4 secondes (1s disparition + 3s dégradé), créer le projet et afficher le popup
    setTimeout(async () => {
      setLoading(true)

      try {
        const { user } = await getUser()
        if (!user) {
          router.push('/auth/login')
          return
        }

        // Utiliser la nouvelle structure normalisée
        // Le gradient_background sera calculé côté front via getProjectBackground()
        // On stocke uniquement les données métier

        // Préparer les données de base du projet
        // S'assurer que toutes les valeurs sont soit définies soit null (pas undefined)
        const baseProjectData: any = {
          name: config.name,
          description: config.description || null,
          user_id: user.id,
          genre: config.genre || null,
          genre_custom: config.genre === 'custom' ? (config.genre_custom || null) : null,
          ambiance: config.ambiance || null,
          ambiance_custom: config.ambiance === 'custom' ? (config.ambiance_custom || null) : null,
          style_graphique: config.style_graphique || null,
          style_reference_image_url: config.style_reference_image_url || null, // Conservé pour compatibilité
          identity_visual_reference_url: config.identity_visual_reference_url || null, // Template/Identité visuelle
          style_prompt: config.style_prompt || null,
          format: config.format || 'vertical',
          univers_principal: config.univers_principal || null,
        }

        // Ajouter les champs de background
        const projectDataWithBackground = {
          ...baseProjectData,
          background_type: config.background_type || 'preset',
          background_preset: config.background_preset || null,
          background_image_url: config.background_image_url || null,
        }

        // Essayer d'abord avec les colonnes de background
        let { data, error: projectError } = await supabase
          .from('projects')
          .insert([projectDataWithBackground])
          .select()
          .single()

        // Si erreur liée à des colonnes manquantes, réessayer sans les colonnes de background
        if (projectError) {
          const errorMessage = projectError.message || JSON.stringify(projectError)
          const isColumnError = errorMessage.includes('column') || 
                               errorMessage.includes('does not exist') ||
                               errorMessage.includes('PGRST') ||
                               projectError.code === 'PGRST116' ||
                               projectError.code === '42P01'
          
          if (isColumnError) {
            console.warn('Colonnes de background non trouvées, création sans ces colonnes. Exécutez la migration SQL.')
            // Réessayer sans les colonnes de background
            const { data: retryData, error: retryError } = await supabase
              .from('projects')
              .insert([baseProjectData])
              .select()
              .single()
            
            if (retryError) {
              console.error('Erreur lors de la création du projet (sans background):', retryError)
              throw new Error(retryError.message || 'Erreur lors de la création du projet')
            }
            
            data = retryData
            projectError = null
          } else {
            console.error('Erreur lors de la création du projet:', projectError)
            console.error('Données envoyées:', projectDataWithBackground)
            throw new Error(errorMessage)
          }
        }

        // Afficher le popup de succès
        setShowSuccess(true)
        
        // Rediriger vers la page du projet après 2 secondes
        setTimeout(() => {
          router.push(`/project/${data.id}`)
        }, 2000)
      } catch (err: any) {
        setError(err.message || 'Erreur lors de la création du projet')
        setLoading(false)
        setIsSubmitting(false)
        setGradientVisible(false)
      }
    }, 4000) // Attendre 4 secondes (1s disparition + 3s dégradé)
  }

  // Calculer les couleurs et pourcentages pour la barre de progression
  const getProgressColors = () => {
    const colors: Array<{ color: string; width: number; left: number; isRemoving?: boolean; isNew?: boolean }> = []
    const colorWidth = 1 / 3 // Chaque couleur prend 1/3 du fond (3 couleurs = 100% du fond)
    
    // RÈGLE SIMPLE :
    // - Une couleur s'AJOUTE quand on clique sur "Suivant" (justAdvanced = true)
    // - Une couleur se RETIRE quand on clique sur "Précédent" (isGoingBack = true)
    // - Les 3 couleurs (étape 2, 3, 4) divisent le fond en 3 parties égales
    
    // Étape 2 complétée (genre) : de 0% à 33.33%
    // Afficher si : on a complété l'étape 2 ET (on est à l'étape 3+ OU on est en train de la retirer)
    if (config.genre) {
      // On affiche si on est à l'étape 3+ ou si on vient de revenir à l'étape 2 (donc on retire la couleur)
      const shouldShow = displayStep > 2 || (isGoingBack && currentStep === 2)
      if (shouldShow) {
        const genreColor = GENRES.find(g => g.value === config.genre)?.color || '#FFFFFF'
        // On retire quand on vient de revenir de l'étape 3 à 2 (currentStep est maintenant 2)
        const isRemoving = isGoingBack && currentStep === 2
        // On ajoute quand on passe de 2 à 3
        const isNew = justAdvanced && currentStep === 3 && !isGoingBack
        colors.push({ 
          color: genreColor, 
          width: colorWidth, 
          left: 0, 
          isRemoving,
          isNew
        })
      }
    }
    
    // Étape 3 complétée (ambiance) : de 33.33% à 66.66%
    // Afficher si : on a complété l'étape 3 ET (on est à l'étape 4+ OU on est en train de la retirer)
    if (config.ambiance) {
      // On affiche si on est à l'étape 4+ ou si on vient de revenir à l'étape 3 (donc on retire la couleur)
      const shouldShow = displayStep > 3 || (isGoingBack && currentStep === 3)
      if (shouldShow) {
        const ambianceColor = AMBIANCES.find(a => a.value === config.ambiance)?.color || '#FFFFFF'
        // On retire quand on vient de revenir de l'étape 4 à 3 (currentStep est maintenant 3)
        const isRemoving = isGoingBack && currentStep === 3
        // On ajoute quand on passe de 3 à 4
        const isNew = justAdvanced && currentStep === 4 && !isGoingBack
        colors.push({ 
          color: ambianceColor, 
          width: colorWidth, 
          left: colorWidth, // Position à 1/3
          isRemoving,
          isNew
        })
      }
    }
    
    // Étape 4 complétée (style) : de 66.66% à 100%
    // Afficher si : on a complété l'étape 4 ET (on est à l'étape 5+ OU on est en train de la retirer)
    if (config.style_graphique) {
      // On affiche si on est à l'étape 5+ ou si on vient de revenir à l'étape 4 (donc on retire la couleur)
      const shouldShow = displayStep > 4 || (isGoingBack && currentStep === 4)
      if (shouldShow) {
        const styleColor = STYLES_GRAPHIQUES.find(s => s.value === config.style_graphique)?.color || '#FFFFFF'
        // On retire quand on vient de revenir de l'étape 5 à 4 (currentStep est maintenant 4)
        const isRemoving = isGoingBack && currentStep === 4
        // On ajoute quand on passe de 4 à 5
        const isNew = justAdvanced && currentStep === 5 && !isGoingBack
        colors.push({ 
          color: styleColor, 
          width: colorWidth, 
          left: colorWidth * 2, // Position à 2/3 (66.66%)
          isRemoving,
          isNew
        })
      }
    }
    
    return colors
  }

  const progressColors = getProgressColors()

  const projectBackground = getProjectBackgroundStyle()

  return (
    <div 
      className={`min-h-screen p-4 sm:p-6 lg:p-8 relative overflow-hidden transition-all duration-500 ${!isSubmitting ? 'bg-darker' : ''} ${gradientVisible ? 'gradient-fade-in' : ''}`}
      style={{
        background: gradientVisible ? projectBackground : (isSubmitting ? projectBackground : undefined),
        backgroundSize: gradientVisible || isSubmitting ? 'cover' : undefined,
        backgroundPosition: gradientVisible || isSubmitting ? 'center' : undefined,
        backgroundRepeat: gradientVisible || isSubmitting ? 'no-repeat' : undefined,
        opacity: gradientVisible ? 1 : (isSubmitting ? 0 : 1),
      }}
    >
      {/* Popup de succès */}
      {showSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-darker/95 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border-2 border-accent/50 max-w-md mx-4 animate-pulse">
            <div className="text-center">
              <div className="text-6xl mb-4">✨</div>
              <h2 className="text-3xl font-bold text-white mb-2">Projet créé avec succès !</h2>
              <p className="text-white/70">Redirection en cours...</p>
            </div>
          </div>
        </div>
      )}
      {/* Barre de progression de fond */}
      {progressColors.length > 0 && !isSubmitting && (
        <div className="fixed inset-0 z-0 pointer-events-none">
          {progressColors.map((item, index) => (
            <div
              key={`progress-${item.color}-${item.left}`}
              className="absolute top-0 bottom-0 overflow-hidden"
              style={{
                left: `${item.left * 100}%`,
                width: `${item.width * 100}%`,
              }}
            >
              <div
                key={`color-${item.color}-${item.left}-${item.isRemoving ? `removing-${animationKey}` : item.isNew ? `new-${animationKey}` : `stable-${item.left}`}`}
                className={`absolute top-0 bottom-0 ${item.isRemoving ? 'right-0 empty-animation' : 'left-0'} ${item.isNew ? 'fill-animation' : ''}`}
                style={{
                  width: item.isNew ? '0%' : '100%', // Commencer à 0% pour les nouvelles couleurs afin que l'animation fonctionne
                  backgroundColor: item.color,
                  opacity: 0.25,
                }}
                ref={(el) => {
                  if (el && item.isNew) {
                    console.log('🟡 Rendu couleur nouvelle:', { 
                      color: item.color, 
                      left: item.left, 
                      isNew: item.isNew, 
                      className: el.className,
                      width: el.style.width,
                      animationKey 
                    })
                  }
                }}
              />
            </div>
          ))}
        </div>
      )}
      
      <div className="max-w-4xl mx-auto relative z-10">
        {/* Bouton retour en haut à gauche */}
        {!isSubmitting && (
          <button
            onClick={() => router.push('/dashboard')}
            className="fixed top-4 left-4 w-12 h-12 flex items-center justify-center bg-darker/90 backdrop-blur-sm border-2 border-white/50/50 rounded-full text-white hover:text-accent hover:border-accent transition font-semibold text-2xl shadow-lg z-50"
          >
            ←
          </button>
        )}

        {/* Header avec progression */}
        {!isSubmitting && (
          <div className="mb-8 text-center">
            <h1 className="text-3xl sm:text-4xl font-black text-white mb-4">
              Configuration du projet
            </h1>
            <div className="flex items-center gap-2 mb-2 max-w-md mx-auto">
              {Array.from({ length: totalSteps }).map((_, i) => (
                <div
                  key={i}
                  className={`flex-1 h-2 rounded-full transition ${
                    i + 1 <= currentStep
                      ? 'bg-gradient-to-r from-yellow to-orange'
                      : 'bg-dark-gray'
                  }`}
                />
              ))}
            </div>
            <p className="text-white/80 text-sm">
              Étape {currentStep} sur {totalSteps}
            </p>
          </div>
        )}

        {/* Formulaire */}
        <div 
          className={`bg-darker/90 backdrop-blur-sm rounded-3xl shadow-2xl p-6 sm:p-8 border-2 max-w-2xl mx-auto transition-colors duration-300 ${isSubmitting ? 'fade-out' : ''}`}
          style={{
            borderColor: currentStep === 1 
              ? 'rgba(255, 255, 255, 0.5)'
              : currentStep === 2 && config.genre
              ? `${GENRES.find(g => g.value === config.genre)?.color || '#FFFFFF'}80`
              : currentStep === 3 && config.ambiance
              ? `${AMBIANCES.find(a => a.value === config.ambiance)?.color || '#FFFFFF'}80`
              : currentStep === 4 && config.style_graphique
              ? `${STYLES_GRAPHIQUES.find(s => s.value === config.style_graphique)?.color || '#FFFFFF'}80`
              : 'rgba(255, 255, 255, 0.5)'
          }}
        >
          {error && (
            <div className="mb-6 p-4 bg-red/30 border-2 border-red rounded-xl text-white">
              {error}
            </div>
          )}

          {/* Étape 1 : Nom du projet */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-white mb-2">
                  Nom du projet
                </h2>
                <p className="text-white/70 mb-4 text-sm">
                  Donnez une identité à votre projet. Vous pourrez le modifier plus tard.
                </p>
              </div>
              <div>
                <label className="block text-sm font-bold text-white mb-2">
                  Nom du projet <span className="text-accent">*</span>
                </label>
                <input
                  type="text"
                  value={config.name || ''}
                  onChange={(e) => setConfig({ ...config, name: e.target.value })}
                  placeholder="Ex: Chroniques de Solaris, Le Chant des Ombres..."
                  className="w-full px-4 py-3 bg-darkest border-2 border-white/50 rounded-xl focus:outline-none focus:border-white transition text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-white mb-2">
                  Description (optionnel)
                </label>
                <textarea
                  value={config.description || ''}
                  onChange={(e) => setConfig({ ...config, description: e.target.value })}
                  placeholder="Décrivez brièvement votre projet..."
                  rows={4}
                  className="w-full px-4 py-3 bg-darkest border-2 border-white/50 rounded-xl focus:outline-none focus:border-white transition text-white resize-none"
                />
              </div>
            </div>
          )}

          {/* Étape 2 : Genre */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-white mb-2">
                  Genre principal du Webtoon
                </h2>
                <p className="text-white/70 mb-4 text-sm">
                  Sélectionnez le genre principal de votre webtoon. L'IA utilisera cette information pour adapter les suggestions.
                </p>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
                {GENRES.map((genre) => {
                  const isSelected = config.genre === genre.value
                  return (
                    <button
                      key={genre.value}
                      onClick={() => {
                        setConfig({ ...config, genre: genre.value, genre_custom: genre.value === 'custom' ? config.genre_custom : '' })
                      }}
                      className="p-4 rounded-xl border-2 transition bg-darker/90 backdrop-blur-sm shadow-lg text-white"
                      style={{
                        borderColor: isSelected ? genre.color : 'rgba(255, 255, 255, 0.5)',
                        backgroundColor: isSelected ? `${genre.color}20` : 'rgba(26, 26, 26, 0.9)'
                      }}
                      onMouseEnter={(e) => {
                        if (!isSelected) {
                          e.currentTarget.style.borderColor = genre.color
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isSelected) {
                          e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.5)'
                        }
                      }}
                    >
                      {genre.label}
                    </button>
                  )
                })}
              </div>
              {config.genre === 'custom' && (
                <div>
                  <label className="block text-sm font-bold text-white mb-2">
                    Votre genre personnalisé <span className="text-accent">*</span>
                  </label>
                  <input
                    type="text"
                    value={config.genre_custom || ''}
                    onChange={(e) => setConfig({ ...config, genre_custom: e.target.value })}
                    placeholder="Ex: Cyberpunk Romance, Fantasy Comédie..."
                    className="w-full px-4 py-3 bg-darkest border-2 border-white/50 rounded-xl focus:outline-none focus:border-white transition text-white"
                  />
                </div>
              )}
            </div>
          )}

          {/* Étape 3 : Ambiance */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-white mb-2">
                  Ambiance générale
                </h2>
                <p className="text-white/70 mb-4 text-sm">
                  Choisissez l'ambiance générale de votre webtoon. Cela influencera le style visuel, les couleurs et l'atmosphère.
                </p>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
                {AMBIANCES.map((ambiance) => {
                  const isSelected = config.ambiance === ambiance.value
                  return (
                    <button
                      key={ambiance.value}
                      onClick={() => {
                        setConfig({ ...config, ambiance: ambiance.value, ambiance_custom: ambiance.value === 'custom' ? config.ambiance_custom : '' })
                      }}
                      className="p-4 rounded-xl border-2 transition bg-darker/90 backdrop-blur-sm shadow-lg text-white"
                      style={{
                        borderColor: isSelected ? ambiance.color : 'rgba(255, 255, 255, 0.5)',
                        backgroundColor: isSelected ? `${ambiance.color}20` : 'rgba(26, 26, 26, 0.9)'
                      }}
                      onMouseEnter={(e) => {
                        if (!isSelected) {
                          e.currentTarget.style.borderColor = ambiance.color
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isSelected) {
                          e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.5)'
                        }
                      }}
                    >
                      {ambiance.label}
                    </button>
                  )
                })}
              </div>
              {config.ambiance === 'custom' && (
                <div>
                  <label className="block text-sm font-bold text-white mb-2">
                    Décrivez votre ambiance <span className="text-accent">*</span>
                  </label>
                  <textarea
                    value={config.ambiance_custom || ''}
                    onChange={(e) => setConfig({ ...config, ambiance_custom: e.target.value })}
                    placeholder="Ex: Ambiance mystérieuse avec des tons bleus et violets, atmosphère onirique..."
                    rows={4}
                    className="w-full px-4 py-3 bg-darkest border-2 border-white/50 rounded-xl focus:outline-none focus:border-white transition text-white resize-none"
                  />
                </div>
              )}
            </div>
          )}

          {/* Étape 4 : Style graphique */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-white mb-2">
                  Style graphique souhaité
                </h2>
                <p className="text-white/70 mb-4 text-sm">
                  Sélectionnez le style graphique de votre webtoon. Vous pouvez uploader une image de référence ou décrire votre style.
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                {STYLES_GRAPHIQUES.map((style) => {
                  const isSelected = config.style_graphique === style.value
                  return (
                    <button
                      key={style.value}
                      onClick={async () => {
                        setConfig({ 
                          ...config, 
                          style_graphique: style.value,
                          style_reference_image_url: style.value !== 'custom' ? '' : config.style_reference_image_url, // Conservé pour compatibilité
                          identity_visual_reference_url: style.value !== 'custom' ? '' : config.identity_visual_reference_url,
                          style_prompt: style.value !== 'custom' ? '' : config.style_prompt
                        })
                        // Réinitialiser la sélection de template
                        setSelectedTemplateIndex(null)
                        // Charger les exemples du style sélectionné
                        if (style.value !== 'custom') {
                          setLoadingExamples(true)
                          try {
                            const examples = await getStyleExamples(style.value)
                            setStyleExamples(examples)
                          } catch (error) {
                            console.error('Error loading style examples:', error)
                            setStyleExamples([])
                          } finally {
                            setLoadingExamples(false)
                          }
                        } else {
                          setStyleExamples([])
                        }
                      }}
                      className="p-4 rounded-xl border-2 transition text-left bg-darker/90 backdrop-blur-sm shadow-lg text-white"
                      style={{
                        borderColor: isSelected ? style.color : 'rgba(255, 255, 255, 0.5)',
                        backgroundColor: isSelected ? `${style.color}20` : 'rgba(26, 26, 26, 0.9)'
                      }}
                      onMouseEnter={(e) => {
                        if (!isSelected) {
                          e.currentTarget.style.borderColor = style.color
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isSelected) {
                          e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.5)'
                        }
                      }}
                    >
                      <div className="font-bold mb-1">{style.label}</div>
                      <div className="text-sm opacity-80">{style.description}</div>
                    </button>
                  )
                })}
              </div>
              
              {/* Templates du style sélectionné */}
              {config.style_graphique && config.style_graphique !== 'custom' && (
                <div className="mt-6">
                  <h3 className="text-lg font-bold text-white mb-2 text-center">
                    Sélectionnez un template de référence
                  </h3>
                  <p className="text-white/60 text-sm mb-4 text-center">
                    Ce template définira le style graphique de tous vos personnages, lieux et assets générés par l'IA
                  </p>
                  {loadingExamples ? (
                    <div className="grid grid-cols-3 gap-4">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="aspect-[2/3] bg-darkest/50 rounded-xl animate-pulse flex items-center justify-center">
                          <span className="text-white/30 text-sm">Chargement...</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 gap-4">
                      {styleExamples.map((example, index: number) => {
                        const isSelected = selectedTemplateIndex === index
                        const styleColor = STYLES_GRAPHIQUES.find(s => s.value === config.style_graphique)?.color || '#FF6B6B'
                        const colorHex = styleColor.replace('#', '')
                        const design = example.design
                        
                        return (
                          <button
                            key={design?.id || index}
                            type="button"
                            onClick={() => {
                              setSelectedTemplateIndex(index)
                              // Sauvegarder l'URL du template sélectionné dans l'identité visuelle
                              setConfig({
                                ...config,
                                identity_visual_reference_url: example.imageUrl
                              })
                            }}
                            className={`relative aspect-[2/3] rounded-xl overflow-hidden border-2 transition group ${
                              isSelected 
                                ? 'border-primary ring-4 ring-primary/50 shadow-lg scale-105' 
                                : 'border-white/30 hover:border-white/60'
                            }`}
                          >
                            <img
                              src={example.imageUrl}
                              alt={design?.name || `Template ${index + 1} du style ${STYLES_GRAPHIQUES.find(s => s.value === config.style_graphique)?.label}`}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              crossOrigin="anonymous"
                              referrerPolicy="no-referrer"
                              loading="lazy"
                              decoding="async"
                              onError={(e) => {
                                // Fallback si l'image ne charge pas
                                const target = e.currentTarget as HTMLImageElement
                                target.src = `https://via.placeholder.com/400x600/${colorHex}/FFFFFF?text=Exemple+${index + 1}`
                                target.removeAttribute('crossorigin')
                                target.removeAttribute('referrerpolicy')
                              }}
                              onLoad={() => {
                                // Image chargée avec succès, ignorer les warnings de cookies
                              }}
                            />
                            {isSelected && (
                              <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                                <div className="bg-primary text-white rounded-full p-2 shadow-lg">
                                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                  </svg>
                                </div>
                              </div>
                            )}
                            <div className="absolute bottom-2 left-2 right-2">
                              <div className={`text-xs font-semibold px-2 py-1 rounded ${
                                isSelected 
                                  ? 'bg-primary text-white' 
                                  : 'bg-black/60 text-white/80'
                              }`}>
                                {design?.name || `Template ${index + 1}`}
                              </div>
                              {design?.description && (
                                <div className="bg-black/40 backdrop-blur-sm rounded-lg px-2 py-1 text-white/80 text-xs mt-1 text-center line-clamp-2">
                                  {design.description}
                                </div>
                              )}
                            </div>
                          </button>
                        )
                      })}
                    </div>
                  )}
                  {selectedTemplateIndex !== null && (
                    <div className="mt-4 p-3 bg-primary/10 border border-primary/30 rounded-xl">
                      <p className="text-primary text-sm font-semibold text-center">
                        ✓ Template sélectionné - Toutes les générations IA utiliseront ce style comme référence
                      </p>
                    </div>
                  )}
                </div>
              )}
              
              {config.style_graphique === 'custom' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-white mb-2">
                      Uploader une image de référence
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="w-full px-4 py-3 bg-darkest border-2 border-white/50 rounded-xl focus:outline-none focus:border-white transition text-white"
                    />
                    {(config.identity_visual_reference_url || config.style_reference_image_url) && (
                      <div className="mt-3">
                        <img
                          src={config.identity_visual_reference_url || config.style_reference_image_url}
                          alt="Référence"
                          className="max-w-full h-32 object-cover rounded-xl border-2 border-white/50/50"
                        />
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-white mb-2">
                      Ou décrivez votre style visuel
                    </label>
                    <textarea
                      value={config.style_prompt || ''}
                      onChange={(e) => setConfig({ ...config, style_prompt: e.target.value })}
                      placeholder="Ex: Style aquarelle doux avec des couleurs pastel, traits fins et délicats..."
                      rows={4}
                      className="w-full px-4 py-3 bg-darkest border-2 border-white/50 rounded-xl focus:outline-none focus:border-white transition text-white resize-none"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Étape 5 : Univers principal */}
          {currentStep === 5 && (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-white mb-2">
                  Univers principal
                </h2>
                <p className="text-white/70 mb-4 text-sm">
                  Décrivez l'univers dans lequel se déroule votre webtoon. Cette information aidera l'IA à suggérer des lieux, vêtements, props et cadrages adaptés.
                </p>
              </div>
              <div>
                <label className="block text-sm font-bold text-white mb-2">
                  Univers principal <span className="text-white/50 text-xs">(optionnel)</span>
                </label>
                <textarea
                  value={config.univers_principal || ''}
                  onChange={(e) => setConfig({ ...config, univers_principal: e.target.value })}
                  placeholder="Ex: Un royaume médiéval en guerre, Un lycée moderne, Un monde futuriste cyberpunk..."
                  rows={4}
                  className="w-full px-4 py-3 bg-darkest border-2 border-white/50 rounded-xl focus:outline-none focus:border-white transition text-white resize-none"
                />
                <p className="text-white/50 text-xs mt-2">
                  Cette description servira de base à l'IA pour générer des suggestions contextuelles.
                </p>
              </div>
            </div>
          )}

          {/* Étape 6 : Choix du background */}
          {currentStep === 6 && (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-white mb-2">
                  Ambiance visuelle
                </h2>
                <p className="text-white/70 mb-4 text-sm">
                  Choisissez l'ambiance visuelle de votre projet. Vous pourrez la modifier dans les paramètres.
                </p>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {getAllBackgroundPresets().map((preset) => (
                  <button
                    key={preset.value}
                    onClick={() => setConfig({ 
                      ...config, 
                      background_type: 'preset',
                      background_preset: preset.value,
                      background_image_url: null, // Réinitialiser l'image si on choisit un preset
                    })}
                    className={`p-6 rounded-xl border-2 transition ${
                      config.background_type === 'preset' && config.background_preset === preset.value
                        ? 'border-yellow bg-yellow/20'
                        : 'border-white/50 hover:border-white/80 bg-darkest/50'
                    }`}
                  >
                    <div className={`h-24 rounded-lg mb-3 bg-gradient-to-r ${preset.previewColor}`}></div>
                    <p className="text-white font-semibold text-sm">{preset.label}</p>
                  </button>
                ))}

                {/* Personnalisé */}
                <button
                  onClick={() => setConfig({ 
                    ...config, 
                    background_type: 'custom',
                    background_preset: null, // Réinitialiser le preset si on choisit custom
                  })}
                  className={`p-6 rounded-xl border-2 transition ${
                    config.background_type === 'custom'
                      ? 'border-yellow bg-yellow/20'
                      : 'border-white/50 hover:border-white/80 bg-darkest/50'
                  }`}
                >
                  <div className="h-24 rounded-lg mb-3 bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 flex items-center justify-center relative overflow-hidden">
                    {!config.background_image_url ? (
                      <>
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-white/60">
                          <svg className="w-8 h-8 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span className="text-xs font-medium">Image</span>
                        </div>
                      </>
                    ) : (
                      <img
                        src={config.background_image_url}
                        alt="Background personnalisé"
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  <p className="text-white font-semibold text-sm">Image personnalisée</p>
                </button>
              </div>

              {/* Si personnalisé, afficher l'upload d'image */}
              {config.background_type === 'custom' && (
                <div className="mt-6 p-4 bg-darkest/50 rounded-xl border-2 border-white/20">
                  <label className="block text-sm font-bold text-white mb-2">
                    Image de background personnalisée
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={async (e) => {
                      const file = e.target.files?.[0]
                      if (!file) return
                      
                      // Vérifier la taille (5MB max)
                      if (file.size > 5 * 1024 * 1024) {
                        setError('L\'image ne doit pas dépasser 5MB')
                        return
                      }
                      
                      setLoading(true)
                      try {
                        const { user } = await getUser()
                        if (!user) {
                          router.push('/auth/login')
                          return
                        }
                        
                        const fileExt = file.name.split('.').pop()
                        const fileName = `${user.id}/backgrounds/${Date.now()}.${fileExt}`
                        
                        const { data: uploadData, error: uploadError } = await supabase.storage
                          .from('images')
                          .upload(fileName, file)
                        
                        if (uploadError) throw uploadError
                        
                        const { data: { publicUrl } } = supabase.storage
                          .from('images')
                          .getPublicUrl(fileName)
                        
                        setConfig({ ...config, background_image_url: publicUrl })
                      } catch (err: any) {
                        setError(err.message || 'Erreur lors de l\'upload de l\'image')
                      } finally {
                        setLoading(false)
                      }
                    }}
                    className="hidden"
                    id="background-image-upload"
                  />
                  <label
                    htmlFor="background-image-upload"
                    className="block w-full px-4 py-3 bg-darkest border-2 border-white/50 rounded-xl hover:border-white transition cursor-pointer text-center text-white"
                  >
                    {config.background_image_url ? '📷 Changer l\'image' : '📷 Uploader une image'}
                  </label>
                  {config.background_image_url && (
                    <div className="mt-4">
                      <img
                        src={config.background_image_url}
                        alt="Background personnalisé"
                        className="w-full h-48 object-cover rounded-lg"
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Étape 7 : Validation finale */}
          {currentStep === 7 && (
            <div className={`space-y-6 ${isSubmitting ? 'fade-out' : ''}`}>
              <div className="text-center">
                <h2 className="text-2xl font-bold text-white mb-2">
                  Validation finale
                </h2>
                <p className="text-white/70 mb-6 text-sm">
                  Vérifiez les informations de votre projet avant de le créer.
                </p>
              </div>
              <div className="bg-darkest/50 rounded-xl p-6 space-y-4 border-2 border-white/20">
                <div className="flex justify-between items-start">
                  <span className="text-white/70 font-semibold">Nom :</span>
                  <span className="text-white text-right">{config.name}</span>
                </div>
                {config.description && (
                  <div className="flex justify-between items-start">
                    <span className="text-white/70 font-semibold">Description :</span>
                    <span className="text-white text-right text-sm">{config.description}</span>
                  </div>
                )}
                <div className="flex justify-between items-start">
                  <span className="text-white/70 font-semibold">Genre :</span>
                  <span className="text-white text-right">
                    {config.genre === 'custom' 
                      ? config.genre_custom 
                      : GENRES.find(g => g.value === config.genre)?.label}
                  </span>
                </div>
                <div className="flex justify-between items-start">
                  <span className="text-white/70 font-semibold">Ambiance :</span>
                  <span className="text-white text-right">
                    {config.ambiance === 'custom'
                      ? config.ambiance_custom
                      : AMBIANCES.find(a => a.value === config.ambiance)?.label}
                  </span>
                </div>
                <div className="flex justify-between items-start">
                  <span className="text-white/70 font-semibold">Style visuel :</span>
                  <span className="text-white text-right">
                    {STYLES_GRAPHIQUES.find(s => s.value === config.style_graphique)?.label}
                  </span>
                </div>
                <div className="flex justify-between items-start">
                  <span className="text-white/70 font-semibold">Format :</span>
                  <span className="text-white text-right capitalize">
                    {config.format === 'vertical' ? 'Vertical' : 'Horizontal'}
                  </span>
                </div>
                {config.univers_principal && (
                  <div className="flex justify-between items-start">
                    <span className="text-white/70 font-semibold">Univers principal :</span>
                    <span className="text-white text-right text-sm">{config.univers_principal}</span>
                  </div>
                )}
                <div className="flex justify-between items-start">
                  <span className="text-white/70 font-semibold">Background :</span>
                  <span className="text-white text-right">
                    {config.background_type === 'preset' && config.background_preset 
                      ? getBackgroundPresetLabel(config.background_preset)
                      : config.background_type === 'custom' 
                        ? 'Image personnalisée' 
                        : 'Par défaut'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Boutons de navigation */}
          <div className="flex justify-between gap-4 mt-8">
            <button
              onClick={handleBack}
              disabled={currentStep === 1 || loading}
              className="px-6 py-3 text-white bg-dark-gray rounded-xl hover:bg-dark-gray/80 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ← Précédent
            </button>
            <button
              onClick={handleNext}
              disabled={loading}
              className="px-6 py-3 bg-gradient-to-r from-yellow to-orange text-white rounded-xl hover:shadow-lg transition font-semibold disabled:opacity-50"
            >
              {loading ? '⏳' : currentStep === totalSteps ? '✨ Créer le projet' : 'Suivant →'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export async function getServerSideProps() {
  // Désactiver le pré-rendu pour cette page dynamique
  return {
    props: {},
  }
}

export default function NewProject() {
  return (
    <AuthGuard>
      <NewProjectContent />
    </AuthGuard>
  )
}

