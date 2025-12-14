import { create } from 'zustand'
import { supabase } from '@/lib/supabase'
import type { Project, Character, Chapter, Scene, Place, Scenario, ChapterNotes, ProjectVisualReference, Asset } from '@/lib/supabase'

interface ProjectState {
  project: Project | null
  characters: Character[]
  chapters: Chapter[]
  scenes: Scene[]
  places: Place[]
  assets: Asset[]
  scenario: Scenario | null
  chapterNotes: ChapterNotes[]
  loading: boolean
  currentProjectId: string | null
  tablesExist: {
    scenario: boolean | null
    chapterNotes: boolean | null
  }
  
  // Actions
  setProject: (project: Project | null) => void
  setCharacters: (characters: Character[]) => void
  setChapters: (chapters: Chapter[]) => void
  setScenes: (scenes: Scene[]) => void
  setPlaces: (places: Place[]) => void
  setAssets: (assets: Asset[]) => void
  setScenario: (scenario: Scenario | null) => void
  setChapterNotes: (chapterNotes: ChapterNotes[]) => void
  setLoading: (loading: boolean) => void
  addCharacter: (character: Character) => void
  addChapter: (chapter: Chapter) => void
  updateProject: (updates: Partial<Project>) => void
  
  // Charger TOUT en une fois
  loadAllProjectData: (projectId: string) => Promise<void>
  // Vérifier si un projet est déjà chargé
  isProjectLoaded: (projectId: string) => boolean
  // Réinitialiser pour un nouveau projet
  resetForProject: (projectId: string) => void
}

