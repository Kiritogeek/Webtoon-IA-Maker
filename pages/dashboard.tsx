import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { supabase, getUser } from '@/lib/supabase'
import type { Project } from '@/lib/supabase'
import AuthGuard from '@/components/AuthGuard'

function DashboardContent() {
  const router = useRouter()
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [userProfile, setUserProfile] = useState<any>(null)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [isCardHovered, setIsCardHovered] = useState(false)
  const [hoveredGradient, setHoveredGradient] = useState<string | null>(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null)

  useEffect(() => {
    let mounted = true
    
    const init = async () => {
      await checkUser()
      if (mounted) {
        await loadProjects()
      }
    }
    
    init()
    
    return () => {
      mounted = false
    }
  }, [])

  const checkUser = async () => {
    try {
      const { user } = await getUser()
      setUser(user)
      if (!user) {
        router.replace('/auth/login')
        return
      }
      
      // Charger le profil utilisateur seulement si l'utilisateur existe
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle()
      
      if (profileError) {
        console.error('Error loading user profile:', profileError)
        // Si le profil n'existe pas, on continue sans profil
        setUserProfile(null)
      } else {
        setUserProfile(profile)
      }
    } catch (error) {
      console.error('Error checking user:', error)
      // En cas d'erreur, rediriger vers login
      router.replace('/auth/login')
      setUserProfile(null)
    }
  }

  const loadProjects = async () => {
    try {
      const { user } = await getUser()
      
      if (!user) {
        router.replace('/auth/login')
        return
      }

      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) {
        // Vérifier si c'est une erreur de configuration Supabase
        if (error.message?.includes('CORS') || error.message?.includes('NetworkError') || error.message?.includes('fetch') || error.message?.includes('Failed to fetch')) {
          console.error('❌ Erreur CORS - Supabase non configuré')
          console.error('📝 Veuillez créer un fichier .env.local avec:')
          console.error('   NEXT_PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co')
          console.error('   NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_cle_anon')
          // Ne pas afficher d'alerte qui pourrait bloquer la navigation
          // Juste initialiser avec un tableau vide
          setProjects([])
          setLoading(false)
          return
        }
        throw error
      }
      setProjects(data || [])
    } catch (error: any) {
      console.error('Error loading projects:', error)
      // En cas d'erreur, initialiser avec un tableau vide pour éviter les erreurs de rendu
      setProjects([])
    } finally {
      setLoading(false)
    }
  }

  const handleCreateProject = () => {
    router.push('/project/new')
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  const handleDeleteClick = (e: React.MouseEvent, project: Project) => {
    e.stopPropagation()
    setProjectToDelete(project)
    setShowDeleteModal(true)
  }

  const handleDeleteConfirm = async () => {
    if (!projectToDelete) return

    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', projectToDelete.id)

      if (error) throw error

      // Recharger les projets
      await loadProjects()
      setShowDeleteModal(false)
      setProjectToDelete(null)
    } catch (error) {
      console.error('Error deleting project:', error)
      alert('Erreur lors de la suppression du projet')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center creative-bg">
        <div className="text-2xl gradient-text font-bold animate-pulse">Chargement...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen creative-bg relative">
      {/* Overlay gradient qui apparaît au survol */}
      <div 
        className={`fixed inset-0 z-0 ${isCardHovered ? 'gradient-background-fade-in opacity-100' : 'opacity-0 pointer-events-none'}`}
        style={{
          backgroundImage: hoveredGradient || 'none',
          backgroundColor: hoveredGradient ? 'transparent' : '#1A1A1A',
          backgroundAttachment: 'fixed',
          backgroundSize: 'cover',
        }}
      />
      
      {/* Menu utilisateur */}
      <div className="fixed top-4 right-4 z-50">
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold text-base sm:text-lg hover:scale-110 transition shadow-lg"
            style={{ textAlign: 'center', lineHeight: '1' }}
          >
            <span style={{ display: 'inline-block', transform: 'translateX(-2px)' }}>
              {userProfile?.first_name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'U'}
            </span>
          </button>

          {showUserMenu && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowUserMenu(false)}
              />
              <div className="absolute right-0 mt-2 w-44 sm:w-48 bg-darker/90 backdrop-blur-sm rounded-xl border-2 border-primary-dark/50 shadow-lg z-50 overflow-hidden">
                <div className="p-2">
                  <div className="px-3 sm:px-4 py-2 text-white/80 text-xs sm:text-sm border-b border-primary-dark/30 truncate">
                    {userProfile?.first_name ? `${userProfile.first_name} ${userProfile.last_name}` : user?.email}
                  </div>
                  <button
                    onClick={() => {
                      setShowUserMenu(false)
                      // TODO: Aller vers la page de paramètres
                    }}
                    className="w-full text-left px-3 sm:px-4 py-2 text-white hover:bg-primary-dark/20 transition text-xs sm:text-sm"
                  >
                    ⚙️ Paramètres
                  </button>
                  <button
                    onClick={() => {
                      setShowUserMenu(false)
                      handleLogout()
                    }}
                    className="w-full text-left px-3 sm:px-4 py-2 text-white hover:bg-primary-dark/20 transition text-xs sm:text-sm"
                  >
                    🚪 Déconnexion
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Contenu principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12 relative z-10">
        {/* Titre centré en haut */}
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white">Mes Projets</h1>
        </div>

        {/* Grille de projets */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Cards des projets existants */}
          {projects.map((project, index) => (
            <div
              key={project.id}
              onClick={() => router.push(`/project/${project.id}`)}
              onMouseEnter={() => {
                if (project.gradient_background) {
                  setIsCardHovered(true)
                  setHoveredGradient(project.gradient_background)
                }
              }}
              onMouseLeave={() => {
                setIsCardHovered(false)
                setHoveredGradient(null)
              }}
              className="card-hover backdrop-blur-sm rounded-2xl p-4 sm:p-6 cursor-pointer border border-white/5 hover:border-white/10 group flex flex-col relative transition"
              style={{ 
                animationDelay: `${index * 0.05}s`,
                background: 'linear-gradient(135deg, rgba(5, 5, 16, 0.85) 0%, rgba(10, 10, 15, 0.8) 50%, rgba(5, 5, 16, 0.85) 100%)',
              }}
            >
              <button
                onClick={(e) => handleDeleteClick(e, project)}
                className="absolute top-2 right-3 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all z-10 delete-button"
                title="Supprimer le projet"
              >
                <span className="text-6xl font-bold">×</span>
              </button>
              <div className="flex-1 flex flex-col justify-center">
                <h2 className="text-2xl sm:text-3xl font-bold mb-2 text-white truncate">{project.name}</h2>
                <p className="text-white/60 text-xs sm:text-sm">
                  {new Date(project.created_at).toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })}
                </p>
              </div>
              <div className="flex items-center gap-2 text-accent text-xs sm:text-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity mt-2">
                <span>Ouvrir →</span>
              </div>
            </div>
          ))}

          {/* Card pour créer un projet - À la fin de la grille */}
          <div
            onClick={handleCreateProject}
            onMouseEnter={() => setIsCardHovered(true)}
            onMouseLeave={() => setIsCardHovered(false)}
            className="card-hover backdrop-blur-sm rounded-2xl p-4 sm:p-6 cursor-pointer border border-white/5 hover:border-white/10 group flex flex-col items-center justify-center transition"
            style={{
              background: 'linear-gradient(135deg, rgba(5, 5, 16, 0.85) 0%, rgba(10, 10, 15, 0.8) 50%, rgba(5, 5, 16, 0.85) 100%)',
            }}
          >
            <div className="text-5xl sm:text-6xl text-white/40 group-hover:text-accent transition-colors font-light mb-2">
              +
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-white opacity-0 group-hover:opacity-100 transition-opacity text-center">
              Créer un nouveau projet
            </h2>
          </div>
        </div>
      </div>

      {/* Modal de confirmation de suppression */}
      {showDeleteModal && projectToDelete && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => {
            setShowDeleteModal(false)
            setProjectToDelete(null)
          }}
        >
          <div 
            className="bg-darker rounded-3xl p-8 w-full max-w-md shadow-2xl border-2 border-primary-dark/50"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-3xl font-bold mb-6 text-white">Supprimer le projet</h2>
            <p className="text-white/80 mb-6">
              Êtes-vous sûr de vouloir supprimer le projet <strong className="text-white">{projectToDelete.name}</strong> ? Cette action est irréversible.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false)
                  setProjectToDelete(null)
                }}
                className="px-6 py-3 text-white bg-dark-gray rounded-xl hover:bg-dark-gray/80 transition font-semibold"
              >
                Annuler
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition font-semibold"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}

export default function Dashboard() {
  return (
    <AuthGuard>
      <DashboardContent />
    </AuthGuard>
  )
}
