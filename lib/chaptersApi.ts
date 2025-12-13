import { supabase } from './supabase'
import type { Chapter } from './supabase'

/**
 * API pour gérer les chapitres (CRUD complet)
 */

/**
 * GET - Récupérer tous les chapitres d'un projet
 */
export async function getChapters(projectId: string): Promise<Chapter[]> {
  try {
    const { data, error } = await supabase
      .from('chapters')
      .select('*')
      .eq('project_id', projectId)
      .order('order', { ascending: true })

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error getting chapters:', error)
    throw error
  }
}

/**
 * GET - Récupérer un chapitre par son ID
 */
export async function getChapterById(chapterId: string): Promise<Chapter | null> {
  try {
    const { data, error } = await supabase
      .from('chapters')
      .select('*')
      .eq('id', chapterId)
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error getting chapter:', error)
    throw error
  }
}

/**
 * POST - Créer un nouveau chapitre
 */
export async function createChapter(
  projectId: string,
  title: string,
  description?: string,
  coverImageUrl?: string
): Promise<Chapter> {
  try {
    // Récupérer le dernier ordre
    const { data: existingChapters } = await supabase
      .from('chapters')
      .select('order')
      .eq('project_id', projectId)
      .order('order', { ascending: false })
      .limit(1)

    const nextOrder = existingChapters && existingChapters.length > 0
      ? existingChapters[0].order + 1
      : 1

    const { data, error } = await supabase
      .from('chapters')
      .insert([
        {
          project_id: projectId,
          title: title.trim(),
          order: nextOrder,
          description: description || null,
          cover_image_url: coverImageUrl || null,
        },
      ])
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error creating chapter:', error)
    throw error
  }
}

/**
 * PUT - Mettre à jour un chapitre
 */
export async function updateChapter(
  chapterId: string,
  updates: {
    title?: string
    description?: string
    cover_image_url?: string
    order?: number
  }
): Promise<Chapter> {
  try {
    const updateData: any = {}
    
    if (updates.title !== undefined) {
      updateData.title = updates.title.trim()
    }
    if (updates.description !== undefined) {
      updateData.description = updates.description || null
    }
    if (updates.cover_image_url !== undefined) {
      updateData.cover_image_url = updates.cover_image_url || null
    }
    if (updates.order !== undefined) {
      updateData.order = updates.order
    }

    const { data, error } = await supabase
      .from('chapters')
      .update(updateData)
      .eq('id', chapterId)
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error updating chapter:', error)
    throw error
  }
}

/**
 * DELETE - Supprimer un chapitre
 */
export async function deleteChapter(chapterId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('chapters')
      .delete()
      .eq('id', chapterId)

    if (error) throw error
  } catch (error) {
    console.error('Error deleting chapter:', error)
    throw error
  }
}

/**
 * PUT - Réorganiser l'ordre des chapitres
 */
export async function reorderChapters(
  projectId: string,
  chapterOrders: { chapterId: string; order: number }[]
): Promise<void> {
  try {
    // Mettre à jour tous les ordres en une seule transaction
    const updates = chapterOrders.map(({ chapterId, order }) =>
      supabase
        .from('chapters')
        .update({ order })
        .eq('id', chapterId)
        .eq('project_id', projectId)
    )

    await Promise.all(updates)
  } catch (error) {
    console.error('Error reordering chapters:', error)
    throw error
  }
}

/**
 * GET - Récupérer le nombre de chapitres d'un projet
 */
export async function getChaptersCount(projectId: string): Promise<number> {
  try {
    const { count, error } = await supabase
      .from('chapters')
      .select('*', { count: 'exact', head: true })
      .eq('project_id', projectId)

    if (error) throw error
    return count || 0
  } catch (error) {
    console.error('Error getting chapters count:', error)
    throw error
  }
}
