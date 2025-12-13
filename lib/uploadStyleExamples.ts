/**
 * Helper pour uploader des images d'exemple de style dans Supabase Storage
 * 
 * Utilisation :
 * 1. Créez un bucket "style-examples" dans Supabase Storage (public)
 * 2. Utilisez cette fonction pour uploader vos images
 */

import { supabase } from './supabase'

/**
 * Upload une image d'exemple pour un style graphique
 * @param styleValue - La valeur du style (ex: 'webtoon-standard')
 * @param imageFile - Le fichier image à uploader
 * @param exampleNumber - Le numéro de l'exemple (1, 2 ou 3)
 * @returns L'URL publique de l'image uploadée
 */
export async function uploadStyleExampleImage(
  styleValue: string,
  imageFile: File,
  exampleNumber: number
): Promise<string> {
  // Vérifier que le fichier est une image
  if (!imageFile.type.startsWith('image/')) {
    throw new Error('Le fichier doit être une image')
  }

  // Vérifier la taille (5MB max)
  if (imageFile.size > 5 * 1024 * 1024) {
    throw new Error('L\'image ne doit pas dépasser 5MB')
  }

  // Générer le nom de fichier
  const fileExt = imageFile.name.split('.').pop() || 'jpg'
  const fileName = `example-${exampleNumber}.${fileExt}`
  const filePath = `${styleValue}/${fileName}`

  // Upload l'image vers Supabase Storage
  const { data, error } = await supabase.storage
    .from('style-examples')
    .upload(filePath, imageFile, {
      cacheControl: '3600',
      upsert: true // Remplacer si l'image existe déjà
    })

  if (error) {
    console.error('Erreur lors de l\'upload:', error)
    throw new Error(`Erreur lors de l'upload: ${error.message}`)
  }

  // Obtenir l'URL publique
  const { data: { publicUrl } } = supabase.storage
    .from('style-examples')
    .getPublicUrl(filePath)

  return publicUrl
}

/**
 * Upload plusieurs images d'exemple pour un style
 * @param styleValue - La valeur du style
 * @param imageFiles - Tableau de 3 fichiers images
 * @returns Tableau des URLs publiques
 */
export async function uploadStyleExamples(
  styleValue: string,
  imageFiles: [File, File, File]
): Promise<string[]> {
  const uploadPromises = imageFiles.map((file, index) =>
    uploadStyleExampleImage(styleValue, file, index + 1)
  )

  return Promise.all(uploadPromises)
}

/**
 * Obtenir les URLs publiques des exemples d'un style
 * @param styleValue - La valeur du style
 * @returns Tableau des URLs publiques (ou null si les images n'existent pas)
 */
export async function getStyleExampleUrls(
  styleValue: string
): Promise<(string | null)[]> {
  const bucketName = 'style-examples'
  const extensions = ['jpg', 'jpeg', 'png', 'webp']
  const urls: (string | null)[] = []

  for (let i = 1; i <= 3; i++) {
    let found = false
    for (const ext of extensions) {
      const filePath = `${styleValue}/example-${i}.${ext}`
      const { data } = supabase.storage
        .from(bucketName)
        .getPublicUrl(filePath)

      // Vérifier si le fichier existe (optionnel, nécessite une vérification)
      // Pour l'instant, on retourne l'URL même si le fichier n'existe pas
      urls.push(data.publicUrl)
      found = true
      break
    }
    if (!found) {
      urls.push(null)
    }
  }

  return urls
}
