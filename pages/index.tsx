import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { supabase, getUser } from '@/lib/supabase'
import type { Project } from '@/lib/supabase'

export default function Home() {
  const router = useRouter()
  const [projects, setProjects] = useState<Project[]>([])
  const [user, setUser] = useState<any>(null)
  const [userProfile, setUserProfile] = useState<any>(null)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newProjectName, setNewProjectName] = useState('')
  const [newProjectDescription, setNewProjectDescription] = useState('')

  useEffect(() => {
    checkUser()
    loadProjects()
  }, [])

  const checkUser = async () => {
    const { user } = await getUser()
    setUser(user)
    
    if (user) {
      // Charger le profil utilisateur
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
    }
  }

  const loadProjects = async () => {
    try {
      const { user } = await getUser()
      
      if (!user) {
        const { data, error } = await supabase
          .from('projects')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(3)

        if (error) throw error
        setProjects(data || [])
      } else {
        const { data, error } = await supabase
          .from('projects')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(3)

        if (error) throw error
        setProjects(data || [])
      }
    } catch (error) {
      console.error('Error loading projects:', error)
    }
  }

  const handleCreateClick = () => {
    if (!user) {
      router.push('/auth/login')
    } else {
      setShowCreateModal(true)
    }
  }

  const createProject = async () => {
    if (!newProjectName.trim() || !user) return

    try {
      const { data, error } = await supabase
        .from('projects')
        .insert([
          {
            name: newProjectName,
            description: newProjectDescription || null,
            user_id: user.id,
          },
        ])
        .select()
        .single()

      if (error) throw error

      router.push(`/project/${data.id}`)
    } catch (error) {
      console.error('Error creating project:', error)
      alert('Erreur lors de la création du projet')
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setUserProfile(null)
    router.push('/')
  }

  return (
    <div className="min-h-screen creative-bg">
      {/* Menu utilisateur */}
      {user && (
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
                        router.push('/dashboard')
                      }}
                      className="w-full text-left px-3 sm:px-4 py-2 text-white hover:bg-primary-dark/20 transition text-xs sm:text-sm"
                    >
                      📚 Mes projets
                    </button>
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
      )}

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 sm:pt-16 pb-8 sm:pb-12">
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black mb-3 sm:mb-4 text-white animate-float">
              Webtoon AI Maker
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl text-white mb-2 sm:mb-3 font-medium px-2">
              Créez vos webtoons chapitre par chapitre
            </p>
            <p className="text-sm sm:text-base text-white/90 mb-6 sm:mb-8 max-w-2xl mx-auto leading-relaxed px-4">
              Donnez vie à vos histoires avec l'intelligence artificielle. 
              Créez des personnages, organisez vos chapitres et générez des scènes époustouflantes.
            </p>
            
            <div className="flex justify-center items-center">
              {user ? (
                <button
                  onClick={() => router.push('/dashboard')}
                  className="btn-creative bg-darker/90 backdrop-blur-sm text-white px-6 sm:px-8 py-2 sm:py-3 rounded-full text-base sm:text-lg font-semibold shadow-lg hover:shadow-2xl transition"
                >
                  📚 Mes projets
                </button>
              ) : (
                <button
                  onClick={() => router.push('/auth/login')}
                  className="btn-creative bg-darker/90 backdrop-blur-sm text-white px-6 sm:px-8 py-2 sm:py-3 rounded-full text-base sm:text-lg font-semibold shadow-lg hover:shadow-2xl transition"
                >
                  🔐 Se connecter
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Éléments décoratifs */}
        <div className="absolute top-20 left-10 w-32 h-32 bg-primary/30 rounded-full blur-2xl animate-float"></div>
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-accent/30 rounded-full blur-2xl animate-float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 right-20 w-24 h-24 bg-primary-dark/30 rounded-full blur-xl animate-float" style={{ animationDelay: '4s' }}></div>
        <div className="absolute top-1/3 left-1/4 w-20 h-20 bg-yellow/20 rounded-full blur-xl animate-float" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-1/3 left-1/3 w-28 h-28 bg-secondary/20 rounded-full blur-xl animate-float" style={{ animationDelay: '3s' }}></div>
      </section>

      {/* Features Section */}
      <section className="py-8 sm:py-12 relative">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-6 sm:mb-10 text-white px-4">
            Vos outils créatifs
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            <div className="card-hover bg-darker/90 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border-2 border-primary-dark/50 hover:border-accent/50 hover:shadow-[0_0_30px_rgba(255,255,255,0.3)]">
              <div className="text-3xl sm:text-4xl mb-2 sm:mb-3 text-center">👤</div>
              <h3 className="text-lg sm:text-xl font-bold mb-2 text-white text-center">Personnages</h3>
              <p className="text-white/90 text-xs sm:text-sm leading-relaxed text-center">
                Créez et personnalisez vos personnages avec des descriptions détaillées et des images de référence.
              </p>
            </div>

            <div className="card-hover bg-darker/90 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border-2 border-primary-dark/50 hover:border-accent/50 hover:shadow-[0_0_30px_rgba(255,255,255,0.3)]">
              <div className="text-3xl sm:text-4xl mb-2 sm:mb-3 text-center">🎬</div>
              <h3 className="text-lg sm:text-xl font-bold mb-2 text-white text-center">Canvas Interactif</h3>
              <p className="text-white/90 text-xs sm:text-sm leading-relaxed text-center">
                Glissez-déposez vos personnages, ajustez leurs positions et créez des compositions uniques.
              </p>
            </div>

            <div className="card-hover bg-darker/90 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border-2 border-primary-dark/50 hover:border-primary-dark/50 hover:shadow-[0_0_30px_rgba(255,255,255,0.3)] sm:col-span-2 lg:col-span-1">
              <div className="text-3xl sm:text-4xl mb-2 sm:mb-3 text-center">✨</div>
              <h3 className="text-lg sm:text-xl font-bold mb-2 text-white text-center">Génération IA</h3>
              <p className="text-white/90 text-xs sm:text-sm leading-relaxed text-center">
                Générez des images de scènes époustouflantes grâce à l'intelligence artificielle.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Modal de création */}
      {showCreateModal && user && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setShowCreateModal(false)}
        >
          <div 
            className="bg-darker rounded-3xl p-8 w-full max-w-md shadow-2xl border-2 border-primary-dark/50"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-3xl font-bold mb-6 gradient-text">Nouveau Projet</h2>
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-white mb-2">
                  Nom du projet
                </label>
                <input
                  type="text"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  className="w-full px-4 py-3 bg-darkest border-2 border-primary-dark rounded-xl focus:outline-none focus:border-accent transition text-white"
                  placeholder="Mon Webtoon"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-white mb-2">
                  Description (optionnel)
                </label>
                <textarea
                  value={newProjectDescription}
                  onChange={(e) => setNewProjectDescription(e.target.value)}
                  className="w-full px-4 py-3 bg-darkest border-2 border-primary-dark rounded-xl focus:outline-none focus:border-accent transition resize-none text-white"
                  rows={3}
                  placeholder="Décrivez votre projet..."
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-8">
              <button
                onClick={() => {
                  setShowCreateModal(false)
                  setNewProjectName('')
                  setNewProjectDescription('')
                }}
                className="px-6 py-3 text-accent bg-orange-dark rounded-xl hover:bg-orange-dark/80 transition font-semibold"
              >
                Annuler
              </button>
              <button
                onClick={createProject}
                className="px-6 py-3 bg-gradient-to-r from-primary to-accent text-white rounded-xl hover:shadow-lg transition font-semibold"
              >
                Créer ✨
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
