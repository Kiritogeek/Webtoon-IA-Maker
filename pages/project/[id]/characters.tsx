import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '@/lib/supabase'
import type { Character, Project } from '@/lib/supabase'
import Link from 'next/link'
import AuthGuard from '@/components/AuthGuard'
import ProjectSidebar from '@/components/project/ProjectSidebar'
import ProjectTopbar from '@/components/project/ProjectTopbar'
import { useProjectStore } from '@/lib/stores/projectStore'
import { getProjectBackground } from '@/lib/backgroundPresets'

type CharacterType = 'character' | 'monster' | 'enemy'

interface TypeConfig {
  label: string
  icon: string
  gradient: string
  borderColor: string
  bgColor: string
  emptyIcon: string
  emptyTitle: string
  emptyDescription: string
}

const TYPE_CONFIGS: Record<CharacterType, TypeConfig> = {
  character: {
    label: 'Personnages',
    icon: '👤',
    gradient: 'from-blue-500 to-cyan-500',
    borderColor: 'border-blue-500/50',
    bgColor: 'bg-blue-500/20',
    emptyIcon: '👤',
    emptyTitle: 'Aucun personnage',
    emptyDescription: 'Créez votre premier personnage pour commencer'
  },
  monster: {
    label: 'Monstres',
    icon: '👹',
    gradient: 'from-purple-500 to-pink-500',
    borderColor: 'border-purple-500/50',
    bgColor: 'bg-purple-500/20',
    emptyIcon: '👹',
    emptyTitle: 'Aucun monstre',
    emptyDescription: 'Créez votre premier monstre pour commencer'
  },
  enemy: {
    label: 'Ennemis',
    icon: '⚔️',
    gradient: 'from-red-500 to-orange-500',
    borderColor: 'border-red-500/50',
    bgColor: 'bg-red-500/20',
    emptyIcon: '⚔️',
    emptyTitle: 'Aucun ennemi',
    emptyDescription: 'Créez votre premier ennemi pour commencer'
  }
}

