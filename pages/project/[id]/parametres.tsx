import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { supabase, getUser } from '@/lib/supabase'
import type { Project } from '@/lib/supabase'
import AuthGuard from '@/components/AuthGuard'
import ProjectSidebar from '@/components/project/ProjectSidebar'
import ProjectTopbar from '@/components/project/ProjectTopbar'
import { useProjectStore } from '@/lib/stores/projectStore'
import SettingsIcon from '@/components/icons/SettingsIcon'

function ParametresPageContent() {
  const router = useRouter()
  const { id } = router.query
  const { project, loading, loadAllProjectData, updateProject } = useProjectStore()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  
  // États pour les formulaires
  const [showBackgroundModal, setShowBackgroundModal] = useState(false)
  const [backgroundType, setBackgroundType] = useState<'black' | 'gray' | 'white' | 'custom'>('black')
  const [customBackgroundImage, setCustomBackgroundImage] = useState<File | null>(null)
  const [customBackgroundPreview, setCustomBackgroundPreview] = useState<string | null>(null)
  const [projectLanguage, setProjectLanguage] = useState('fr')
  const [exportFormat, setExportFormat] = useState('png')
  const [aiQuality, setAiQuality] = useState('standard')
  const [aiModel, setAiModel] = useState('default')
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    if (id && typeof id === 'string') {
      loadAllProjectData(id)
    }
  }, [id, loadAllProjectData])

  useEffect(() => {
    if (project) {
      // Déterminer le type de background
      const bg = project.gradient_background || ''
      if (bg.startsWith('url(')) {
        setBackgroundType('custom')
        setCustomBackgroundPreview(bg.replace('url(', '').replace(')', ''))
      } else if (bg.includes('#000000') || bg.includes('black')) {
        setBackgroundType('black')
      } else if (bg.includes('#2a2a2a') || bg.includes('gray')) {
        setBackgroundType('gray')
      } else if (bg.includes('#ffffff') || bg.includes('white')) {
        setBackgroundType('white')
      } else {
        setBackgroundType('black') // Par défaut
      }
    }
  }, [project])

  const handleBackgroundImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      alert('L\'image ne doit pas dépasser 5MB')
      return
    }

    setCustomBackgroundImage(file)
    const reader = new FileReader()
    reader.onloadend = () => {
      setCustomBackgroundPreview(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleBackgroundChange = async (type: 'black' | 'gray' | 'white' | 'custom') => {
    if (type === 'custom' && !customBackgroundImage && !customBackgroundPreview) {
      // Si on choisit personnalisé sans image, ouvrir le sélecteur de fichier
      document.getElementById('background-image-upload')?.click()
      setBackgroundType('custom')
      return
    }

    setSaving(true)
    let gradient = ''
    
    if (type === 'black') {
      gradient = 'linear-gradient(to right, #000000, #1a1a1a, #000000)'
    } else if (type === 'gray') {
      gradient = 'linear-gradient(to right, #2a2a2a, #3a3a3a, #2a2a2a)'
    } else if (type === 'white') {
      gradient = 'linear-gradient(to right, #ffffff, #f5f5f5, #ffffff)'
    } else if (type === 'custom' && customBackgroundImage) {
      // Uploader l'image
      setUploading(true)
      try {
        const { user } = await getUser()
        if (!user) {
          router.push('/auth/login')
          return
        }

        const fileExt = customBackgroundImage.name.split('.').pop()
        const fileName = `${user.id}/backgrounds/${Date.now()}.${fileExt}`

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('images')
          .upload(fileName, customBackgroundImage)

        if (uploadError) throw uploadError

        const { data: { publicUrl } } = supabase.storage
          .from('images')
          .getPublicUrl(fileName)

        gradient = `url(${publicUrl})`
      } catch (error) {
        console.error('Error uploading background image:', error)
        alert('Erreur lors de l\'upload de l\'image')
        setSaving(false)
        setUploading(false)
        return
      } finally {
        setUploading(false)
      }
    } else if (type === 'custom' && customBackgroundPreview) {
      gradient = `url(${customBackgroundPreview})`
    } else {
      setSaving(false)
      return
    }

    if (project && id && typeof id === 'string') {
      try {
        // Mettre à jour dans Supabase
        const { data, error } = await supabase
          .from('projects')
          .update({ gradient_background: gradient })
          .eq('id', id)
          .select()
          .single()
        
        if (error) throw error
        
        // Mettre à jour le store
        updateProject({ gradient_background: gradient })
        setBackgroundType(type)
        setShowBackgroundModal(false)
      } catch (error) {
        console.error('Error updating background:', error)
        alert('Erreur lors de la mise à jour du background')
      } finally {
        setSaving(false)
      }
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
    <div
      className="min-h-screen"
      style={{
        background: project.gradient_background || 'linear-gradient(to right, #050510, #0A0A0F, #050510)',
        backgroundAttachment: 'fixed',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      <ProjectSidebar
        projectId={id}
        activeSection="settings"
        isCollapsed={sidebarCollapsed}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        onMobileToggle={() => setSidebarOpen(!sidebarOpen)}
        onClose={() => setSidebarOpen(false)}
      />

      <ProjectTopbar
        projectId={id}
        sidebarCollapsed={sidebarCollapsed}
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      <div className={`mt-16 p-4 lg:p-8 transition-all duration-300 ${
        sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-52'
      }`}>
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-2">
              <SettingsIcon size={32} />
              <h1 className="text-3xl font-bold text-white">Paramètres</h1>
            </div>
            <p className="text-white/70">Gérez les paramètres de votre projet</p>
          </div>

          {/* 1. Background du projet */}
          <div className="bg-darker/90 backdrop-blur-sm rounded-2xl p-6 border-2 border-white/10">
            <h2 className="text-xl font-bold text-white mb-4">🎨 Background du projet</h2>
            <div
              onClick={() => setShowBackgroundModal(true)}
              className="cursor-pointer group"
            >
              <div 
                className="h-32 rounded-xl overflow-hidden border-2 border-white/20 group-hover:border-white/40 transition"
                style={{
                  background: project.gradient_background || 'linear-gradient(to right, #000000, #1a1a1a, #000000)',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
              >
                {project.gradient_background?.startsWith('url(') && (
                  <img
                    src={project.gradient_background.replace('url(', '').replace(')', '')}
                    alt="Background"
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
              <p className="text-white/70 text-sm mt-2 text-center group-hover:text-white transition">
                Cliquez pour modifier
              </p>
            </div>
          </div>

          {/* Modal de modification du background */}
          {showBackgroundModal && (
            <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
              <div className="bg-darker rounded-2xl p-6 border-2 border-white/20 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-white">Modifier le background</h2>
                  <button
                    onClick={() => setShowBackgroundModal(false)}
                    className="text-white/70 hover:text-white text-2xl"
                  >
                    ×
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <button
                    onClick={() => handleBackgroundChange('black')}
                    disabled={saving || uploading}
                    className={`p-4 rounded-xl border-2 transition ${
                      backgroundType === 'black'
                        ? 'border-yellow bg-yellow/20'
                        : 'border-white/50 hover:border-white/80 bg-darkest/50'
                    } ${saving || uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <div className="h-16 rounded-lg mb-2 bg-gradient-to-r from-black via-gray-900 to-black"></div>
                    <p className="text-white font-semibold text-sm">Fond noir</p>
                  </button>

                  <button
                    onClick={() => handleBackgroundChange('gray')}
                    disabled={saving || uploading}
                    className={`p-4 rounded-xl border-2 transition ${
                      backgroundType === 'gray'
                        ? 'border-yellow bg-yellow/20'
                        : 'border-white/50 hover:border-white/80 bg-darkest/50'
                    } ${saving || uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <div className="h-16 rounded-lg mb-2 bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800"></div>
                    <p className="text-white font-semibold text-sm">Fond gris</p>
                  </button>

                  <button
                    onClick={() => handleBackgroundChange('white')}
                    disabled={saving || uploading}
                    className={`p-4 rounded-xl border-2 transition ${
                      backgroundType === 'white'
                        ? 'border-yellow bg-yellow/20'
                        : 'border-white/50 hover:border-white/80 bg-darkest/50'
                    } ${saving || uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <div className="h-16 rounded-lg mb-2 bg-gradient-to-r from-white via-gray-100 to-white"></div>
                    <p className="text-white font-semibold text-sm">Fond blanc</p>
                  </button>

                  <button
                    onClick={() => handleBackgroundChange('custom')}
                    disabled={saving || uploading}
                    className={`p-4 rounded-xl border-2 transition ${
                      backgroundType === 'custom'
                        ? 'border-yellow bg-yellow/20'
                        : 'border-white/50 hover:border-white/80 bg-darkest/50'
                    } ${saving || uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <div className="h-16 rounded-lg mb-2 bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600"></div>
                    <p className="text-white font-semibold text-sm">Personnalisé</p>
                  </button>
                </div>

                {backgroundType === 'custom' && (
                  <div className="mt-4">
                    <label className="block text-sm font-bold text-white mb-2">
                      Image de background personnalisée
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleBackgroundImageChange}
                      className="hidden"
                      id="background-image-upload"
                    />
                    <label
                      htmlFor="background-image-upload"
                      className="block w-full px-4 py-3 bg-darkest border-2 border-white/50 rounded-xl hover:border-white transition cursor-pointer text-center text-white mb-3"
                    >
                      {customBackgroundImage ? '📷 Changer l\'image' : '📷 Uploader une image'}
                    </label>
                    {customBackgroundPreview && (
                      <div className="mt-4">
                        <img
                          src={customBackgroundPreview}
                          alt="Preview"
                          className="w-full h-48 object-cover rounded-lg mb-3"
                        />
                        <button
                          onClick={() => handleBackgroundChange('custom')}
                          disabled={saving || uploading || !customBackgroundImage}
                          className="w-full px-4 py-3 bg-primary text-white rounded-xl hover:bg-primary/80 transition disabled:opacity-50"
                        >
                          {uploading ? 'Upload en cours...' : saving ? 'Sauvegarde...' : 'Appliquer'}
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 2. Informations du projet */}
          <div className="bg-darker/90 backdrop-blur-sm rounded-2xl p-6 border-2 border-white/10">
            <h2 className="text-xl font-bold text-white mb-4">ℹ️ Informations du projet</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-white/70 mb-2">Nom du projet</label>
                <p className="text-white">{project.name}</p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-white/70 mb-2">Description</label>
                <p className="text-white/80">{project.description || 'Aucune description'}</p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-white/70 mb-2">Date de création</label>
                <p className="text-white/80">{new Date(project.created_at).toLocaleDateString('fr-FR')}</p>
              </div>
            </div>
          </div>

          {/* 3. Langue du projet */}
          <div className="bg-darker/90 backdrop-blur-sm rounded-2xl p-6 border-2 border-white/10">
            <h2 className="text-xl font-bold text-white mb-4">🌍 Langue du projet</h2>
            <select
              value={projectLanguage}
              onChange={(e) => setProjectLanguage(e.target.value)}
              className="w-full px-4 py-3 bg-darkest border-2 border-white/50 rounded-xl focus:outline-none focus:border-white transition text-white"
            >
              <option value="fr">Français</option>
              <option value="en">English</option>
              <option value="es">Español</option>
              <option value="de">Deutsch</option>
              <option value="ja">日本語</option>
              <option value="ko">한국어</option>
            </select>
            <p className="text-white/50 text-xs mt-2">La langue utilisée pour les générations IA et l'interface</p>
          </div>

          {/* 4. Format d'export */}
          <div className="bg-darker/90 backdrop-blur-sm rounded-2xl p-6 border-2 border-white/10">
            <h2 className="text-xl font-bold text-white mb-4">📤 Format d'export</h2>
            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="exportFormat"
                  value="png"
                  checked={exportFormat === 'png'}
                  onChange={(e) => setExportFormat(e.target.value)}
                  className="w-5 h-5 text-primary"
                />
                <span className="text-white">PNG (Haute qualité, transparent)</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="exportFormat"
                  value="jpg"
                  checked={exportFormat === 'jpg'}
                  onChange={(e) => setExportFormat(e.target.value)}
                  className="w-5 h-5 text-primary"
                />
                <span className="text-white">JPG (Compressé, plus léger)</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="exportFormat"
                  value="pdf"
                  checked={exportFormat === 'pdf'}
                  onChange={(e) => setExportFormat(e.target.value)}
                  className="w-5 h-5 text-primary"
                />
                <span className="text-white">PDF (Document complet)</span>
              </label>
            </div>
          </div>

          {/* 5. Gestion IA */}
          <div className="bg-darker/90 backdrop-blur-sm rounded-2xl p-6 border-2 border-white/10">
            <h2 className="text-xl font-bold text-white mb-4">🤖 Gestion IA</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-white/70 mb-2">Qualité</label>
                <select
                  value={aiQuality}
                  onChange={(e) => setAiQuality(e.target.value)}
                  className="w-full px-4 py-3 bg-darkest border-2 border-white/50 rounded-xl focus:outline-none focus:border-white transition text-white"
                >
                  <option value="low">Basse (Rapide, économique)</option>
                  <option value="standard">Standard (Équilibré)</option>
                  <option value="high">Haute (Lent, coûteux)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-white/70 mb-2">Modèle</label>
                <select
                  value={aiModel}
                  onChange={(e) => setAiModel(e.target.value)}
                  className="w-full px-4 py-3 bg-darkest border-2 border-white/50 rounded-xl focus:outline-none focus:border-white transition text-white"
                >
                  <option value="default">Modèle par défaut</option>
                  <option value="advanced">Modèle avancé</option>
                  <option value="premium">Modèle premium</option>
                </select>
              </div>
              <div className="p-4 bg-darkest/50 rounded-xl">
                <p className="text-white/70 text-sm">
                  💰 <strong>Coût estimé:</strong> {aiQuality === 'low' ? '0.01€' : aiQuality === 'standard' ? '0.05€' : '0.15€'} par image
                </p>
              </div>
            </div>
          </div>

          {/* 6. Sauvegarde / Duplication */}
          <div className="bg-darker/90 backdrop-blur-sm rounded-2xl p-6 border-2 border-white/10">
            <h2 className="text-xl font-bold text-white mb-4">💾 Sauvegarde / Duplication</h2>
            <div className="space-y-3">
              <button
                onClick={async () => {
                  if (confirm('Voulez-vous dupliquer ce projet ?')) {
                    // TODO: Implémenter la duplication
                    alert('Fonctionnalité à implémenter')
                  }
                }}
                className="w-full px-4 py-3 bg-primary/20 text-primary rounded-xl hover:bg-primary/30 transition font-semibold"
              >
                📋 Dupliquer le projet
              </button>
              <button
                onClick={async () => {
                  if (confirm('Voulez-vous exporter une sauvegarde de ce projet ?')) {
                    // TODO: Implémenter l'export
                    alert('Fonctionnalité à implémenter')
                  }
                }}
                className="w-full px-4 py-3 bg-accent/20 text-accent rounded-xl hover:bg-accent/30 transition font-semibold"
              >
                📥 Exporter la sauvegarde
              </button>
            </div>
          </div>

          {/* 7. Suppression / Archivage */}
          <div className="bg-darker/90 backdrop-blur-sm rounded-2xl p-6 border-2 border-red-500/20">
            <h2 className="text-xl font-bold text-red-400 mb-4">🗑️ Suppression / Archivage</h2>
            <div className="space-y-3">
              <button
                onClick={async () => {
                  if (confirm('Voulez-vous archiver ce projet ? Il sera masqué mais conservé.')) {
                    // TODO: Implémenter l'archivage
                    alert('Fonctionnalité à implémenter')
                  }
                }}
                className="w-full px-4 py-3 bg-yellow/20 text-yellow rounded-xl hover:bg-yellow/30 transition font-semibold"
              >
                📦 Archiver le projet
              </button>
              <button
                onClick={async () => {
                  if (confirm('⚠️ ATTENTION: Cette action est irréversible. Voulez-vous vraiment supprimer ce projet ?')) {
                    if (confirm('Êtes-vous ABSOLUMENT sûr ? Toutes les données seront perdues.')) {
                      try {
                        const { error } = await supabase
                          .from('projects')
                          .delete()
                          .eq('id', id)
                        
                        if (error) throw error
                        router.push('/')
                      } catch (error) {
                        console.error('Error deleting project:', error)
                        alert('Erreur lors de la suppression')
                      }
                    }
                  }
                }}
                className="w-full px-4 py-3 bg-red-500/20 text-red-400 rounded-xl hover:bg-red-500/30 transition font-semibold"
              >
                🗑️ Supprimer définitivement
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ParametresPage() {
  return (
    <AuthGuard>
      <ParametresPageContent />
    </AuthGuard>
  )
}
