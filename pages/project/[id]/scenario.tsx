import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '@/lib/supabase'
import type { Scenario, ChapterNotes, Project, Chapter } from '@/lib/supabase'
import AuthGuard from '@/components/AuthGuard'
import ProjectSidebar from '@/components/project/ProjectSidebar'
import ProjectTopbar from '@/components/project/ProjectTopbar'
import ScenarioIcon from '@/components/icons/ScenarioIcon'
import { useProjectStore } from '@/lib/stores/projectStore'

// Composant pour les notes de chapitre
function ChapterNotesList({ 
  chapters, 
  chapterNotes, 
  onSaveNote 
}: { 
  chapters: Chapter[]
  chapterNotes: ChapterNotes[]
  onSaveNote: (chapterId: string, notes: string) => Promise<void>
}) {
  const [notesState, setNotesState] = useState<Record<string, string>>({})
  const [savingStates, setSavingStates] = useState<Record<string, boolean>>({})

  useEffect(() => {
    const initialNotes: Record<string, string> = {}
    chapterNotes.forEach(note => {
      initialNotes[note.chapter_id] = note.notes || ''
    })
    setNotesState(initialNotes)
  }, [chapterNotes])

  const handleNoteChange = (chapterId: string, value: string) => {
    setNotesState(prev => ({ ...prev, [chapterId]: value }))
  }

  const handleNoteBlur = async (chapterId: string, currentNote: string) => {
    const originalNote = chapterNotes.find(n => n.chapter_id === chapterId)?.notes || ''
    if (currentNote !== originalNote) {
      setSavingStates(prev => ({ ...prev, [chapterId]: true }))
      await onSaveNote(chapterId, currentNote)
      setSavingStates(prev => ({ ...prev, [chapterId]: false }))
    }
  }

  return (
    <div className="space-y-4">
      {chapters.map((chapter) => {
        const note = chapterNotes.find(n => n.chapter_id === chapter.id)
        const currentNote = notesState[chapter.id] ?? (note?.notes || '')
        const isSaving = savingStates[chapter.id] || false

        return (
          <div
            key={chapter.id}
            className="p-4 bg-darkest/50 rounded-xl border-2 border-white/5"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary/30 to-accent/30 flex items-center justify-center text-white font-bold">
                {chapter.order}
              </div>
              <div className="flex-1">
                <h3 className="text-white font-semibold">{chapter.title}</h3>
                <p className="text-white/50 text-xs">Chapitre {chapter.order}</p>
              </div>
            </div>
            <textarea
              value={currentNote}
              onChange={(e) => handleNoteChange(chapter.id, e.target.value)}
              onBlur={() => handleNoteBlur(chapter.id, currentNote)}
              placeholder="Notes scénaristiques pour ce chapitre (événements clés, dialogues importants, révélations, etc.)..."
              rows={4}
              className="w-full px-4 py-2 bg-darkest border-2 border-white/10 rounded-xl focus:outline-none focus:border-primary transition text-white resize-none"
            />
            {isSaving && (
              <p className="text-primary text-xs mt-2">💾 Sauvegarde...</p>
            )}
          </div>
        )
      })}
    </div>
  )
}

interface NarrativeArc {
  id: string
  title: string
  description: string
  chapters: number[] // Ordres des chapitres concernés
}