function CharactersPageContent() {
  const router = useRouter()
  const { id } = router.query
  const { project, characters, loading, loadAllProjectData, setCharacters } = useProjectStore()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  
  // État pour l'onglet actif
  const [activeTab, setActiveTab] = useState<CharacterType>('character')
  
  // États pour les modals
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState<string | null>(null)
  
  // États pour créer un personnage
  const [newCharacterName, setNewCharacterName] = useState('')
  const [newCharacterDescription, setNewCharacterDescription] = useState('')
  const [newCharacterType, setNewCharacterType] = useState<CharacterType>('character')
  const [newCharacterImageFile, setNewCharacterImageFile] = useState<File | null>(null)
  const [newCharacterImagePreview, setNewCharacterImagePreview] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    if (id && typeof id === 'string') {
      // Charger TOUT en une fois si pas déjà chargé
      loadAllProjectData(id)
    }
  }, [id, loadAllProjectData])

  const handleCreateCharacter = async (e?: React.MouseEvent) => {
    e?.preventDefault()
    e?.stopPropagation()
    
    if (!newCharacterName.trim() || !id || typeof id !== 'string') return

    setCreating(true)
    try {
      let imageUrl = null

      if (newCharacterImageFile) {
        const fileExt = newCharacterImageFile.name.split('.').pop()
        const fileName = `${Math.random()}.${fileExt}`
        const filePath = `characters/${id}/${fileName}`

        const { error: uploadError } = await supabase.storage
          .from('images')
          .upload(filePath, newCharacterImageFile)

        if (uploadError) throw uploadError

        const { data: { publicUrl } } = supabase.storage
          .from('images')
          .getPublicUrl(filePath)

        imageUrl = publicUrl
      }

      const { data, error } = await supabase
        .from('characters')
        .insert([
          {
            project_id: id,
            name: newCharacterName,
            description: newCharacterDescription || null,
            image_url: imageUrl,
            type: newCharacterType,
          },
        ])
        .select()
        .single()

      if (error) throw error

      // Réinitialiser le formulaire
      setNewCharacterName('')
      setNewCharacterDescription('')
      setNewCharacterType('character')
      setNewCharacterImageFile(null)
      setNewCharacterImagePreview(null)
      setShowCreateModal(false)
      
      // Recharger les données du projet
      if (id && typeof id === 'string') {
        await loadAllProjectData(id)
      }
    } catch (error) {
      console.error('Error creating character:', error)
      alert('Erreur lors de la création du personnage')
    } finally {
      setCreating(false)
    }
  }

  const handleDeleteCharacter = async (characterId: string) => {
    try {
      const { error } = await supabase
        .from('characters')
        .delete()
        .eq('id', characterId)

      if (error) throw error
      setShowDeleteModal(null)
      // Recharger les données du projet
      if (id && typeof id === 'string') {
        await loadAllProjectData(id)
      }
    } catch (error) {
      console.error('Error deleting character:', error)
      alert('Erreur lors de la suppression du personnage')
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setNewCharacterImageFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setNewCharacterImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  // Filtrer les personnages par type
  const filteredCharacters = characters.filter(char => {
    const charType = char.type || 'character'
    return charType === activeTab
  })

  const currentConfig = TYPE_CONFIGS[activeTab]

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
        activeSection="characters"
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
                <h1 className="text-3xl font-bold mb-2 gradient-text">👤 Personnages</h1>
                <p className="text-white/70">Gérez les personnages, monstres et ennemis de votre webtoon</p>
              </div>
            </div>

            {/* Onglets */}
            <div className="mb-6 flex gap-2 bg-darker/50 backdrop-blur-sm rounded-xl p-2 border-2 border-white/10">
              {(Object.keys(TYPE_CONFIGS) as CharacterType[]).map((type) => {
                const config = TYPE_CONFIGS[type]
                const isActive = activeTab === type
                const count = characters.filter(c => (c.type || 'character') === type).length
                
                return (
                  <button
                    key={type}
                    onClick={() => setActiveTab(type)}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-semibold transition-all ${
                      isActive
                        ? `bg-gradient-to-r ${config.gradient} text-white shadow-lg`
                        : 'text-white/70 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <span className="text-xl">{config.icon}</span>
                    <span>{config.label}</span>
                    {count > 0 && (
                      <span className={`px-2 py-0.5 rounded-full text-xs ${
                        isActive ? 'bg-white/20' : 'bg-white/10'
                      }`}>
                        {count}
                      </span>
                    )}
                  </button>
                )
              })}
            </div>

            {/* Bouton créer */}
            <div className="mb-6 flex justify-end">
              <button
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  setNewCharacterType(activeTab)
                  setShowCreateModal(true)
                }}
                className={`bg-gradient-to-r ${currentConfig.gradient} text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition transform hover:scale-105`}
                style={{ zIndex: 1000 }}
              >
                + Créer un nouveau {activeTab === 'character' ? 'personnage' : activeTab === 'monster' ? 'monstre' : 'ennemi'}
              </button>
            </div>

            {/* Liste des personnages */}
            {filteredCharacters.length === 0 ? (
              <div className={`bg-darker/90 backdrop-blur-sm rounded-2xl p-12 border-2 ${currentConfig.borderColor} text-center`}>
                <div className="text-6xl mb-4">{currentConfig.emptyIcon}</div>
                <h2 className="text-2xl font-bold text-white mb-2">{currentConfig.emptyTitle}</h2>
                <p className="text-white/70 mb-6">{currentConfig.emptyDescription}</p>
                <button
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    setNewCharacterType(activeTab)
                    setShowCreateModal(true)
                  }}
                  className={`bg-gradient-to-r ${currentConfig.gradient} text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition`}
                >
                  Créer un {activeTab === 'character' ? 'personnage' : activeTab === 'monster' ? 'monstre' : 'ennemi'}
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCharacters.map((character) => {
                  const charType = (character.type || 'character') as CharacterType
                  const charConfig = TYPE_CONFIGS[charType]
                  
                  return (
                    <div
                      key={character.id}
                      className={`bg-darker/90 backdrop-blur-sm rounded-2xl p-6 border-2 ${charConfig.borderColor} hover:${charConfig.borderColor.replace('/50', '/80')} transition group`}
                    >
                      <div className="flex items-start gap-4 mb-4">
                        {character.image_url ? (
                          <img
                            src={character.image_url}
                            alt={character.name}
                            className={`w-20 h-20 rounded-xl object-cover border-2 ${charConfig.borderColor}`}
                          />
                        ) : (
                          <div className={`w-20 h-20 rounded-xl bg-gradient-to-br ${charConfig.gradient} flex items-center justify-center text-white font-black text-2xl`}>
                            {character.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-xl font-bold text-white">{character.name}</h3>
                            <span className="text-lg">{charConfig.icon}</span>
                          </div>
                          {character.description && (
                            <p className="text-white/60 text-sm line-clamp-2">{character.description}</p>
                          )}
                        </div>
                      </div>

                      <div className="flex gap-2 mt-4">
                        <Link
                          href={`/project/${id}/character/${character.id}`}
                          className={`flex-1 ${charConfig.bgColor} hover:${charConfig.bgColor.replace('/20', '/30')} text-white px-4 py-2 rounded-lg font-semibold text-center transition transform hover:scale-105 hover:shadow-lg relative overflow-hidden group`}
                        >
                          <span className="relative z-10">✏️ Modifier</span>
                          <div className={`absolute inset-0 bg-gradient-to-r ${charConfig.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
                        </Link>
                        <button
                          onClick={() => setShowDeleteModal(character.id)}
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

      {/* Modal créer personnage */}
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
            className={`bg-darker/95 backdrop-blur-md rounded-2xl p-6 border-2 ${currentConfig.borderColor} max-w-md w-full`}
            style={{ zIndex: 10000 }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-2xl font-bold text-white mb-4">
              Créer un nouveau {newCharacterType === 'character' ? 'personnage' : newCharacterType === 'monster' ? 'monstre' : 'ennemi'}
            </h2>
            
            <div className="space-y-4">
              {/* Sélection du type */}
              <div>
                <label className="block text-sm font-semibold text-white/70 mb-2">
                  Type <span className="text-white">*</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(Object.keys(TYPE_CONFIGS) as CharacterType[]).map((type) => {
                    const config = TYPE_CONFIGS[type]
                    const isSelected = newCharacterType === type
                    return (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setNewCharacterType(type)}
                        className={`px-4 py-3 rounded-lg font-semibold transition border-2 ${
                          isSelected
                            ? `bg-gradient-to-r ${config.gradient} text-white border-transparent`
                            : 'bg-darkest border-white/10 text-white/70 hover:border-white/20'
                        }`}
                      >
                        <div className="text-xl mb-1">{config.icon}</div>
                        <div className="text-xs">{config.label}</div>
                      </button>
                    )
                  })}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-white/70 mb-2">
                  Nom <span className="text-white">*</span>
                </label>
                <input
                  type="text"
                  value={newCharacterName}
                  onChange={(e) => setNewCharacterName(e.target.value)}
                  placeholder="Nom du personnage"
                  className="w-full px-4 py-2 bg-darkest border-2 border-white/10 rounded-xl focus:outline-none focus:border-primary transition text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-white/70 mb-2">
                  Description
                </label>
                <textarea
                  value={newCharacterDescription}
                  onChange={(e) => setNewCharacterDescription(e.target.value)}
                  placeholder="Description..."
                  rows={3}
                  className="w-full px-4 py-2 bg-darkest border-2 border-white/10 rounded-xl focus:outline-none focus:border-primary transition text-white resize-none"
                />
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
                {newCharacterImagePreview && (
                  <div className="mt-4 rounded-xl overflow-hidden border-2 border-primary/50">
                    <img
                      src={newCharacterImagePreview}
                      alt="Preview"
                      className="w-full h-48 object-cover"
                    />
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleCreateCharacter}
                  disabled={!newCharacterName.trim() || creating}
                  className={`flex-1 bg-gradient-to-r ${currentConfig.gradient} text-white py-3 rounded-xl font-semibold hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {creating ? '⏳ Création...' : '✨ Créer'}
                </button>
                <button
                  onClick={() => {
                    setShowCreateModal(false)
                    setNewCharacterName('')
                    setNewCharacterDescription('')
                    setNewCharacterType('character')
                    setNewCharacterImageFile(null)
                    setNewCharacterImagePreview(null)
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
        const characterToDelete = characters.find(c => c.id === showDeleteModal)
        const charType = characterToDelete ? ((characterToDelete.type || 'character') as CharacterType) : 'character'
        const charConfig = TYPE_CONFIGS[charType]
        const typeLabel = charType === 'character' ? 'personnage' : charType === 'monster' ? 'monstre' : 'ennemi'
        
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
                <span className="text-3xl">{charConfig.icon}</span>
                <h2 className="text-2xl font-bold text-white">Supprimer le {typeLabel}</h2>
              </div>
              {characterToDelete && (
                <div className="mb-4 p-4 bg-darkest/50 rounded-xl border border-white/10">
                  <p className="text-white font-semibold text-lg">{characterToDelete.name}</p>
                  {characterToDelete.description && (
                    <p className="text-white/60 text-sm mt-1 line-clamp-2">{characterToDelete.description}</p>
                  )}
                </div>
              )}
              <p className="text-white/70 mb-6">
                Êtes-vous sûr de vouloir supprimer ce {typeLabel} ? Cette action est irréversible.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => handleDeleteCharacter(showDeleteModal)}
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

export default function CharactersPage() {
  return (
    <AuthGuard>
      <CharactersPageContent />
    </AuthGuard>
  )
}
