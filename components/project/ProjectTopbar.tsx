import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { supabase, getUser } from '@/lib/supabase'

interface ProjectTopbarProps {
  projectId: string
  onSearch?: (query: string) => void
  sidebarCollapsed?: boolean
  onToggleSidebar?: () => void
  onToggleCollapse?: () => void
}

export default function ProjectTopbar({ projectId, onSearch, sidebarCollapsed = false, onToggleSidebar, onToggleCollapse }: ProjectTopbarProps) {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [userProfile, setUserProfile] = useState<any>(null)

  // Charger l'utilisateur au montage
  useEffect(() => {
    const loadUser = async () => {
      const { user } = await getUser()
      setUser(user)
      if (user) {
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle()
        setUserProfile(profile)
      }
    }
    loadUser()
  }, [])

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value
    setSearchQuery(query)
    onSearch?.(query)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  const leftOffset = sidebarCollapsed ? 'lg:left-20' : 'lg:left-32'

  return (
    <div 
      className={`fixed top-0 left-0 ${leftOffset} right-0 h-16 backdrop-blur-sm lg:border-l border-white/5 z-30 flex items-center justify-between px-4 lg:px-6 transition-all duration-300`}
      style={{
        background: 'linear-gradient(135deg, rgba(5, 5, 16, 0.85) 0%, rgba(10, 10, 15, 0.8) 50%, rgba(5, 5, 16, 0.85) 100%)',
      }}
    >
      {/* Bouton toggle sidebar (mobile) */}
      <button
        onClick={onToggleSidebar}
        className="lg:hidden p-2 rounded-lg hover:bg-white/5 transition text-white/50 hover:text-white/70 mr-2"
        title="Menu"
      >
        ☰
      </button>

      {/* Recherche */}
      <div className="flex-1 max-w-md">
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearch}
            placeholder="Rechercher dans le projet..."
            className="w-full px-4 py-2 pl-10 bg-darkest border-2 border-primary-dark/50 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-primary transition"
          />
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40">🔍</span>
        </div>
      </div>

      {/* Profil utilisateur */}
      <div className="relative ml-auto">
        <button
          onClick={() => setShowUserMenu(!showUserMenu)}
          className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold text-sm hover:scale-110 transition shadow-lg"
        >
          {userProfile?.first_name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'U'}
        </button>

        {showUserMenu && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setShowUserMenu(false)}
            />
            <div className="absolute right-0 mt-2 w-48 bg-darkest/95 backdrop-blur-sm rounded-xl border border-white/10 shadow-lg z-50 overflow-hidden">
              <div className="p-2">
                <div className="px-3 py-2 text-white/70 text-sm border-b border-white/5 truncate">
                  {userProfile?.first_name ? `${userProfile.first_name} ${userProfile.last_name}` : user?.email}
                </div>
                <button
                  onClick={() => {
                    setShowUserMenu(false)
                    router.push('/dashboard')
                  }}
                  className="w-full text-left px-3 py-2 text-white/80 hover:bg-white/5 transition text-sm"
                >
                  📚 Mes projets
                </button>
                <button
                  onClick={() => {
                    setShowUserMenu(false)
                    handleLogout()
                  }}
                  className="w-full text-left px-3 py-2 text-white/80 hover:bg-white/5 transition text-sm"
                >
                  🚪 Déconnexion
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