function ScenarioPageContent() {
  const router = useRouter()
  const { id } = router.query
  const { project, chapters, scenario, chapterNotes, loading, loadAllProjectData, setScenario, setChapterNotes } = useProjectStore()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  
  // États pour l'édition
  const [globalPlot, setGlobalPlot] = useState('')
  const [narrativeArcs, setNarrativeArcs] = useState<NarrativeArc[]>([])
  const [editingArcId, setEditingArcId] = useState<string | null>(null)
  const [newArcTitle, setNewArcTitle] = useState('')
  const [newArcDescription, setNewArcDescription] = useState('')
  const [newArcChapters, setNewArcChapters] = useState<number[]>([])
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    // Ne pas exécuter côté serveur (SSR)
    if (typeof window === 'undefined') {
      return
    }
    
    if (id && typeof id === 'string') {
      // Charger TOUT en une fois si pas déjà chargé
      loadAllProjectData(id)
    }
  }, [id, loadAllProjectData])
  
  // Initialiser les états locaux depuis le store quand le scenario est chargé
  useEffect(() => {
    if (scenario) {
      setGlobalPlot(scenario.global_plot || '')
      setNarrativeArcs((scenario.narrative_arcs as NarrativeArc[]) || [])
    }
  }, [scenario])

  const saveScenario = async () => {
    if (!scenario || !id || typeof id !== 'string') return

    setSaving(true)
    try {
      const { data, error } = await supabase
        .from('scenario')
        .update({
          global_plot: globalPlot,
          narrative_arcs: narrativeArcs,
        })
        .eq('id', scenario.id)
        .select()
        .single()

      if (error) throw error
      // Mettre à jour le store
      setScenario(data)
      alert('Scénario sauvegardé avec succès')
    } catch (error) {
      console.error('Error saving scenario:', error)
      alert('Erreur lors de la sauvegarde du scénario')
    } finally {
      setSaving(false)
    }
  }

  const addNarrativeArc = () => {
    const newArc: NarrativeArc = {
      id: Date.now().toString(),
      title: newArcTitle,
      description: newArcDescription,
      chapters: newArcChapters,
    }
    setNarrativeArcs([...narrativeArcs, newArc])
    setNewArcTitle('')
    setNewArcDescription('')
    setNewArcChapters([])
    setEditingArcId(null)
  }

  const updateNarrativeArc = (arcId: string) => {
    setNarrativeArcs(narrativeArcs.map(arc => 
      arc.id === arcId 
        ? { ...arc, title: newArcTitle, description: newArcDescription, chapters: newArcChapters }
        : arc
    ))
    setEditingArcId(null)
    setNewArcTitle('')
    setNewArcDescription('')
    setNewArcChapters([])
  }

  const deleteNarrativeArc = (arcId: string) => {
    setNarrativeArcs(narrativeArcs.filter(arc => arc.id !== arcId))
  }

  const saveChapterNote = async (chapterId: string, notes: string) => {
    if (!id || typeof id !== 'string') return

    try {
      // Vérifier si une note existe déjà
      const existingNote = chapterNotes.find(n => n.chapter_id === chapterId)

      if (existingNote) {
        const { data, error } = await supabase
          .from('chapter_notes')
          .update({ notes })
          .eq('id', existingNote.id)
          .select()
          .single()

        if (error) throw error
        // Mettre à jour le store
        setChapterNotes(chapterNotes.map(n => n.id === existingNote.id ? data : n))
      } else {
        const { data, error } = await supabase
          .from('chapter_notes')
          .insert([{
            chapter_id: chapterId,
            project_id: id,
            notes,
          }])
          .select()
          .single()

        if (error) throw error
        // Mettre à jour le store
        setChapterNotes([...chapterNotes, data])
      }
    } catch (error) {
      console.error('Error saving chapter note:', error)
      alert('Erreur lors de la sauvegarde de la note')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center creative-bg">
        <div className="text-2xl gradient-text font-bold animate-pulse">Chargement...</div>
      </div>
    )
  }

  if (!project || !id || typeof id !== 'string') {
    return (
      <div className="min-h-screen flex items-center justify-center creative-bg">
        <div className="text-2xl gradient-text font-bold">Projet non trouvé</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen creative-bg">
      <ProjectSidebar
        projectId={id}
        activeSection="scenario"
        isCollapsed={sidebarCollapsed}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        onMobileToggle={() => setSidebarOpen(!sidebarOpen)}
        onClose={() => setSidebarOpen(false)}
      />
      
      <div className={`transition-all duration-300 ${
        sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-52'
      }`}>
        <ProjectTopbar
          projectId={id}
          sidebarCollapsed={sidebarCollapsed}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        />

        <div className="p-4 lg:p-8 mt-16">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-6">
              <div className="bg-darker/90 backdrop-blur-sm rounded-2xl p-6 border-2 border-white/10">
                <h1 className="text-3xl font-bold mb-2 gradient-text flex items-center gap-3">
                  <ScenarioIcon size={32} className="flex-shrink-0" />
                  Scénario
                </h1>
                <p className="text-white/70">Trame globale, arcs narratifs et notes par chapitre - Boussole narrative lors de l'édition</p>
              </div>
            </div>

            {/* 1. Trame globale */}
            <div className="mb-6 bg-darker/90 backdrop-blur-sm rounded-2xl p-6 border-2 border-white/10">
              <h2 className="text-2xl font-bold text-white mb-4">📖 Trame globale</h2>
              <textarea
                value={globalPlot}
                onChange={(e) => setGlobalPlot(e.target.value)}
                placeholder="Décrivez la trame globale de votre webtoon... L'histoire principale, les enjeux, le dénouement prévu..."
                rows={8}
                className="w-full px-4 py-3 bg-darkest border-2 border-white/10 rounded-xl focus:outline-none focus:border-primary transition text-white resize-none"
              />
              <p className="text-white/50 text-xs mt-2">
                Cette trame sert de boussole narrative lors de l'édition de vos chapitres
              </p>
            </div>

            {/* 2. Arcs narratifs */}
            <div className="mb-6 bg-darker/90 backdrop-blur-sm rounded-2xl p-6 border-2 border-white/10">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-white">🎭 Arcs narratifs</h2>
                <button
                  onClick={() => {
                    setEditingArcId('new')
                    setNewArcTitle('')
                    setNewArcDescription('')
                    setNewArcChapters([])
                  }}
                  className="px-4 py-2 bg-gradient-to-r from-primary to-accent text-white rounded-lg font-semibold hover:shadow-lg transition"
                >
                  + Ajouter un arc
                </button>
              </div>

              {/* Formulaire d'ajout/édition d'arc */}
              {editingArcId && (
                <div className="mb-6 p-4 bg-darkest/50 rounded-xl border-2 border-primary/30">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-white/70 mb-2">
                        Titre de l'arc
                      </label>
                      <input
                        type="text"
                        value={newArcTitle}
                        onChange={(e) => setNewArcTitle(e.target.value)}
                        placeholder="Ex: Arc de l'introduction, Arc du conflit..."
                        className="w-full px-4 py-2 bg-darkest border-2 border-white/10 rounded-xl focus:outline-none focus:border-primary transition text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-white/70 mb-2">
                        Description
                      </label>
                      <textarea
                        value={newArcDescription}
                        onChange={(e) => setNewArcDescription(e.target.value)}
                        placeholder="Décrivez cet arc narratif..."
                        rows={4}
                        className="w-full px-4 py-2 bg-darkest border-2 border-white/10 rounded-xl focus:outline-none focus:border-primary transition text-white resize-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-white/70 mb-2">
                        Chapitres concernés
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {chapters.map((chapter) => {
                          const isSelected = newArcChapters.includes(chapter.order)
                          return (
                            <button
                              key={chapter.id}
                              type="button"
                              onClick={() => {
                                if (isSelected) {
                                  setNewArcChapters(newArcChapters.filter(o => o !== chapter.order))
                                } else {
                                  setNewArcChapters([...newArcChapters, chapter.order])
                                }
                              }}
                              className={`px-3 py-1 rounded-lg text-sm font-semibold transition ${
                                isSelected
                                  ? 'bg-gradient-to-r from-primary to-accent text-white'
                                  : 'bg-darkest border-2 border-white/10 text-white/70 hover:border-primary/50'
                              }`}
                            >
                              Ch. {chapter.order}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={() => {
                          if (editingArcId === 'new') {
                            addNarrativeArc()
                          } else {
                            updateNarrativeArc(editingArcId)
                          }
                        }}
                        disabled={!newArcTitle.trim()}
                        className="px-4 py-2 bg-gradient-to-r from-primary to-accent text-white rounded-lg font-semibold hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {editingArcId === 'new' ? 'Ajouter' : 'Enregistrer'}
                      </button>
                      <button
                        onClick={() => {
                          setEditingArcId(null)
                          setNewArcTitle('')
                          setNewArcDescription('')
                          setNewArcChapters([])
                        }}
                        className="px-4 py-2 bg-darkest border-2 border-white/10 text-white rounded-lg hover:bg-darkest/80 transition"
                      >
                        Annuler
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Liste des arcs narratifs */}
              {narrativeArcs.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-5xl mb-3">🎭</div>
                  <p className="text-white/60 mb-4">Aucun arc narratif défini</p>
                  <p className="text-white/40 text-sm">Créez votre premier arc pour structurer votre histoire</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {narrativeArcs.map((arc) => {
                    const arcChapters = chapters.filter(c => arc.chapters.includes(c.order))
                    return (
                      <div
                        key={arc.id}
                        className="p-4 bg-darkest/50 rounded-xl border-2 border-primary/30"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <h3 className="text-xl font-bold text-white mb-2">{arc.title}</h3>
                            <p className="text-white/70 text-sm mb-3">{arc.description}</p>
                            {arcChapters.length > 0 && (
                              <div className="flex flex-wrap gap-2">
                                <span className="text-white/50 text-xs">Chapitres:</span>
                                {arcChapters.map((chapter) => (
                                  <span
                                    key={chapter.id}
                                    className="px-2 py-1 bg-primary/20 text-primary rounded text-xs"
                                  >
                                    Ch. {chapter.order}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                          <div className="flex gap-2 ml-4">
                            <button
                              onClick={() => {
                                setEditingArcId(arc.id)
                                setNewArcTitle(arc.title)
                                setNewArcDescription(arc.description)
                                setNewArcChapters(arc.chapters)
                              }}
                              className="px-3 py-1 bg-primary/20 text-primary rounded-lg text-sm hover:bg-primary/30 transition"
                            >
                              ✏️ Modifier
                            </button>
                            <button
                              onClick={() => deleteNarrativeArc(arc.id)}
                              className="px-3 py-1 bg-red-500/20 text-red-400 rounded-lg text-sm hover:bg-red-500/30 transition"
                            >
                              🗑️ Supprimer
                            </button>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* 3. Notes par chapitre */}
            <div className="mb-6 bg-darker/90 backdrop-blur-sm rounded-2xl p-6 border-2 border-white/10">
              <h2 className="text-2xl font-bold text-white mb-4">📝 Notes par chapitre</h2>
              <p className="text-white/50 text-sm mb-4">
                Ajoutez des notes scénaristiques pour chaque chapitre - Ces notes servent de boussole narrative lors de l'édition
              </p>

              {chapters.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-5xl mb-3">📖</div>
                  <p className="text-white/60 mb-4">Aucun chapitre créé</p>
                  <p className="text-white/40 text-sm">Créez des chapitres pour ajouter des notes scénaristiques</p>
                </div>
              ) : (
                <ChapterNotesList
                  chapters={chapters}
                  chapterNotes={chapterNotes}
                  onSaveNote={saveChapterNote}
                />
              )}
            </div>

            {/* Bouton sauvegarder */}
            <div className="flex justify-end">
              <button
                onClick={saveScenario}
                disabled={saving}
                className="px-6 py-3 bg-gradient-to-r from-primary to-accent text-white rounded-xl font-semibold hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? '⏳ Sauvegarde...' : '💾 Sauvegarder le scénario'}
              </button>
            </div>
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

export default function ScenarioPage() {
  return (
    <AuthGuard>
      <ScenarioPageContent />
    </AuthGuard>
  )
}
