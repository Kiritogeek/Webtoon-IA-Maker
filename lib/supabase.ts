import { createClient } from '@supabase/supabase-js'

// Types pour la base de données
export interface Project {
  id: string
  name: string
  description: string | null
  user_id: string
  // Configuration du projet
  genre?: string | null
  genre_custom?: string | null
  ambiance?: string | null
  ambiance_custom?: string | null
  style_graphique?: string | null
  style_reference_image_url?: string | null // Ancien champ, conservé pour compatibilité
  identity_visual_reference_url?: string | null // Template/Identité visuelle (utilisé par l'IA pour la cohérence graphique)
  style_prompt?: string | null
  format?: string | null
  // Nouvelle structure normalisée pour le background
  background_type?: 'preset' | 'custom' | null
  background_preset?: 'indigo-violet' | 'rose-violet' | 'dark-creative' | 'colorful-gradient' | 'dark-indigo' | null
  background_image_url?: string | null
  // Ancien champ (déprécié, conservé pour compatibilité)
  gradient_background?: string | null
  nombre_personnages?: number | null
  univers_principal?: string | null
  // Nouveau système d'identité visuelle (moodboard)
  visual_style_summary?: string | null // Résumé textuel généré automatiquement par l'IA
  visual_style_prompt?: string | null // Prompt de style ajustable manuellement (optionnel)
  // Références visuelles (chargées séparément, pas dans la table projects)
  visual_references?: ProjectVisualReference[] // Chargées via relation
  created_at: string
  updated_at: string
}

export interface ProjectVisualReference {
  id: string
  project_id: string
  image_url: string
  display_order: number
  created_at: string
  updated_at: string
}

export interface Character {
  id: string
  project_id: string
  name: string
  description: string | null
  image_url: string | null
  // Type de personnage
  type?: 'character' | 'monster' | 'enemy' | null
  // Identité visuelle
  face_description?: string | null
  body_description?: string | null
  face_image_url?: string | null
  body_image_url?: string | null
  // Histoire et personnalité
  history?: string | null
  personality_traits?: string[] | null
  // Images de référence (uploadées ou générées par IA)
  reference_images?: string[] | null
  created_at: string
  updated_at: string
}

export interface Chapter {
  id: string
  project_id: string
  title: string
  order: number
  description?: string | null
  cover_image_url?: string | null
  created_at: string
  updated_at: string
}

export interface Scene {
  id: string
  chapter_id: string
  title: string
  description: string | null
  image_url: string | null
  canvas_data: any | null
  order: number
  created_at: string
  updated_at: string
}

export interface Place {
  id: string
  project_id: string
  name: string
  description: string | null
  image_url: string | null
  // Ambiance du lieu
  ambiance?: string | null
  ambiance_custom?: string | null
  // Variations du lieu (JSON pour stocker plusieurs variations)
  variations?: string[] | null
  // Images de référence (uploadées ou générées par IA)
  reference_images?: string[] | null
  created_at: string
  updated_at: string
}

export interface Scenario {
  id: string
  project_id: string
  // Trame globale du scénario
  global_plot?: string | null
  // Arcs narratifs (JSON pour stocker plusieurs arcs)
  narrative_arcs?: Array<{
    id: string
    title: string
    description: string
    chapters: number[] // IDs des chapitres concernés
  }> | null
  created_at: string
  updated_at: string
}

export interface ChapterNotes {
  id: string
  chapter_id: string
  project_id: string
  notes?: string | null
  created_at: string
  updated_at: string
}

export interface Asset {
  id: string
  project_id: string
  name: string
  description: string | null
  type: 'object' | 'effect' | 'symbol' | 'environment' | 'narrative' | 'custom'
  usage_context: string | null // combat, magie, décor, émotion, etc.
  emotion_intensity: string | null // léger, violent, dramatique, épique
  image_url: string
  created_by_ai: boolean
  created_at: string
  updated_at: string
}

