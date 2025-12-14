import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '@/lib/supabase'
import type { Asset, Project } from '@/lib/supabase'
import AuthGuard from '@/components/AuthGuard'
import ProjectSidebar from '@/components/project/ProjectSidebar'
import ProjectTopbar from '@/components/project/ProjectTopbar'
import { useProjectStore } from '@/lib/stores/projectStore'

// Types d'assets avec icônes
const ASSET_TYPES = [
  { value: 'object', label: 'Objet', icon: '🗡️', description: 'Armes, outils, accessoires' },
  { value: 'effect', label: 'Effet visuel', icon: '✨', description: 'Feu, magie, explosions, aura' },
  { value: 'symbol', label: 'Symbole / UI', icon: '🎭', description: 'Icônes, signes, glyphes' },
  { value: 'environment', label: 'Élément d\'environnement', icon: '🧩', description: 'Porte, table, rocher, arbre' },
  { value: 'narrative', label: 'Élément narratif', icon: '💬', description: 'Bulles, onomatopées stylisées' },
  { value: 'custom', label: 'Custom', icon: '🔁', description: 'Défini librement' },
] as const

const USAGE_CONTEXTS = [
  { value: 'combat', label: 'Combat' },
  { value: 'magie', label: 'Magie' },
  { value: 'décor', label: 'Décor' },
  { value: 'émotion', label: 'Émotion' },
  { value: 'narration', label: 'Narration' },
] as const

const EMOTION_INTENSITIES = [
  { value: 'léger', label: 'Léger' },
  { value: 'violent', label: 'Violent' },
  { value: 'dramatique', label: 'Dramatique' },
  { value: 'épique', label: 'Épique' },
] as const

