import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import type { Chapter, Project } from '@/lib/supabase'
import { getChapters, createChapter, updateChapter, deleteChapter } from '@/lib/chaptersApi'
import Link from 'next/link'
import AuthGuard from '@/components/AuthGuard'
import ProjectSidebar from '@/components/project/ProjectSidebar'
import ProjectTopbar from '@/components/project/ProjectTopbar'
import { useProjectStore } from '@/lib/stores/projectStore'
import { getProjectBackground } from '@/lib/backgroundPresets'

function ChaptersPageContent() {
  const router = useRouter()
  const { id } = router.query
  const { project, chapters, loading, loadAllProjectData, setChapters } = useProjectStore()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [editingChapter, setEditingChapter] = useState<Chapter | null>(null)
  const [deletingChapter, setDeletingChapter] = useState<Chapter | null>(null)
  const [newChapterTitle, setNewChapterTitle] = useState('')
  const [newChapterDescription, setNewChapterDescription] = useState('')
  const [creating, setCreating] = useState(false)
  const [updating, setUpdating] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    if (id && typeof id === 'string') {
      // Charger TOUT en une fois si pas déjà chargé
      loadAllProjectData(id)
    }
  }, [id, loadAllProjectData])

  const handleCreateChapter = async () => {
    if (!id || typeof id !== 'string' || !newChapterTitle.trim()) return

    setCreating(true)
    try {
      const data = await createChapter(
        id,
        newChapterTitle,
        newChapterDescription || undefined
      )
      
      // Recharger les données du projet pour inclure le nouveau chapitre
      if (id && typeof id === 'string') {
        await loadAllProjectData(id)
      }
      
      // Rediriger vers l'éditeur du nouveau chapitre
      router.push(`/project/${id}/chapter/${data.id}`)
    } catch (error) {
      console.error('Error creating chapter:', error)
      alert('Erreur lors de la création du chapitre')
    } finally {
      setCreating(false)
      setShowCreateModal(false)
      setNewChapterTitle('')
      setNewChapterDescription('')
    }
  }

  const handleEditChapter = (chapter: Chapter) => {
    setEditingChapter(chapter)
    setNewChapterTitle(chapter.title)
    setNewChapterDescription(chapter.description || '')
    setShowEditModal(true)
  }

  const handleUpdateChapter = async () => {
    if (!editingChapter || !newChapterTitle.trim()) return

    setUpdating(true)
    try {
      await updateChapter(editingChapter.id, {
        title: newChapterTitle,
        description: newChapterDescription || undefined,
      })
      
      // Recharger les données du projet
      if (id && typeof id === 'string') {
        await loadAllProjectData(id)
      }
      setShowEditModal(false)
      setEditingChapter(null)
      setNewChapterTitle('')
      setNewChapterDescription('')
    } catch (error) {
      console.error('Error updating chapter:', error)
      alert('Erreur lors de la mise à jour du chapitre')
    } finally {
      setUpdating(false)
    }
  }

  const handleDeleteChapter = (chapter: Chapter) => {
    setDeletingChapter(chapter)
    setShowDeleteModal(true)
  }

  const confirmDeleteChapter = async () => {
    if (!deletingChapter) return

    setDeleting(true)
    try {
      await deleteChapter(deletingChapter.id)
      // Recharger les données du projet
      if (id && typeof id === 'string') {
        await loadAllProjectData(id)
      }
      setShowDeleteModal(false)
      setDeletingChapter(null)
    } catch (error) {
      console.error('Error deleting chapter:', error)
      alert('Erreur lors de la suppression du chapitre')
    } finally {
      setDeleting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center creative-bg">
        <div className="text-2xl gradient-text font-bold animate-pulse">Chargement...</div>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center creative-bg">
        <div className="text-2xl gradient-text font-bold">Projet non trouvé</div>
      </div>
    )
  }

  return (
    <div 
      className="min-h-screen relative"
      style={{
        background: getProjectBackground(project),
        backgroundAttachment: 'fixed',
        backgroundSize: 'cover',
      }}
    >
      <ProjectSidebar
        projectId={id as string}
        activeSection="chapters"
        isCollapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />
      
      <div className={`transition-all duration-300 ${
        sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-52'
      }`} style={{ position: 'relative', zIndex: 1 }}>
        <ProjectTopbar
          projectId={id as string}
          sidebarCollapsed={sidebarCollapsed}
          onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
        />

        <div className="p-4 lg:p-8 mt-16 relative z-0">
          <div className="max-w-7xl mx-auto relative">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-4xl font-bold mb-2 gradient-text">📖 MENU : CHAPITRES</h1>
              <p className="text-white/70">Gérez vos chapitres et créez votre webtoon</p>
            </div>

            {/* Menu principal */}
            <div className="mb-8">
              {/* Créer un chapitre - Bouton principal */}
              <div
                role="button"
                tabIndex={0}
                onClick={() => {
                  console.log('Click détecté!')
                  setShowCreateModal(true)
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    setShowCreateModal(true)
                  }
                }}
                className="w-full bg-gradient-to-br from-primary via-secondary to-accent p-8 rounded-2xl border-2 border-white/10 hover:border-white/20 transition-all hover:scale-[1.02] shadow-xl group cursor-pointer mb-6 select-none"
                style={{ 
                  position: 'relative',
                  zIndex: 100,
                }}
              >
                <div className="text-center pointer-events-none">
                  <div className="text-6xl mb-4 group-hover:scale-110 transition-transform">✨</div>
                  <h2 className="text-2xl font-bold text-white mb-2">Créer un nouveau chapitre</h2>
                  <p className="text-white/80">Commencez un nouveau chapitre pour votre webtoon</p>
                </div>
              </div>

              {/* Liste des chapitres existants */}
              <div className="bg-darker/90 backdrop-blur-sm rounded-2xl p-6 border-2 border-white/10">
                <h2 className="text-xl font-bold text-white mb-4">📚 Mes chapitres</h2>

                {chapters.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-5xl mb-4">📖</div>
                    <p className="text-white/60 mb-2 text-lg">Aucun chapitre créé</p>
                    <p className="text-white/40 text-sm">Créez votre premier chapitre pour commencer à éditer votre webtoon</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {chapters.map((chapter) => (
                      <div
                        key={chapter.id}
                        className="p-5 bg-darkest/50 rounded-xl border-2 border-white/5 hover:border-primary/50 transition-all hover:bg-darkest/70 group"
                      >
                        <div className="flex items-start gap-4">
                          <div className="w-14 h-14 rounded-lg bg-gradient-to-br from-primary/30 to-accent/30 flex items-center justify-center text-white font-bold text-xl group-hover:scale-110 transition-transform flex-shrink-0">
                            {chapter.order}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-white font-semibold mb-1 truncate">
                              {chapter.title}
                            </h3>
                            <p className="text-white/50 text-sm mb-3">Chapitre {chapter.order}</p>
                            <div className="flex items-center gap-2">
                              <Link
                                href={`/project/${id}/chapter/${chapter.id}`}
                                className="flex-1 bg-gradient-to-r from-primary to-accent text-white px-4 py-2 rounded-lg text-sm font-semibold hover:shadow-lg transition text-center"
                              >
                                Ouvrir l'éditeur
                              </Link>
                              <button
                                onClick={() => handleEditChapter(chapter)}
                                className="px-4 py-2 bg-secondary/20 hover:bg-secondary/30 text-white rounded-lg text-sm font-medium transition"
                                title="Modifier"
                              >
                                ✏️
                              </button>
                              <button
                                onClick={() => handleDeleteChapter(chapter)}
                                className="px-4 py-2 bg-red/20 hover:bg-red/30 text-white rounded-lg text-sm font-medium transition"
                                title="Supprimer"
                              >
                                🗑️
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Éditeur de chapitre - Section info */}
            <div className="bg-darker/90 backdrop-blur-sm rounded-2xl p-6 border-2 border-white/10">
              <h2 className="text-xl font-bold text-white mb-4">Éditeur de chapitre</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-white/80 text-sm">
                <div>
                  <h3 className="font-semibold text-white mb-2">Canvas vertical Webtoon</h3>
                  <p>Format optimisé pour le webtoon avec défilement vertical</p>
                </div>
                <div>
                  <h3 className="font-semibold text-white mb-2">Première planche = couverture</h3>
                  <p>La première planche sert automatiquement de couverture du chapitre</p>
                </div>
                <div>
                  <h3 className="font-semibold text-white mb-2">Drag & drop</h3>
                  <p>Glissez-déposez personnages, lieux et assets directement sur le canvas</p>
                </div>
                <div>
                  <h3 className="font-semibold text-white mb-2">Interaction IA</h3>
                  <p>Cliquez sur un personnage pour appliquer pose, émotion et cadrage via IA</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de création */}
      {showCreateModal && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4"
          style={{ zIndex: 9999 }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowCreateModal(false)
              setNewChapterTitle('')
            }
          }}
        >
          <div 
            className="bg-darker/95 backdrop-blur-md rounded-2xl p-6 border-2 border-primary/50 max-w-md w-full"
            style={{ zIndex: 10000 }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-2xl font-bold text-white mb-4">Créer un nouveau chapitre</h2>
            <input
              type="text"
              value={newChapterTitle}
              onChange={(e) => setNewChapterTitle(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !creating) {
                  handleCreateChapter()
                }
              }}
              placeholder="Titre du chapitre"
              className="w-full px-4 py-3 bg-darkest border-2 border-white/10 rounded-xl focus:outline-none focus:border-primary transition text-white mb-4"
              autoFocus
            />
            <textarea
              value={newChapterDescription}
              onChange={(e) => setNewChapterDescription(e.target.value)}
              placeholder="Description (optionnelle)"
              className="w-full px-4 py-3 bg-darkest border-2 border-white/10 rounded-xl focus:outline-none focus:border-primary transition text-white mb-4 resize-none"
              rows={3}
            />
            <div className="flex gap-3">
              <button
                onClick={handleCreateChapter}
                disabled={!newChapterTitle.trim() || creating}
                className="flex-1 bg-gradient-to-r from-primary to-accent text-white py-3 rounded-xl font-semibold hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {creating ? 'Création...' : 'Créer'}
              </button>
              <button
                onClick={() => {
                  setShowCreateModal(false)
                  setNewChapterTitle('')
                  setNewChapterDescription('')
                }}
                className="px-6 py-3 bg-darkest border-2 border-white/10 text-white rounded-xl hover:bg-darkest/80 transition"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal d'édition */}
      {showEditModal && editingChapter && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4"
          style={{ zIndex: 9999 }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowEditModal(false)
              setEditingChapter(null)
              setNewChapterTitle('')
              setNewChapterDescription('')
            }
          }}
        >
          <div 
            className="bg-darker/95 backdrop-blur-md rounded-2xl p-6 border-2 border-primary/50 max-w-md w-full"
            style={{ zIndex: 10000 }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-2xl font-bold text-white mb-4">Modifier le chapitre</h2>
            <input
              type="text"
              value={newChapterTitle}
              onChange={(e) => setNewChapterTitle(e.target.value)}
              placeholder="Titre du chapitre"
              className="w-full px-4 py-3 bg-darkest border-2 border-white/10 rounded-xl focus:outline-none focus:border-primary transition text-white mb-4"
              autoFocus
            />
            <textarea
              value={newChapterDescription}
              onChange={(e) => setNewChapterDescription(e.target.value)}
              placeholder="Description (optionnelle)"
              className="w-full px-4 py-3 bg-darkest border-2 border-white/10 rounded-xl focus:outline-none focus:border-primary transition text-white mb-4 resize-none"
              rows={3}
            />
            <div className="flex gap-3">
              <button
                onClick={handleUpdateChapter}
                disabled={!newChapterTitle.trim() || updating}
                className="flex-1 bg-gradient-to-r from-primary to-accent text-white py-3 rounded-xl font-semibold hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {updating ? 'Mise à jour...' : 'Enregistrer'}
              </button>
              <button
                onClick={() => {
                  setShowEditModal(false)
                  setEditingChapter(null)
                  setNewChapterTitle('')
                  setNewChapterDescription('')
                }}
                className="px-6 py-3 bg-darkest border-2 border-white/10 text-white rounded-xl hover:bg-darkest/80 transition"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de suppression */}
      {showDeleteModal && deletingChapter && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4"
          style={{ zIndex: 9999 }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowDeleteModal(false)
              setDeletingChapter(null)
            }
          }}
        >
          <div 
            className="bg-darker/95 backdrop-blur-md rounded-2xl p-6 border-2 border-red/50 max-w-md w-full"
            style={{ zIndex: 10000 }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-2xl font-bold text-white mb-4">Supprimer le chapitre</h2>
            <p className="text-white/80 mb-6">
              Êtes-vous sûr de vouloir supprimer le chapitre <strong>"{deletingChapter.title}"</strong> ?
              Cette action est irréversible et supprimera également toutes les planches associées.
            </p>
            <div className="flex gap-3">
              <button
                onClick={confirmDeleteChapter}
                disabled={deleting}
                className="flex-1 bg-gradient-to-r from-red to-red/80 text-white py-3 rounded-xl font-semibold hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {deleting ? 'Suppression...' : 'Supprimer'}
              </button>
              <button
                onClick={() => {
                  setShowDeleteModal(false)
                  setDeletingChapter(null)
                }}
                className="px-6 py-3 bg-darkest border-2 border-white/10 text-white rounded-xl hover:bg-darkest/80 transition"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function ChaptersPage() {
  return (
    <AuthGuard>
      <ChaptersPageContent />
    </AuthGuard>
  )
}