// Initialisation du client Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// Debug en développement pour vérifier le chargement des variables
if (typeof window === 'undefined' && process.env.NODE_ENV === 'development') {
  console.log('🔍 Debug - Variables d\'environnement chargées:')
  console.log('  NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? `${supabaseUrl.substring(0, 30)}...` : '(vide)')
  console.log('  NEXT_PUBLIC_SUPABASE_ANON_KEY:', supabaseAnonKey ? `${supabaseAnonKey.substring(0, 20)}...` : '(vide)')
  console.log('  URL valide:', supabaseUrl && !supabaseUrl.includes('votre-projet') && !supabaseUrl.includes('placeholder'))
  console.log('  Clé valide:', supabaseAnonKey && !supabaseAnonKey.includes('votre_cle') && !supabaseAnonKey.includes('placeholder'))
}

// Validation des variables d'environnement
const isValidUrl = (url: string): boolean => {
  if (!url || url === 'your_supabase_project_url') return false
  // Détecter les valeurs placeholder
  if (url.includes('votre-projet') || url.includes('placeholder') || url.includes('your-project')) return false
  try {
    const parsed = new URL(url)
    return parsed.protocol === 'http:' || parsed.protocol === 'https:'
  } catch {
    return false
  }
}

// Créer le client seulement si les variables sont valides
// Sinon, utiliser des valeurs par défaut pour éviter l'erreur au démarrage
const finalUrl = isValidUrl(supabaseUrl) 
  ? supabaseUrl 
  : 'https://placeholder.supabase.co'
const finalKey = supabaseAnonKey && 
  supabaseAnonKey !== 'your_supabase_anon_key' && 
  !supabaseAnonKey.includes('votre_cle') &&
  !supabaseAnonKey.includes('placeholder')
  ? supabaseAnonKey 
  : 'placeholder-key'

// Créer le client Supabase avec gestion d'erreur
let supabaseClient
try {
  supabaseClient = createClient(finalUrl, finalKey, {
    auth: {
      persistSession: typeof window !== 'undefined',
      autoRefreshToken: typeof window !== 'undefined',
      detectSessionInUrl: typeof window !== 'undefined'
    }
  })
} catch (error) {
  console.error('Erreur lors de la création du client Supabase:', error)
  // Créer un client minimal en cas d'erreur
  supabaseClient = createClient('https://placeholder.supabase.co', 'placeholder-key')
}

export const supabase = supabaseClient

// Avertissement en développement si les variables ne sont pas configurées
// Exécuter seulement côté serveur pour éviter les problèmes
if (typeof window === 'undefined' && process.env.NODE_ENV === 'development') {
  const hasPlaceholderValues = supabaseUrl.includes('votre-projet') || 
    supabaseUrl.includes('placeholder') || 
    supabaseAnonKey.includes('votre_cle') || 
    supabaseAnonKey.includes('placeholder') ||
    supabaseAnonKey === 'your_supabase_anon_key' ||
    supabaseUrl === 'your_supabase_project_url'

  if (!isValidUrl(supabaseUrl) || !supabaseAnonKey || hasPlaceholderValues) {
    console.warn('⚠️  Supabase non configuré. Veuillez remplir les variables dans .env.local')
    console.warn('   NEXT_PUBLIC_SUPABASE_URL et NEXT_PUBLIC_SUPABASE_ANON_KEY sont requis')
    console.warn('')
    if (hasPlaceholderValues) {
      console.warn('❌ ATTENTION: Vous avez encore des valeurs PLACEHOLDER dans .env.local!')
      console.warn('   Vous devez remplacer:')
      console.warn('   - "https://votre-projet.supabase.co" par votre vraie URL Supabase')
      console.warn('   - "votre_cle_anon_ici" par votre vraie clé anon')
      console.warn('')
    }
    console.warn('📝 Pour configurer Supabase:')
    console.warn('   1. Ouvrez le fichier .env.local à la racine du projet')
    console.warn('   2. Remplacez les valeurs placeholder par vos vraies clés Supabase')
    console.warn('      (Trouvez-les dans Supabase: Settings → API)')
    console.warn('   3. Redémarrez le serveur (Ctrl+C puis npm run dev)')
    console.warn('')
    console.warn('📖 Guide complet: docs/SUPABASE_SETUP.md')
  }
}

// Fonction utilitaire pour obtenir l'utilisateur avec gestion d'erreur
export async function getUser() {
  try {
    const { data: { user }, error } = await supabase.auth.getUser()
    
    // Si l'utilisateur n'existe plus (erreur 403), déconnecter
    if (error && (error.message.includes('user_not_found') || error.message.includes('JWT'))) {
      console.warn('Token invalide ou utilisateur supprimé, déconnexion...')
      try {
        await supabase.auth.signOut()
      } catch (signOutError) {
        // Ignorer les erreurs de déconnexion
        console.warn('Erreur lors de la déconnexion:', signOutError)
      }
      return { user: null, error: null }
    }
    
    return { user, error }
  } catch (error: any) {
    // En cas d'erreur (CORS, réseau, etc.), retourner null
    console.warn('Erreur lors de la récupération de l\'utilisateur:', error)
    return { user: null, error: error.message || 'Erreur inconnue' }
  }
}