function AssetsPageContent() {
  const router = useRouter()
  const { id } = router.query
  const projectId = typeof id === 'string' ? id : ''
  
  const { project, loading: projectLoading, loadAllProjectData } = useProjectStore()
  const [assets, setAssets] = useState<Asset[]>([])
  const [loading, setLoading] = useState(true)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  
  // États pour les modals
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState<string | null>(null)
  const [showPreviewModal, setShowPreviewModal] = useState<string | null>(null)
  
  // États pour la création d'asset (4 étapes)
  const [createStep, setCreateStep] = useState(1)
  const [assetType, setAssetType] = useState<Asset['type'] | ''>('')
  const [assetName, setAssetName] = useState('')
  const [assetDescription, setAssetDescription] = useState('')
  const [assetUsageContext, setAssetUsageContext] = useState<string>('')
  const [assetEmotionIntensity, setAssetEmotionIntensity] = useState<string>('')
  const [generating, setGenerating] = useState(false)
  
  // Filtres
  const [filterType, setFilterType] = useState<Asset['type'] | 'all'>('all')
  const [filterUsage, setFilterUsage] = useState<string>('all')
  
  // Charger les assets
  useEffect(() => {
    if (projectId && projectId !== '') {
      loadAllProjectData(projectId).catch(console.error)
      loadAssets()
    }
  }, [projectId])
  
  const loadAssets = async () => {
    if (!projectId || projectId === '') return
    
    try {
      let query = supabase
        .from('assets')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false })
      
      if (filterType !== 'all') {
        query = query.eq('type', filterType)
      }
      
      if (filterUsage !== 'all') {
        query = query.eq('usage_context', filterUsage)
      }
      
      const { data, error } = await query
      
      if (error) throw error
      setAssets(data || [])
    } catch (error) {
      console.error('Error loading assets:', error)
    } finally {
      setLoading(false)
    }
  }
  
  useEffect(() => {
    loadAssets()
  }, [filterType, filterUsage, projectId])
  
  // Créer un asset
  const handleCreateAsset = async () => {
    if (!assetName.trim() || !assetType || !projectId) return
    
    setGenerating(true)
    try {
      // Appel API pour générer l'asset
      const response = await fetch('/api/generate-asset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId,
          name: assetName,
          description: assetDescription,
          type: assetType,
          usageContext: assetUsageContext || null,
          emotionIntensity: assetEmotionIntensity || null,
        }),
      })
      
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Erreur lors de la génération de l\'asset')
      }
      
      const { asset } = await response.json()
      
      // Réinitialiser le formulaire
      setCreateStep(1)
      setAssetType('')
      setAssetName('')
      setAssetDescription('')
      setAssetUsageContext('')
      setAssetEmotionIntensity('')
      setShowCreateModal(false)
      
      // Recharger les assets
      await loadAssets()
    } catch (error: any) {
      console.error('Error creating asset:', error)
      alert(error.message || 'Erreur lors de la création de l\'asset')
    } finally {
      setGenerating(false)
    }
  }
  
  // Supprimer un asset
  const handleDeleteAsset = async (assetId: string) => {
    try {
      // Vérifier si l'asset est utilisé dans des chapitres
      const { data: usage } = await supabase
        .from('asset_usage')
        .select('chapter_id')
        .eq('asset_id', assetId)
        .limit(1)
      
      if (usage && usage.length > 0) {
        const confirmDelete = confirm(
          'Cet asset est utilisé dans un ou plusieurs chapitres. Voulez-vous vraiment le supprimer ?'
        )
        if (!confirmDelete) return
      }
      
      const { error } = await supabase
        .from('assets')
        .delete()
        .eq('id', assetId)
      
      if (error) throw error
      
      setShowDeleteModal(null)
      await loadAssets()
    } catch (error) {
      console.error('Error deleting asset:', error)
      alert('Erreur lors de la suppression de l\'asset')
    }
  }
  
  // Obtenir l'icône et le label d'un type
  const getAssetTypeInfo = (type: Asset['type']) => {
    return ASSET_TYPES.find(t => t.value === type) || ASSET_TYPES[ASSET_TYPES.length - 1]
  }
  
  if (loading || projectLoading) {
    return (
      <div className="min-h-screen creative-bg flex items-center justify-center">
        <div className="text-2xl gradient-text font-bold animate-pulse">Chargement...</div>
      </div>
    )
  }
  
  if (!project || !projectId || typeof projectId !== 'string') {
    return (
      <div className="min-h-screen creative-bg flex items-center justify-center">
        <div className="text-2xl gradient-text font-bold">Projet non trouvé</div>
      </div>
    )
  }
  
  return (
    <div className="min-h-screen creative-bg">
      <ProjectSidebar
        projectId={projectId}
        activeSection="assets"
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
          projectId={projectId}
          sidebarCollapsed={sidebarCollapsed}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        />

        <div className="p-4 lg:p-8 mt-16">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-6">
              <div className="bg-darker/90 backdrop-blur-sm rounded-2xl p-6 border-2 border-white/10">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-3xl font-bold mb-2 gradient-text">🎨 Assets</h1>
                    <p className="text-white/70">
                      Ressources visuelles secondaires réutilisables dans vos chapitres
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setCreateStep(1)
                      setAssetType('')
                      setAssetName('')
                      setAssetDescription('')
                      setAssetUsageContext('')
                      setAssetEmotionIntensity('')
                      setShowCreateModal(true)
                    }}
                    className="px-6 py-3 bg-gradient-to-r from-primary to-accent text-white rounded-lg hover:shadow-lg transition font-semibold"
                  >
                    ➕ Créer un asset
                  </button>
                </div>
              </div>
            </div>

            {/* Filtres */}
            <div className="mb-6 bg-darker/90 backdrop-blur-sm rounded-2xl p-4 border-2 border-white/10">
              <div className="flex flex-wrap gap-4">
                <div className="flex-1 min-w-[200px]">
                  <label className="text-white/70 text-sm mb-2 block">Type</label>
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value as Asset['type'] | 'all')}
                    className="w-full px-4 py-2 bg-darkest border-2 border-white/20 rounded-lg text-white focus:outline-none focus:border-primary transition"
                  >
                    <option value="all">Tous les types</option>
                    {ASSET_TYPES.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.icon} {type.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex-1 min-w-[200px]">
                  <label className="text-white/70 text-sm mb-2 block">Usage</label>
                  <select
                    value={filterUsage}
                    onChange={(e) => setFilterUsage(e.target.value)}
                    className="w-full px-4 py-2 bg-darkest border-2 border-white/20 rounded-lg text-white focus:outline-none focus:border-primary transition"
                  >
                    <option value="all">Tous les usages</option>
                    {USAGE_CONTEXTS.map(usage => (
                      <option key={usage.value} value={usage.value}>
                        {usage.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Grille d'assets */}
            {assets.length === 0 ? (
              <div className="bg-darker/90 backdrop-blur-sm rounded-2xl p-12 border-2 border-white/10 text-center">
                <div className="text-5xl mb-4">🎨</div>
                <p className="text-white/60 mb-2 text-lg">Aucun asset créé</p>
                <p className="text-white/40 text-sm mb-6">
                  Créez votre premier asset pour commencer à enrichir vos chapitres
                </p>
                <button
                  onClick={() => {
                    setCreateStep(1)
                    setAssetType('')
                    setAssetName('')
                    setAssetDescription('')
                    setAssetUsageContext('')
                    setAssetEmotionIntensity('')
                    setShowCreateModal(true)
                  }}
                  className="px-6 py-3 bg-gradient-to-r from-primary to-accent text-white rounded-lg hover:shadow-lg transition font-semibold"
                >
                  ➕ Créer un asset
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {assets.map((asset) => {
                  const typeInfo = getAssetTypeInfo(asset.type)
                  return (
                    <div
                      key={asset.id}
                      className="bg-darker/90 backdrop-blur-sm rounded-2xl border-2 border-white/10 hover:border-primary/50 transition-all group overflow-hidden"
                    >
                      {/* Preview */}
                      <div className="relative aspect-square bg-darkest">
                        <img
                          src={asset.image_url}
                          alt={asset.name}
                          className="w-full h-full object-cover"
                        />
                        {asset.created_by_ai && (
                          <div className="absolute top-2 right-2 px-2 py-1 bg-primary/80 text-white text-xs rounded-lg">
                            ✨ IA
                          </div>
                        )}
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2">
                          <button
                            onClick={() => setShowPreviewModal(asset.id)}
                            className="px-3 py-1 bg-white/20 hover:bg-white/30 text-white rounded-lg text-sm transition"
                          >
                            👁️ Aperçu
                          </button>
                          <button
                            onClick={() => handleDeleteAsset(asset.id)}
                            className="px-3 py-1 bg-red/80 hover:bg-red text-white rounded-lg text-sm transition"
                          >
                            🗑️ Supprimer
                          </button>
                        </div>
                      </div>
                      
                      {/* Info */}
                      <div className="p-4">
                        <h3 className="text-white font-semibold mb-1 truncate">{asset.name}</h3>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-2xl">{typeInfo.icon}</span>
                          <span className="text-white/60 text-xs">{typeInfo.label}</span>
                        </div>
                        {asset.usage_context && (
                          <div className="text-white/50 text-xs mb-1">
                            Usage: {USAGE_CONTEXTS.find(u => u.value === asset.usage_context)?.label || asset.usage_context}
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal de création (4 étapes) */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-darker rounded-2xl border-2 border-white/20 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">
                  Créer un asset {createStep > 1 && `(${createStep}/4)`}
                </h2>
                <button
                  onClick={() => {
                    setShowCreateModal(false)
                    setCreateStep(1)
                  }}
                  className="text-white/60 hover:text-white transition"
                >
                  ✕
                </button>
              </div>

              {/* Étape 1: Type */}
              {createStep === 1 && (
                <div className="space-y-4">
                  <p className="text-white/70 mb-4">Choisissez le type d'asset</p>
                  <div className="grid grid-cols-2 gap-3">
                    {ASSET_TYPES.map((type) => (
                      <button
                        key={type.value}
                        onClick={() => {
                          setAssetType(type.value as Asset['type'])
                          setCreateStep(2)
                        }}
                        className={`p-4 rounded-xl border-2 transition text-left ${
                          assetType === type.value
                            ? 'border-primary bg-primary/20'
                            : 'border-white/20 hover:border-white/40 bg-darkest/50'
                        }`}
                      >
                        <div className="text-3xl mb-2">{type.icon}</div>
                        <div className="text-white font-semibold mb-1">{type.label}</div>
                        <div className="text-white/60 text-xs">{type.description}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Étape 2: Description */}
              {createStep === 2 && (
                <div className="space-y-4">
                  <div>
                    <label className="text-white/70 text-sm mb-2 block">Nom de l'asset *</label>
                    <input
                      type="text"
                      value={assetName}
                      onChange={(e) => setAssetName(e.target.value)}
                      placeholder="Ex: Épée de feu"
                      className="w-full px-4 py-3 bg-darkest border-2 border-white/20 rounded-lg text-white focus:outline-none focus:border-primary transition"
                    />
                  </div>
                  <div>
                    <label className="text-white/70 text-sm mb-2 block">Description</label>
                    <textarea
                      value={assetDescription}
                      onChange={(e) => setAssetDescription(e.target.value)}
                      placeholder="Décrivez l'asset : ce que c'est, à quoi ça sert..."
                      rows={4}
                      className="w-full px-4 py-3 bg-darkest border-2 border-white/20 rounded-lg text-white focus:outline-none focus:border-primary transition resize-none"
                    />
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setCreateStep(1)}
                      className="px-4 py-2 bg-dark-gray text-white rounded-lg hover:bg-dark-gray/80 transition"
                    >
                      ← Retour
                    </button>
                    <button
                      onClick={() => setCreateStep(3)}
                      disabled={!assetName.trim()}
                      className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/80 transition disabled:opacity-50 disabled:cursor-not-allowed flex-1"
                    >
                      Suivant →
                    </button>
                  </div>
                </div>
              )}

              {/* Étape 3: Contexte optionnel */}
              {createStep === 3 && (
                <div className="space-y-4">
                  <div>
                    <label className="text-white/70 text-sm mb-2 block">Usage narratif (optionnel)</label>
                    <select
                      value={assetUsageContext}
                      onChange={(e) => setAssetUsageContext(e.target.value)}
                      className="w-full px-4 py-3 bg-darkest border-2 border-white/20 rounded-lg text-white focus:outline-none focus:border-primary transition"
                    >
                      <option value="">Aucun</option>
                      {USAGE_CONTEXTS.map(usage => (
                        <option key={usage.value} value={usage.value}>
                          {usage.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-white/70 text-sm mb-2 block">Émotion / Intensité (optionnel)</label>
                    <select
                      value={assetEmotionIntensity}
                      onChange={(e) => setAssetEmotionIntensity(e.target.value)}
                      className="w-full px-4 py-3 bg-darkest border-2 border-white/20 rounded-lg text-white focus:outline-none focus:border-primary transition"
                    >
                      <option value="">Aucune</option>
                      {EMOTION_INTENSITIES.map(intensity => (
                        <option key={intensity.value} value={intensity.value}>
                          {intensity.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setCreateStep(2)}
                      className="px-4 py-2 bg-dark-gray text-white rounded-lg hover:bg-dark-gray/80 transition"
                    >
                      ← Retour
                    </button>
                    <button
                      onClick={() => setCreateStep(4)}
                      className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/80 transition flex-1"
                    >
                      Suivant →
                    </button>
                  </div>
                </div>
              )}

              {/* Étape 4: Génération */}
              {createStep === 4 && (
                <div className="space-y-4">
                  <div className="bg-darkest/50 rounded-xl p-4">
                    <h3 className="text-white font-semibold mb-2">Récapitulatif</h3>
                    <div className="space-y-2 text-sm text-white/70">
                      <div><strong className="text-white">Type:</strong> {getAssetTypeInfo(assetType as Asset['type']).label}</div>
                      <div><strong className="text-white">Nom:</strong> {assetName}</div>
                      {assetDescription && <div><strong className="text-white">Description:</strong> {assetDescription}</div>}
                      {assetUsageContext && <div><strong className="text-white">Usage:</strong> {USAGE_CONTEXTS.find(u => u.value === assetUsageContext)?.label}</div>}
                      {assetEmotionIntensity && <div><strong className="text-white">Intensité:</strong> {EMOTION_INTENSITIES.find(e => e.value === assetEmotionIntensity)?.label}</div>}
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setCreateStep(3)}
                      disabled={generating}
                      className="px-4 py-2 bg-dark-gray text-white rounded-lg hover:bg-dark-gray/80 transition disabled:opacity-50"
                    >
                      ← Retour
                    </button>
                    <button
                      onClick={handleCreateAsset}
                      disabled={generating}
                      className="px-4 py-2 bg-gradient-to-r from-primary to-accent text-white rounded-lg hover:shadow-lg transition disabled:opacity-50 flex-1 font-semibold"
                    >
                      {generating ? '⏳ Génération en cours...' : '✨ Générer l\'asset'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal d'aperçu */}
      {showPreviewModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-darker rounded-2xl border-2 border-white/20 max-w-4xl w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-white">Aperçu</h2>
                <button
                  onClick={() => setShowPreviewModal(null)}
                  className="text-white/60 hover:text-white transition"
                >
                  ✕
                </button>
              </div>
              {assets.find(a => a.id === showPreviewModal) && (
                <div>
                  <img
                    src={assets.find(a => a.id === showPreviewModal)!.image_url}
                    alt={assets.find(a => a.id === showPreviewModal)!.name}
                    className="w-full rounded-xl"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function AssetsPage() {
  return (
    <AuthGuard>
      <AssetsPageContent />
    </AuthGuard>
  )
}

