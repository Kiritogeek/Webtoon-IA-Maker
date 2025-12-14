import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { supabase, getUser, type Project, type ProjectVisualReference } from '@/lib/supabase'
import AuthGuard from '@/components/AuthGuard'
import ProjectSidebar from '@/components/project/ProjectSidebar'
import ProjectTopbar from '@/components/project/ProjectTopbar'
import { getProjectBackground } from '@/lib/backgroundPresets'
import { useProjectStore } from '@/lib/stores/projectStore'

function IdentiteVisuellePageContent() {
  const router = useRouter()
  const { id } = router.query
  const projectId = typeof id === 'string' ? id : ''

  const { project, loadAllProjectData } = useProjectStore()
  const [references, setReferences] = useState<ProjectVisualReference[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [reordering, setReordering] = useState(false)
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)

  // États pour le résumé de style
  const [styleSummary, setStyleSummary] = useState<string | null>(null)
  const [generatingSummary, setGeneratingSummary] = useState(false)
  const [stylePrompt, setStylePrompt] = useState<string | null>(null)
  const [editingPrompt, setEditingPrompt] = useState(false)

  // États pour l'aperçu de cohérence
  const [coherencePreview, setCoherencePreview] = useState<{
    face?: string
    place?: string
    panel?: string
  } | null>(null)
  const [generatingPreview, setGeneratingPreview] = useState(false)

  const loadReferences = async () => {
    if (!projectId || projectId === '') return

    try {
      const { data, error: refError } = await supabase
        .from('project_visual_references')
        .select('*')
        .eq('project_id', projectId)
        .order('display_order', { ascending: true })

      if (refError) throw refError
      setReferences(data || [])
    } catch (err: any) {
      console.error('Error loading references:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (projectId && projectId !== '') {
      loadAllProjectData(projectId)
      loadReferences()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId])

  useEffect(() => {
    if (project) {
      setStyleSummary(project.visual_style_summary || null)
      setStylePrompt(project.visual_style_prompt || null)
    }
  }, [project])

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !projectId) return

    // Vérifier la taille (10MB max pour les références)
    if (file.size > 10 * 1024 * 1024) {
      setError('L\'image ne doit pas dépasser 10MB')
      return
    }

    if (!file.type.startsWith('image/')) {
      setError('Le fichier doit être une image')
      return
    }

    setUploading(true)
    setError(null)

    try {
      const { user } = await getUser()
      if (!user) {
        router.push('/auth/login')
        return
      }

      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}/visual-references/${Date.now()}.${fileExt}`

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('images')
        .upload(fileName, file)

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('images')
        .getPublicUrl(fileName)

      // Ajouter la référence avec le bon display_order
      const newOrder = references.length > 0 
        ? Math.max(...references.map(r => r.display_order)) + 1 
        : 0

      const { data: newRef, error: insertError } = await supabase
        .from('project_visual_references')
        .insert([
          {
            project_id: projectId,
            image_url: publicUrl,
            display_order: newOrder,
          },
        ])
        .select()
        .single()

      if (insertError) throw insertError

      setReferences([...references, newRef])
      
      // Recalculer le style automatiquement après ajout
      if (references.length === 0) {
        // Première image : générer le résumé
        generateStyleSummary([...references, newRef])
      } else {
        // Images supplémentaires : recalculer
        generateStyleSummary([...references, newRef])
      }
    } catch (err: any) {
      setError(err.message || 'Erreur lors de l\'upload de l\'image')
    } finally {
      setUploading(false)
      // Réinitialiser l'input
      e.target.value = ''
    }
  }

  const handleDeleteReference = async (refId: string) => {
    if (!confirm('Supprimer cette référence visuelle ?')) return

    try {
      const { error } = await supabase
        .from('project_visual_references')
        .delete()
        .eq('id', refId)

      if (error) throw error

      const updated = references.filter(r => r.id !== refId)
      setReferences(updated)

      // Recalculer le style si des références restent
      if (updated.length > 0) {
        generateStyleSummary(updated)
      } else {
        // Plus de références : réinitialiser le résumé
        setStyleSummary(null)
        if (project) {
          await supabase
            .from('projects')
            .update({ visual_style_summary: null })
            .eq('id', projectId)
        }
      }
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la suppression')
    }
  }

  const handleDragStart = (index: number) => {
    setDraggedIndex(index)
    setReordering(true)
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    if (draggedIndex === null || draggedIndex === index) return

    const newReferences = [...references]
    const dragged = newReferences[draggedIndex]
    newReferences.splice(draggedIndex, 1)
    newReferences.splice(index, 0, dragged)
    setReferences(newReferences)
    setDraggedIndex(index)
  }

  const handleDragEnd = async () => {
    if (draggedIndex === null) return

    try {
      // Mettre à jour les display_order
      const updates = references.map((ref, index) => ({
        id: ref.id,
        display_order: index,
      }))

      for (const update of updates) {
        await supabase
          .from('project_visual_references')
          .update({ display_order: update.display_order })
          .eq('id', update.id)
      }
    } catch (err: any) {
      console.error('Error reordering:', err)
      setError('Erreur lors du réordonnement')
      // Recharger les références
      loadReferences()
    } finally {
      setDraggedIndex(null)
      setReordering(false)
    }
  }

  const generateStyleSummary = async (refs: ProjectVisualReference[] = references) => {
    if (refs.length === 0) return

    setGeneratingSummary(true)
    setError(null)

    try {
      // Appel API pour générer le résumé de style
      const response = await fetch('/api/generate-style-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId,
          imageUrls: refs.map(r => r.image_url),
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Erreur lors de la génération du résumé')
      }

      const { summary } = await response.json()

      // Sauvegarder dans la base de données
      const { error: updateError } = await supabase
        .from('projects')
        .update({ visual_style_summary: summary })
        .eq('id', projectId)

      if (updateError) throw updateError

      setStyleSummary(summary)
      
      // Mettre à jour le store
      if (project) {
        useProjectStore.getState().updateProject({
          ...project,
          visual_style_summary: summary,
        })
      }
    } catch (err: any) {
      console.error('Error generating style summary:', err)
      setError(err.message || 'Erreur lors de la génération du résumé de style')
    } finally {
      setGeneratingSummary(false)
    }
  }

  const handleSaveStylePrompt = async () => {
    if (!projectId) return

    try {
      const { error } = await supabase
        .from('projects')
        .update({ visual_style_prompt: stylePrompt })
        .eq('id', projectId)

      if (error) throw error

      setEditingPrompt(false)
      
      // Mettre à jour le store
      if (project) {
        useProjectStore.getState().updateProject({
          ...project,
          visual_style_prompt: stylePrompt,
        })
      }
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la sauvegarde')
    }
  }

  const generateCoherencePreview = async () => {
    if (references.length === 0) {
      setError('Ajoutez au moins une référence visuelle pour générer un aperçu')
      return
    }

    setGeneratingPreview(true)
    setError(null)

    try {
      const response = await fetch('/api/generate-coherence-preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId,
          imageUrls: references.map(r => r.image_url),
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Erreur lors de la génération de l\'aperçu')
      }

      const { preview } = await response.json()
      setCoherencePreview(preview)
    } catch (err: any) {
      console.error('Error generating preview:', err)
      setError(err.message || 'Erreur lors de la génération de l\'aperçu')
    } finally {
      setGeneratingPreview(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen creative-bg flex items-center justify-center">
        <div className="text-white text-xl">Chargement...</div>
      </div>
    )
  }

  if (!project || !projectId || projectId === '') {
    return (
      <div className="min-h-screen creative-bg flex items-center justify-center">
        <div className="text-white text-xl">Projet non trouvé</div>
      </div>
    )
  }

  return (
    <div 
      className="min-h-screen transition-all duration-300"
      style={{
        background: getProjectBackground(project),
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
        <ProjectSidebar 
          projectId={projectId} 
          activeSection="identity"
          isCollapsed={sidebarCollapsed}
          isOpen={sidebarOpen}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
          onMobileToggle={() => setSidebarOpen(!sidebarOpen)}
          onClose={() => setSidebarOpen(false)}
        />
        <div className={`min-h-screen transition-all duration-300 ${sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-52'}`}>
          <ProjectTopbar 
            projectId={projectId}
            sidebarCollapsed={sidebarCollapsed}
            onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
            onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
          />
          
          <div className="p-4 lg:p-8 mt-16">
            <div className="max-w-7xl mx-auto space-y-6">
              {/* Header */}
              <div className="backdrop-blur-sm rounded-2xl p-6 border border-white/5">
                <h1 className="text-3xl font-black text-white mb-2">🎨 Identité Visuelle</h1>
                <p className="text-white/70 text-sm">
                  Plus vous ajoutez d'images de référence, plus l'IA comprend précisément le style souhaité.
                </p>
              </div>

              {error && (
                <div className="backdrop-blur-sm rounded-2xl p-4 border border-red/50 bg-red/10">
                  <p className="text-red text-sm">{error}</p>
                </div>
              )}

              {/* 1. Références visuelles du projet */}
              <div className="backdrop-blur-sm rounded-2xl p-6 border border-white/5">
                <h2 className="text-xl font-bold text-white mb-4">📌 Références visuelles du projet</h2>
                <p className="text-white/60 text-sm mb-4">
                  Collection d'images servant de base stylistique pour tout le projet. Minimum 1 image.
                </p>

                {/* Grille moodboard */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-4">
                  {references.map((ref, index) => (
                    <div
                      key={ref.id}
                      draggable
                      onDragStart={() => handleDragStart(index)}
                      onDragOver={(e) => handleDragOver(e, index)}
                      onDragEnd={handleDragEnd}
                      className={`relative aspect-square rounded-xl overflow-hidden border-2 border-white/20 hover:border-primary/50 transition group cursor-move ${
                        reordering && draggedIndex === index ? 'opacity-50' : ''
                      }`}
                    >
                      <img
                        src={ref.image_url}
                        alt={`Référence ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                        <button
                          onClick={() => handleDeleteReference(ref.id)}
                          className="px-3 py-1 bg-red/80 text-white rounded-lg text-sm hover:bg-red transition"
                        >
                          Supprimer
                        </button>
                      </div>
                    </div>
                  ))}

                  {/* Bouton ajouter */}
                  <label
                    className={`aspect-square rounded-xl border-2 border-dashed border-white/30 hover:border-primary/50 transition flex flex-col items-center justify-center cursor-pointer bg-darkest/50 ${
                      uploading ? 'opacity-50 pointer-events-none' : ''
                    }`}
                  >
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      disabled={uploading}
                    />
                    {uploading ? (
                      <div className="text-white/50 text-sm">Upload...</div>
                    ) : (
                      <>
                        <svg className="w-8 h-8 text-white/50 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        <span className="text-white/50 text-xs text-center px-2">Ajouter une image</span>
                      </>
                    )}
                  </label>
                </div>

                {references.length === 0 && (
                  <div className="text-center py-8 text-white/50 text-sm">
                    Ajoutez au moins une image de référence pour définir l'identité visuelle de votre projet.
                  </div>
                )}
              </div>

              {/* 2. Style compris par l'IA */}
              {references.length > 0 && (
                <div className="backdrop-blur-sm rounded-2xl p-6 border border-white/5">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-white">🧠 Style compris par l'IA</h2>
                    <button
                      onClick={() => generateStyleSummary()}
                      disabled={generatingSummary}
                      className="px-4 py-2 bg-primary/20 text-primary rounded-lg hover:bg-primary/30 transition text-sm font-medium disabled:opacity-50"
                    >
                      {generatingSummary ? '⏳ Génération...' : '🔄 Recalculer la compréhension'}
                    </button>
                  </div>

                  {styleSummary ? (
                    <div className="bg-darkest/50 rounded-xl p-4 mb-4">
                      <p className="text-white/80 text-sm leading-relaxed">{styleSummary}</p>
                    </div>
                  ) : (
                    <div className="bg-darkest/50 rounded-xl p-4 mb-4 text-center text-white/50 text-sm">
                      Cliquez sur "Recalculer la compréhension" pour générer le résumé de style.
                    </div>
                  )}

                  {/* Ajustement manuel (optionnel) */}
                  <div className="mt-4">
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-white/70 text-sm font-medium">Ajustement manuel (optionnel)</label>
                      {!editingPrompt && (
                        <button
                          onClick={() => setEditingPrompt(true)}
                          className="text-primary text-sm hover:text-primary/80 transition"
                        >
                          ✏️ Modifier
                        </button>
                      )}
                    </div>
                    {editingPrompt ? (
                      <div className="space-y-2">
                        <textarea
                          value={stylePrompt || ''}
                          onChange={(e) => setStylePrompt(e.target.value)}
                          placeholder="Ex: Style semi-réaliste avec des couleurs pastel, traits fins..."
                          rows={3}
                          className="w-full px-4 py-3 bg-darkest border-2 border-white/50 rounded-xl focus:outline-none focus:border-primary transition text-white resize-none text-sm"
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={handleSaveStylePrompt}
                            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/80 transition text-sm font-medium"
                          >
                            Sauvegarder
                          </button>
                          <button
                            onClick={() => {
                              setEditingPrompt(false)
                              setStylePrompt(project.visual_style_prompt || null)
                            }}
                            className="px-4 py-2 bg-dark-gray text-white rounded-lg hover:bg-dark-gray/80 transition text-sm font-medium"
                          >
                            Annuler
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-darkest/50 rounded-xl p-4 text-white/60 text-sm">
                        {stylePrompt || 'Aucun ajustement manuel. Le style est déduit automatiquement par l\'IA.'}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* 3. Règles visuelles déduites (lecture seule) */}
              {styleSummary && (
                <div className="backdrop-blur-sm rounded-2xl p-6 border border-white/5">
                  <h2 className="text-xl font-bold text-white mb-4">📋 Règles visuelles déduites</h2>
                  <p className="text-white/60 text-sm mb-4">
                    Ces règles sont déduites automatiquement et servent à verrouiller la cohérence IA.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {/* Tags basés sur le résumé (simplifié pour l'instant) */}
                    {styleSummary.toLowerCase().includes('semi-réaliste') && (
                      <span className="px-3 py-1 bg-primary/20 text-primary rounded-lg text-xs">Semi-réaliste</span>
                    )}
                    {styleSummary.toLowerCase().includes('sombre') && (
                      <span className="px-3 py-1 bg-primary/20 text-primary rounded-lg text-xs">Ambiance sombre</span>
                    )}
                    {styleSummary.toLowerCase().includes('dramatique') && (
                      <span className="px-3 py-1 bg-primary/20 text-primary rounded-lg text-xs">Dramatique</span>
                    )}
                    {styleSummary.toLowerCase().includes('webtoon') && (
                      <span className="px-3 py-1 bg-primary/20 text-primary rounded-lg text-xs">Style Webtoon</span>
                    )}
                    {styleSummary.toLowerCase().includes('manhwa') && (
                      <span className="px-3 py-1 bg-primary/20 text-primary rounded-lg text-xs">Inspiration Manhwa</span>
                    )}
                  </div>
                </div>
              )}

              {/* 4. Aperçu de cohérence */}
              {references.length > 0 && (
                <div className="backdrop-blur-sm rounded-2xl p-6 border border-white/5">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="text-xl font-bold text-white">✨ Aperçu de cohérence</h2>
                      <p className="text-white/60 text-sm mt-1">
                        Mini preview IA pour montrer ce que l'IA a compris du style.
                      </p>
                    </div>
                    <button
                      onClick={generateCoherencePreview}
                      disabled={generatingPreview}
                      className="px-4 py-2 bg-accent/20 text-accent rounded-lg hover:bg-accent/30 transition text-sm font-medium disabled:opacity-50"
                    >
                      {generatingPreview ? '⏳ Génération...' : '🎨 Générer l\'aperçu'}
                    </button>
                  </div>

                  {coherencePreview ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {coherencePreview.face && (
                        <div className="bg-darkest/50 rounded-xl overflow-hidden">
                          <div className="aspect-square">
                            <img src={coherencePreview.face} alt="Aperçu visage" className="w-full h-full object-cover" />
                          </div>
                          <div className="p-3 text-center text-white/70 text-xs">Visage</div>
                        </div>
                      )}
                      {coherencePreview.place && (
                        <div className="bg-darkest/50 rounded-xl overflow-hidden">
                          <div className="aspect-square">
                            <img src={coherencePreview.place} alt="Aperçu décor" className="w-full h-full object-cover" />
                          </div>
                          <div className="p-3 text-center text-white/70 text-xs">Décor</div>
                        </div>
                      )}
                      {coherencePreview.panel && (
                        <div className="bg-darkest/50 rounded-xl overflow-hidden">
                          <div className="aspect-[2/3]">
                            <img src={coherencePreview.panel} alt="Aperçu panel" className="w-full h-full object-cover" />
                          </div>
                          <div className="p-3 text-center text-white/70 text-xs">Panel</div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="bg-darkest/50 rounded-xl p-8 text-center text-white/50 text-sm">
                      Cliquez sur "Générer l'aperçu" pour voir des exemples de génération IA basés sur vos références.
                    </div>
                  )}
                </div>
              )}

              {/* 5. Utilisation dans le projet */}
              <div className="backdrop-blur-sm rounded-2xl p-6 border border-white/5">
                <h2 className="text-xl font-bold text-white mb-4">🎯 Utilisation dans le projet</h2>
                <p className="text-white/60 text-sm mb-4">
                  L'identité visuelle est automatiquement utilisée dans toutes les générations IA :
                </p>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  {['Personnages', 'Lieux & Décors', 'Chapitres', 'Assets', 'Couverture'].map((item) => (
                    <div key={item} className="bg-darkest/50 rounded-xl p-4 text-center">
                      <div className="text-2xl mb-2">✔</div>
                      <div className="text-white/80 text-xs">{item}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function IdentiteVisuellePage() {
  return (
    <AuthGuard>
      <IdentiteVisuellePageContent />
    </AuthGuard>
  )
}