export const useProjectStore = create<ProjectState>((set, get) => ({
  project: null,
  characters: [],
  chapters: [],
  scenes: [],
  places: [],
  assets: [],
  scenario: null,
  chapterNotes: [],
  loading: false,
  currentProjectId: null,
  tablesExist: {
    scenario: null,
    chapterNotes: null
  },
  
  setProject: (project) => set({ project, currentProjectId: project?.id || null }),
  setCharacters: (characters) => set({ characters }),
  setChapters: (chapters) => set({ chapters }),
  setScenes: (scenes) => set({ scenes }),
  setPlaces: (places) => set({ places }),
  setAssets: (assets) => set({ assets }),
  setScenario: (scenario) => set({ scenario }),
  setChapterNotes: (chapterNotes) => set({ chapterNotes }),
  setLoading: (loading) => set({ loading }),
  addCharacter: (character) => set((state) => ({ 
    characters: [...state.characters, character] 
  })),
  addChapter: (chapter) => set((state) => ({ 
    chapters: [...state.chapters, chapter].sort((a, b) => a.order - b.order)
  })),
  updateProject: (updates) => set((state) => ({
    project: state.project ? { ...state.project, ...updates } : null
  })),
  
  // Charger TOUT en parallèle - même si ça prend 10 secondes !
  loadAllProjectData: async (projectId: string) => {
    const state = get()
    
    // Si le projet est déjà chargé, ne pas recharger
    if (state.currentProjectId === projectId && state.project !== null) {
      return
    }
    
    // Réinitialiser pour ce projet
    set({
      project: null,
      characters: [],
      chapters: [],
      scenes: [],
      places: [],
      assets: [],
      scenario: null,
      chapterNotes: [],
      loading: true,
      currentProjectId: projectId
    })
    
    try {
      // Charger les données essentielles en parallèle
      const [
        projectResult,
        charactersResult,
        chaptersResult,
        placesResult,
        assetsResult,
        visualReferencesResult
      ] = await Promise.all([
        supabase.from('projects').select('*').eq('id', projectId).single(),
        supabase.from('characters').select('*').eq('project_id', projectId).order('created_at', { ascending: false }),
        supabase.from('chapters').select('*').eq('project_id', projectId).order('order', { ascending: true }),
        supabase.from('places').select('*').eq('project_id', projectId).order('created_at', { ascending: false }),
        supabase.from('assets').select('*').eq('project_id', projectId).order('created_at', { ascending: false }),
        supabase.from('project_visual_references').select('*').eq('project_id', projectId).order('display_order', { ascending: true })
      ])
      
      // Mettre à jour le store avec les données essentielles
      if (projectResult.error) throw projectResult.error
      const projectData = projectResult.data
      
      // Attacher les références visuelles au projet
      if (!visualReferencesResult.error && visualReferencesResult.data) {
        projectData.visual_references = visualReferencesResult.data || []
      } else {
        projectData.visual_references = []
      }
      
      set({ project: projectData })
      
      if (!charactersResult.error) {
        set({ characters: charactersResult.data || [] })
      }
      
      if (!chaptersResult.error) {
        set({ chapters: chaptersResult.data || [] })
      }
      
      if (!placesResult.error) {
        set({ places: placesResult.data || [] })
      }
      
      if (!assetsResult.error) {
        set({ assets: assetsResult.data || [] })
      }
      
      // Charger les données optionnelles (scenario et chapter_notes) seulement si on ne sait pas qu'elles n'existent pas
      // Utiliser localStorage pour persister le cache entre les rafraîchissements
      const cacheKey = `tables_exist_${projectId}`
      let cachedTablesExist = state.tablesExist || {
        scenario: null,
        chapterNotes: null
      }
      
      // Charger depuis localStorage si disponible
      if (typeof window !== 'undefined') {
        try {
          const cached = localStorage.getItem(cacheKey)
          if (cached) {
            const parsed = JSON.parse(cached)
            cachedTablesExist = {
              scenario: parsed.scenario ?? null,
              chapterNotes: parsed.chapterNotes ?? null
            }
          }
        } catch (e) {
          // Ignorer les erreurs de parsing
        }
      }
      
      // Charger scenario seulement si on n'a pas encore vérifié ou si on sait qu'elle existe
      if (cachedTablesExist.scenario !== false) {
        try {
          const scenarioResult = await supabase.from('scenario').select('*').eq('project_id', projectId).maybeSingle()
          if (!scenarioResult.error && scenarioResult.data) {
            set({ scenario: scenarioResult.data, tablesExist: { ...cachedTablesExist, scenario: true } })
            if (typeof window !== 'undefined') {
              localStorage.setItem(cacheKey, JSON.stringify({ ...cachedTablesExist, scenario: true }))
            }
          } else if (scenarioResult.error) {
            // Vérifier si c'est une erreur de table inexistante
            const isTableMissing = scenarioResult.error.code === 'PGRST205' || 
                                 scenarioResult.error.code === '42P01' ||
                                 scenarioResult.error.message?.includes('relation') ||
                                 scenarioResult.error.message?.includes('does not exist')
            if (isTableMissing) {
              // Marquer que la table n'existe pas pour éviter les futures requêtes
              const newCache = { ...cachedTablesExist, scenario: false }
              set({ tablesExist: newCache })
              if (typeof window !== 'undefined') {
                localStorage.setItem(cacheKey, JSON.stringify(newCache))
              }
            }
          }
        } catch (e) {
          // Ignorer complètement les erreurs pour scenario
        }
      }
      
      // Charger chapter_notes seulement si on n'a pas encore vérifié ou si on sait qu'elle existe
      if (cachedTablesExist.chapterNotes !== false) {
        try {
          const chapterNotesResult = await supabase.from('chapter_notes').select('*').eq('project_id', projectId)
          if (!chapterNotesResult.error) {
            const newCache = { ...cachedTablesExist, chapterNotes: true }
            set({ chapterNotes: chapterNotesResult.data || [], tablesExist: newCache })
            if (typeof window !== 'undefined') {
              localStorage.setItem(cacheKey, JSON.stringify(newCache))
            }
          } else {
            // Vérifier si c'est une erreur de table inexistante
            const isTableMissing = chapterNotesResult.error.code === 'PGRST205' || 
                                 chapterNotesResult.error.code === '42P01' ||
                                 chapterNotesResult.error.message?.includes('relation') ||
                                 chapterNotesResult.error.message?.includes('does not exist')
            if (isTableMissing) {
              // Marquer que la table n'existe pas pour éviter les futures requêtes
              const newCache = { ...cachedTablesExist, chapterNotes: false }
              set({ chapterNotes: [], tablesExist: newCache })
              if (typeof window !== 'undefined') {
                localStorage.setItem(cacheKey, JSON.stringify(newCache))
              }
            } else {
              set({ chapterNotes: [] })
            }
          }
        } catch (e) {
          // Ignorer complètement les erreurs pour chapter_notes
          const newCache = { ...cachedTablesExist, chapterNotes: false }
          set({ chapterNotes: [], tablesExist: newCache })
          if (typeof window !== 'undefined') {
            localStorage.setItem(cacheKey, JSON.stringify(newCache))
          }
        }
      } else {
        // Si on sait que la table n'existe pas, initialiser avec un tableau vide
        set({ chapterNotes: [] })
      }
    } catch (error) {
      console.error('Error loading all project data:', error)
    } finally {
      set({ loading: false })
    }
  },
  
  isProjectLoaded: (projectId: string) => {
    const state = get()
    return state.currentProjectId === projectId && state.project !== null
  },
  
  resetForProject: (projectId: string) => {
    const state = get()
    if (state.currentProjectId !== projectId) {
      set({
        project: null,
        characters: [],
        chapters: [],
        scenes: [],
        places: [],
        scenario: null,
        chapterNotes: [],
        loading: false,
        currentProjectId: projectId,
        // Réinitialiser le cache des tables seulement si on change de projet
        tablesExist: {
          scenario: null,
          chapterNotes: null
        }
      })
    }
  },
}))

