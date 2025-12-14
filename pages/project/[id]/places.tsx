import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '@/lib/supabase'
import type { Place, Project } from '@/lib/supabase'
import Link from 'next/link'
import AuthGuard from '@/components/AuthGuard'
import ProjectSidebar from '@/components/project/ProjectSidebar'
import ProjectTopbar from '@/components/project/ProjectTopbar'
import PlacesIcon from '@/components/icons/PlacesIcon'
import { AMBIANCES } from '@/lib/projectConfig'
import { useProjectStore } from '@/lib/stores/projectStore'

function PlacesPageContent() {
  const router = useRouter()
  const { id } = router.query
  const { project, places, loading, loadAllProjectData, setPlaces } = useProjectStore()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  
  // États pour les modals
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState<string | null>(null)
  
  // États pour créer un lieu
  const [newPlaceName, setNewPlaceName] = useState('')
  const [newPlaceDescription, setNewPlaceDescription] = useState('')
  const [newPlaceAmbiance, setNewPlaceAmbiance] = useState<string>('')
  const [newPlaceAmbianceCustom, setNewPlaceAmbianceCustom] = useState('')
  const [newPlaceImageFile, setNewPlaceImageFile] = useState<File | null>(null)
  const [newPlaceImagePreview, setNewPlaceImagePreview] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    if (id && typeof id === 'string') {
      // Charger TOUT en une fois si pas déjà chargé
      loadAllProjectData(id)
    }
  }, [id, loadAllProjectData])

  const handleCreatePlace = async (e?: React.MouseEvent) => {
    e?.preventDefault()
    e?.stopPropagation()
    
    if (!newPlaceName.trim() || !id || typeof id !== 'string') return

    setCreating(true)
    try {
      let imageUrl = null

      if (newPlaceImageFile) {
        const fileExt = newPlaceImageFile.name.split('.').pop()
        const fileName = `${Math.random()}.${fileExt}`
        const filePath = `places/${id}/${fileName}`

        const { error: uploadError } = await supabase.storage
          .from('images')
          .upload(filePath, newPlaceImageFile)

        if (uploadError) throw uploadError

        const { data: { publicUrl } } = supabase.storage
          .from('images')
          .getPublicUrl(filePath)

        imageUrl = publicUrl
      }

      const { data, error } = await supabase
        .from('places')
        .insert([
          {
            project_id: id,
            name: newPlaceName,
            description: newPlaceDescription || null,
            image_url: imageUrl,
            ambiance: newPlaceAmbiance || null,
            ambiance_custom: newPlaceAmbiance === 'custom' ? newPlaceAmbianceCustom : null,
            variations: [],
            reference_images: [],
          },
        ])
        .select()
        .single()

      if (error) throw error

      // Réinitialiser le formulaire
      setNewPlaceName('')
      setNewPlaceDescription('')
      setNewPlaceAmbiance('')
      setNewPlaceAmbianceCustom('')
      setNewPlaceImageFile(null)
      setNewPlaceImagePreview(null)
      setShowCreateModal(false)
      
      // Recharger les données du projet
      if (id && typeof id === 'string') {
        await loadAllProjectData(id)
      }
    } catch (error) {
      console.error('Error creating place:', error)
      alert('Erreur lors de la création du lieu')
    } finally {
      setCreating(false)
    }
  }

  const handleDeletePlace = async (placeId: string) => {
    try {
      const { error } = await supabase
        .from('places')
        .delete()
        .eq('id', placeId)

      if (error) throw error
      setShowDeleteModal(null)
      // Recharger les données du projet
      if (id && typeof id === 'string') {
        await loadAllProjectData(id)
      }
    } catch (error) {
      console.error('Error deleting place:', error)
      alert('Erreur lors de la suppression du lieu')
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setNewPlaceImageFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setNewPlaceImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
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
        activeSection="places"
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
                  <PlacesIcon size={32} className="flex-shrink-0" />
                  Lieux & Décors
                </h1>
                <p className="text-white/70">Gérez les lieux et décors utilisés comme fonds de chapitre</p>
              </div>
            </div>

            {/* Bouton créer */}
            <div className="mb-6 flex justify-end">
              <button
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  setShowCreateModal(true)
                }}
                className="bg-gradient-to-r from-primary to-accent text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition transform hover:scale-105"
                style={{ zIndex: 1000 }}
              >
                + Créer un nouveau lieu
              </button>
            </div>

            {/* Liste des lieux */}
            {places.length === 0 ? (
              <div className="bg-darker/90 backdrop-blur-sm rounded-2xl p-12 border-2 border-primary/50 text-center">
                <div className="text-6xl mb-4">🏛️</div>
                <h2 className="text-2xl font-bold text-white mb-2">Aucun lieu</h2>
                <p className="text-white/70 mb-6">Créez votre premier lieu pour commencer</p>
                <button
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    setShowCreateModal(true)
                  }}
                  className="bg-gradient-to-r from-primary to-accent text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition"
                >
                  Créer un lieu
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {places.map((place) => {
                  const placeAmbiance = place.ambiance === 'custom' 
                    ? place.ambiance_custom 
                    : AMBIANCES.find(a => a.value === place.ambiance)?.label || place.ambiance
                  
                  return (
                    <div
                      key={place.id}
                      className="bg-darker/90 backdrop-blur-sm rounded-2xl p-6 border-2 border-primary/50 hover:border-primary/80 transition group"
                    >
                      <div className="flex items-start gap-4 mb-4">
                        {place.image_url ? (
                          <img
                            src={place.image_url}
                            alt={place.name}
                            className="w-20 h-20 rounded-xl object-cover border-2 border-primary/50"
                          />
                        ) : (
                          <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-black text-2xl">
                            🏛️
                          </div>
                        )}
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-xl font-bold text-white">{place.name}</h3>
                          </div>
                          {place.description && (
                            <p className="text-white/60 text-sm line-clamp-2 mb-2">{place.description}</p>
                          )}
                          {placeAmbiance && (
                            <span className="inline-block px-2 py-1 bg-primary/20 text-primary rounded text-xs">
                              {placeAmbiance}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Variations et références */}
                      <div className="mb-4 space-y-2">
                        {place.variations && place.variations.length > 0 && (
                          <div>
                            <p className="text-white/50 text-xs mb-1">Variations:</p>
                            <div className="flex flex-wrap gap-1">
                              {place.variations.map((variation, idx) => (
                                <span key={idx} className="px-2 py-0.5 bg-accent/20 text-accent rounded text-xs">
                                  {variation}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        {place.reference_images && place.reference_images.length > 0 && (
                          <div>
                            <p className="text-white/50 text-xs mb-1">Références: {place.reference_images.length}</p>
                          </div>
                        )}
                      </div>

                      <div className="flex gap-2 mt-4">
                        <Link
                          href={`/project/${id}/place/${place.id}`}
                          className="flex-1 bg-primary/20 hover:bg-primary/30 text-white px-4 py-2 rounded-lg font-semibold text-center transition transform hover:scale-105 hover:shadow-lg relative overflow-hidden group"
                        >
                          <span className="relative z-10">✏️ Modifier</span>
                          <div className="absolute inset-0 bg-gradient-to-r from-primary to-accent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        </Link>
                        <button
                          onClick={() => setShowDeleteModal(place.id)}
                          className="px-4 py-2 bg-transparent hover:bg-red-500/20 text-white/60 hover:text-red-400 rounded-lg font-semibold transition-all duration-200 hover:scale-110 flex items-center justify-center w-10 h-10"
                          title="Supprimer"
                        >
                          <span className="text-xl">×</span>
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal créer lieu */}
      {showCreateModal && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowCreateModal(false)
            }
          }}
        >
          <div
            className="bg-darker/95 backdrop-blur-md rounded-2xl p-6 border-2 border-primary/50 max-w-md w-full"
            style={{ zIndex: 10000 }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <PlacesIcon size={24} className="flex-shrink-0" />
              Créer un nouveau lieu
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-white/70 mb-2">
                  Nom <span className="text-white">*</span>
                </label>
                <input
                  type="text"
                  value={newPlaceName}
                  onChange={(e) => setNewPlaceName(e.target.value)}
                  placeholder="Nom du lieu"
                  className="w-full px-4 py-2 bg-darkest border-2 border-white/10 rounded-xl focus:outline-none focus:border-primary transition text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-white/70 mb-2">
                  Description
                </label>
                <textarea
                  value={newPlaceDescription}
                  onChange={(e) => setNewPlaceDescription(e.target.value)}
                  placeholder="Description du lieu..."
                  rows={3}
                  className="w-full px-4 py-2 bg-darkest border-2 border-white/10 rounded-xl focus:outline-none focus:border-primary transition text-white resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-white/70 mb-2">
                  Ambiance
                </label>
                <div className="grid grid-cols-2 gap-2 mb-2">
                  {AMBIANCES.filter(a => a.value !== 'custom').map((ambiance) => (
                    <button
                      key={ambiance.value}
                      type="button"
                      onClick={() => setNewPlaceAmbiance(ambiance.value)}
                      className={`px-3 py-2 rounded-lg font-semibold text-sm transition border-2 ${
                        newPlaceAmbiance === ambiance.value
                          ? `bg-gradient-to-r from-primary to-accent text-white border-transparent`
                          : 'bg-darkest border-white/10 text-white/70 hover:border-white/20'
                      }`}
                    >
                      {ambiance.label}
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => setNewPlaceAmbiance('custom')}
                  className={`w-full px-3 py-2 rounded-lg font-semibold text-sm transition border-2 ${
                    newPlaceAmbiance === 'custom'
                      ? `bg-gradient-to-r from-primary to-accent text-white border-transparent`
                      : 'bg-darkest border-white/10 text-white/70 hover:border-white/20'
                  }`}
                >
                  Custom + IA
                </button>
                {newPlaceAmbiance === 'custom' && (
                  <input
                    type="text"
                    value={newPlaceAmbianceCustom}
                    onChange={(e) => setNewPlaceAmbianceCustom(e.target.value)}
                    placeholder="Décrivez l'ambiance personnalisée..."
                    className="w-full mt-2 px-4 py-2 bg-darkest border-2 border-white/10 rounded-xl focus:outline-none focus:border-primary transition text-white"
                  />
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-white/70 mb-2">
                  Image
                </label>
                <div className="border-2 border-dashed border-white/20 rounded-xl p-4 hover:border-primary/50 transition cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="w-full cursor-pointer text-white/70 text-sm"
                  />
                </div>
                {newPlaceImagePreview && (
                  <div className="mt-4 rounded-xl overflow-hidden border-2 border-primary/50">
                    <img
                      src={newPlaceImagePreview}
                      alt="Preview"
                      className="w-full h-48 object-cover"
                    />
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleCreatePlace}
                  disabled={!newPlaceName.trim() || creating}
                  className="flex-1 bg-gradient-to-r from-primary to-accent text-white py-3 rounded-xl font-semibold hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {creating ? '⏳ Création...' : '✨ Créer'}
                </button>
                <button
                  onClick={() => {
                    setShowCreateModal(false)
                    setNewPlaceName('')
                    setNewPlaceDescription('')
                    setNewPlaceAmbiance('')
                    setNewPlaceAmbianceCustom('')
                    setNewPlaceImageFile(null)
                    setNewPlaceImagePreview(null)
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

      {/* Modal supprimer */}
      {showDeleteModal && (() => {
        const placeToDelete = places.find(p => p.id === showDeleteModal)
        
        return (
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setShowDeleteModal(null)
              }
            }}
          >
            <div
              className="bg-darker/95 backdrop-blur-md rounded-2xl p-6 border-2 border-red-500/50 max-w-md w-full"
              style={{ zIndex: 10000 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl">🏛️</span>
                <h2 className="text-2xl font-bold text-white">Supprimer le lieu</h2>
              </div>
              {placeToDelete && (
                <div className="mb-4 p-4 bg-darkest/50 rounded-xl border border-white/10">
                  <p className="text-white font-semibold text-lg">{placeToDelete.name}</p>
                  {placeToDelete.description && (
                    <p className="text-white/60 text-sm mt-1 line-clamp-2">{placeToDelete.description}</p>
                  )}
                </div>
              )}
              <p className="text-white/70 mb-6">
                Êtes-vous sûr de vouloir supprimer ce lieu ? Cette action est irréversible.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => handleDeletePlace(showDeleteModal)}
                  className="flex-1 bg-red-500 text-white py-3 rounded-xl font-semibold hover:bg-red-600 transition transform hover:scale-105"
                >
                  Supprimer
                </button>
                <button
                  onClick={() => setShowDeleteModal(null)}
                  className="px-6 py-3 bg-darkest border-2 border-white/10 text-white rounded-xl hover:bg-darkest/80 transition"
                >
                  Annuler
                </button>
              </div>
            </div>
          </div>
        )
      })()}
    </div>
  )
}

export default function PlacesPage() {
  return (
    <AuthGuard>
      <PlacesPageContent />
    </AuthGuard>
  )
}
