// API Route pour récupérer les designs de webtoon depuis une API externe
// Cette route peut être configurée pour appeler différentes APIs de designs

import type { NextApiRequest, NextApiResponse } from 'next'

export interface WebtoonDesign {
  id: string
  name: string
  description?: string
  imageUrl: string
  style: string
  category?: string
  tags?: string[]
}

export interface WebtoonDesignsResponse {
  designs: WebtoonDesign[]
  total?: number
  error?: string
}

// Configuration de l'API externe (à personnaliser selon votre API)
const WEBTOON_DESIGNS_API_URL = process.env.WEBTOON_DESIGNS_API_URL || ''
const WEBTOON_DESIGNS_API_KEY = process.env.WEBTOON_DESIGNS_API_KEY || ''

// Fonction pour appeler l'API externe
async function fetchDesignsFromAPI(style?: string): Promise<WebtoonDesign[]> {
  if (!WEBTOON_DESIGNS_API_URL) {
    throw new Error('API URL non configurée. Définissez WEBTOON_DESIGNS_API_URL dans .env.local')
  }

  try {
    const url = new URL(WEBTOON_DESIGNS_API_URL)
    
    // Ajouter des paramètres de requête si nécessaire
    if (style) {
      url.searchParams.append('style', style)
    }
    url.searchParams.append('limit', '20') // Limiter le nombre de résultats
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    }
    
    // Ajouter la clé API si nécessaire
    if (WEBTOON_DESIGNS_API_KEY) {
      headers['Authorization'] = `Bearer ${WEBTOON_DESIGNS_API_KEY}`
      // Ou selon le format de votre API :
      // headers['X-API-Key'] = WEBTOON_DESIGNS_API_KEY
    }

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers,
    })

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    
    // Adapter selon la structure de réponse de votre API
    // Exemple de formats possibles :
    // Format 1: { designs: [...] }
    // Format 2: { data: [...] }
    // Format 3: { results: [...] }
    
    if (data.designs) {
      return data.designs
    } else if (data.data) {
      return data.data
    } else if (data.results) {
      return data.results
    } else if (Array.isArray(data)) {
      return data
    } else {
      throw new Error('Format de réponse API non reconnu')
    }
  } catch (error: any) {
    console.error('Error fetching designs from API:', error)
    throw error
  }
}

// Fonction de fallback vers Supabase Storage (si l'API externe n'est pas disponible)
async function getFallbackDesigns(style: string): Promise<WebtoonDesign[]> {
  // Cette fonction peut retourner des designs depuis Supabase Storage
  // ou des designs par défaut
  const { supabase } = await import('@/lib/supabase')
  
  try {
    const bucketName = 'style-references'
    const getSupabaseImageUrl = (style: string, exampleNum: number, ext: string = 'jpg') => {
      const filePath = `style-examples/${style}/exemple-${exampleNum}.${ext}`
      const { data } = supabase.storage.from(bucketName).getPublicUrl(filePath)
      return data.publicUrl
    }
    
    const examples: string[] = []
    for (let i = 1; i <= 3; i++) {
      examples.push(getSupabaseImageUrl(style, i))
    }
    
    return examples.map((url, index) => ({
      id: `fallback-${style}-${index + 1}`,
      name: `Template ${index + 1}`,
      description: `Template de référence pour le style ${style}`,
      imageUrl: url,
      style: style,
    }))
  } catch (error) {
    console.error('Error getting fallback designs:', error)
    return []
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<WebtoonDesignsResponse>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ designs: [], error: 'Method not allowed' })
  }

  try {
    const { style } = req.query
    
    let designs: WebtoonDesign[] = []
    
    // Essayer d'appeler l'API externe si configurée
    if (WEBTOON_DESIGNS_API_URL) {
      try {
        designs = await fetchDesignsFromAPI(style as string)
      } catch (apiError: any) {
        console.warn('API externe non disponible, utilisation du fallback:', apiError.message)
        // Fallback vers Supabase Storage
        if (style && typeof style === 'string') {
          designs = await getFallbackDesigns(style)
        }
      }
    } else {
      // Pas d'API configurée, utiliser le fallback
      if (style && typeof style === 'string') {
        designs = await getFallbackDesigns(style)
      }
    }

    return res.status(200).json({
      designs,
      total: designs.length,
    })
  } catch (error: any) {
    console.error('Error in webtoon-designs API:', error)
    return res.status(500).json({
      designs: [],
      error: error.message || 'Erreur lors de la récupération des designs',
    })
  }
}

