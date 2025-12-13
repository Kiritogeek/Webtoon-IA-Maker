import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '@/lib/supabase'
import type { Chapter, Character, Scene, Project } from '@/lib/supabase'
import WebtoonPanelEditor from '@/components/WebtoonPanelEditor'
import AuthGuard from '@/components/AuthGuard'
import ProjectSidebar from '@/components/project/ProjectSidebar'
import ProjectTopbar from '@/components/project/ProjectTopbar'

function ChapterPageContent() {
  const router = useRouter()
  const { id, chapterId } = router.query
  const [chapter, setChapter] = useState<Chapter | null>(null)
  const [project, setProject] = useState<Project | null>(null)
  const [characters, setCharacters] = useState<Character[]>([])
  const [scenes, setScenes] = useState<Scene[]>([])
  const [loading, setLoading] = useState(true)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [showCreateSceneModal, setShowCreateSceneModal] = useState(false)
  const [newSceneTitle, setNewSceneTitle] = useState('')

  useEffect(() => {
    if (chapterId && id) {
      loadProject()
      loadChapter()
      loadCharacters()
      loadScenes()
    }
  }, [chapterId, id])

  const loadProject = async () => {
    if (!id || typeof id !== 'string') return

    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error
      setProject(data)
    } catch (error) {
      console.error('Error loading project:', error)
    }
  }

  const loadChapter = async () => {
    if (!chapterId || typeof chapterId !== 'string') return

    try {
      const { data, error } = await supabase
        .from('chapters')
        .select('*')
        .eq('id', chapterId)
        .single()

      if (error) throw error
      setChapter(data)
    } catch (error) {
      console.error('Error loading chapter:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadCharacters = async () => {
    if (!id || typeof id !== 'string') return

    try {
      const { data, error } = await supabase
        .from('characters')
        .select('*')
        .eq('project_id', id)

      if (error) throw error
      setCharacters(data || [])
    } catch (error) {
      console.error('Error loading characters:', error)
    }
  }

  const loadScenes = async () => {
    if (!chapterId || typeof chapterId !== 'string') return

    try {
      const { data, error } = await supabase
        .from('scenes')
        .select('*')
        .eq('chapter_id', chapterId)
        .order('order', { ascending: true })

      if (error) throw error
      setScenes(data || [])
    } catch (error) {
      console.error('Error loading scenes:', error)
    }
  }

  const handleCreateSceneClick = () => {
    // Si c'est la première planche, elle sera la couverture (selon Produit.md)
    const isFirstPanel = scenes.length === 0
    const defaultTitle = isFirstPanel ? 'Couverture' : `Planche ${scenes.length + 1}`
    setNewSceneTitle(defaultTitle)
    setShowCreateSceneModal(true)
  }

  const createScene = async () => {
    if (!chapterId || typeof chapterId !== 'string' || !newSceneTitle.trim()) return

    // Si c'est la première planche, elle sera la couverture (selon Produit.md)
    const isFirstPanel = scenes.length === 0

    try {
      const maxOrder = scenes.length > 0 
        ? Math.max(...scenes.map(s => s.order)) 
        : 0

      const { data, error } = await supabase
        .from('scenes')
        .insert([
          {
            chapter_id: chapterId,
            title: newSceneTitle.trim(),
            order: maxOrder + 1,
            description: isFirstPanel ? 'Première planche = couverture du chapitre' : null,
          },
        ])
        .select()
        .single()

      if (error) throw error
      setShowCreateSceneModal(false)
      setNewSceneTitle('')
      await loadScenes()
    } catch (error) {
      console.error('Error creating scene:', error)
      alert('Erreur lors de la création de la planche')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center creative-bg">
        <div className="text-2xl gradient-text font-bold animate-pulse">Chargement...</div>
      </div>
    )
  }

  if (!chapter) {
    return (
      <div className="min-h-screen flex items-center justify-center creative-bg">
        <div className="text-2xl gradient-text font-bold">Chapitre non trouvé</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen creative-bg">
      <ProjectSidebar
        projectId={id as string}
        activeSection="chapters"
        isCollapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />
      
      <div className={`transition-all duration-300 ${
        sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-52'
      }`}>
        <ProjectTopbar
          projectId={id as string}
          sidebarCollapsed={sidebarCollapsed}
          onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
        />

        <div className="p-4 lg:p-8 mt-16">
          <div className="max-w-full mx-auto">
            {/* Header */}
            <div className="mb-6">
              <div className="bg-darker/90 backdrop-blur-sm rounded-2xl p-6 border-2 border-white/10">
                <h1 className="text-3xl font-bold mb-2 gradient-text">{chapter.title}</h1>
                <p className="text-white/70">Chapitre {chapter.order}</p>
              </div>
            </div>

            {/* Contrôles */}
            <div className="mb-4 flex justify-between items-center">
              <div className="text-white/80 text-sm">
                {scenes.length === 0 ? (
                  <span>Aucune planche. La première planche créée sera la couverture.</span>
                ) : (
                  <span>{scenes.length} planche{scenes.length > 1 ? 's' : ''} • La première est la couverture</span>
                )}
              </div>
              <button
                onClick={handleCreateSceneClick}
                className="bg-gradient-to-r from-primary to-accent text-white px-4 py-2 rounded-xl font-semibold hover:shadow-lg transition"
              >
                + Nouvelle planche
              </button>
            </div>

            {/* Éditeur Webtoon - Style Canva */}
            {scenes.length > 0 ? (
              <div className="bg-darker/90 backdrop-blur-sm rounded-2xl border-2 border-white/10 overflow-hidden" style={{ height: 'calc(100vh - 280px)' }}>
                <WebtoonPanelEditor
                  chapterId={chapterId as string}
                  projectId={id as string}
                  project={project}
                  scenes={scenes}
                  characters={characters}
                  onScenesUpdate={loadScenes}
                />
              </div>
            ) : (
              <div className="bg-darker/90 backdrop-blur-sm rounded-2xl p-12 border-2 border-white/10 text-center">
                <div className="text-6xl mb-4">📖</div>
                <h2 className="text-2xl font-bold text-white mb-2">Commencez votre webtoon</h2>
                <p className="text-white/70 mb-6">Créez votre première planche pour commencer l'édition</p>
                <button
                  onClick={handleCreateSceneClick}
                  className="bg-gradient-to-r from-primary to-accent text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition"
                >
                  Créer la première planche (couverture)
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal créer planche */}
      {showCreateSceneModal && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowCreateSceneModal(false)
              setNewSceneTitle('')
            }
          }}
        >
          <div
            className="bg-darker/95 backdrop-blur-md rounded-2xl p-6 border-2 border-primary/50 max-w-md w-full"
            style={{ zIndex: 10000 }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-2xl font-bold text-white mb-4">
              Créer une nouvelle planche
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-white/70 mb-2">
                  Titre de la planche <span className="text-white">*</span>
                </label>
                <input
                  type="text"
                  value={newSceneTitle}
                  onChange={(e) => setNewSceneTitle(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      createScene()
                    }
                  }}
                  placeholder="Titre de la planche"
                  className="w-full px-4 py-2 bg-darkest border-2 border-white/10 rounded-xl focus:outline-none focus:border-primary transition text-white"
                  autoFocus
                />
                {scenes.length === 0 && (
                  <p className="text-primary text-xs mt-2">
                    💡 La première planche sera la couverture du chapitre
                  </p>
                )}
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={createScene}
                  disabled={!newSceneTitle.trim()}
                  className="flex-1 bg-gradient-to-r from-primary to-accent text-white py-3 rounded-xl font-semibold hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  ✨ Créer
                </button>
                <button
                  onClick={() => {
                    setShowCreateSceneModal(false)
                    setNewSceneTitle('')
                  }}
                  className="px-6 py-3 bg-darkest border-2 border-white/10 text-white rounded-xl hover:bg-darkest/80 transition"
                >
                  Annuler
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function ChapterPage() {
  return (
    <AuthGuard>
      <ChapterPageContent />
    </AuthGuard>
  )
}
