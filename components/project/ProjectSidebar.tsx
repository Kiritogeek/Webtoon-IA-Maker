import { useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import ObjectivesIcon from '@/components/icons/ObjectivesIcon'
import DashboardIcon from '@/components/icons/DashboardIcon'
import ChaptersIcon from '@/components/icons/ChaptersIcon'
import CharactersIcon from '@/components/icons/CharactersIcon'
import PlacesIcon from '@/components/icons/PlacesIcon'
import ScenarioIcon from '@/components/icons/ScenarioIcon'
import IdentityIcon from '@/components/icons/IdentityIcon'
import AssetsIcon from '@/components/icons/AssetsIcon'
import SettingsIcon from '@/components/icons/SettingsIcon'

interface MenuItem {
  id: string
  label: string
  icon: string
  path?: string
  children?: MenuItem[]
}

interface ProjectSidebarProps {
  projectId: string
  activeSection?: string
  isCollapsed?: boolean
  isOpen?: boolean
  onToggle?: () => void
  onMobileToggle?: () => void
  onClose?: () => void
}

export default function ProjectSidebar({ projectId, activeSection, isCollapsed = false, isOpen = false, onToggle, onMobileToggle, onClose }: ProjectSidebarProps) {
  const router = useRouter()
  const [expandedMenus, setExpandedMenus] = useState<Set<string>>(new Set())

  const menuItems: MenuItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: 'dashboard', path: `/project/${projectId}` },
    { id: 'objectives', label: 'Objectifs', icon: 'objectives', path: `/project/${projectId}/objectives` },
    { id: 'chapters', label: 'Chapitres', icon: 'chapters', path: `/project/${projectId}/chapters` },
    { id: 'characters', label: 'Personnages', icon: 'characters', path: `/project/${projectId}/characters` },
    { id: 'places', label: 'Lieux / Décors', icon: 'places', path: `/project/${projectId}/places` },
    { id: 'scenario', label: 'Scénario', icon: 'scenario', path: `/project/${projectId}/scenario` },
    { id: 'identity', label: 'Identité Visuelle', icon: 'identity', path: `/project/${projectId}/identite-visuelle` },
    { id: 'assets', label: 'Assets', icon: 'assets', path: `/project/${projectId}/assets` },
    { id: 'settings', label: 'Paramètres', icon: 'settings', path: `/project/${projectId}/parametres` },
  ]

  const toggleMenu = (menuId: string) => {
    const newExpanded = new Set(expandedMenus)
    if (newExpanded.has(menuId)) {
      newExpanded.delete(menuId)
    } else {
      newExpanded.add(menuId)
    }
    setExpandedMenus(newExpanded)
  }

  const sidebarWidth = isCollapsed ? 'w-20' : 'w-52' // Augmenté pour afficher les noms complets (208px)
  // Sur mobile, la sidebar est cachée par défaut et s'affiche quand isOpen est true
  // Sur desktop, elle est toujours visible mais peut être rétractée
  const mobileTranslate = isOpen ? 'translate-x-0' : '-translate-x-full'
  const desktopTranslate = 'lg:translate-x-0'

  return (
    <>
      {/* Overlay pour mobile */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/60 z-30"
          onClick={onClose}
        />
      )}

      <div 
        className={`fixed left-0 top-0 h-screen ${sidebarWidth} backdrop-blur-sm border-r border-white/5 z-40 flex flex-col transition-all duration-300 ${mobileTranslate} ${desktopTranslate}`}
        style={{
          background: 'linear-gradient(135deg, rgba(5, 5, 16, 0.85) 0%, rgba(10, 10, 15, 0.8) 50%, rgba(5, 5, 16, 0.85) 100%)',
        }}
      >
        {/* Logo/Back */}
        <div className="h-16 flex items-center justify-center relative border-b border-white/5">
          <Link
            href="/dashboard"
            className="hidden lg:flex items-center justify-center w-8 h-8 rounded-lg transition bg-gradient-to-br from-primary to-accent active:scale-95 hover:scale-110 shadow-lg"
            title="Mes projets"
          >
            <span className="text-white font-black text-base">W</span>
          </Link>
          <button
            onClick={(e) => {
              e.stopPropagation()
              onMobileToggle?.()
            }}
            className="lg:hidden p-1 rounded-lg hover:bg-white/5 transition text-white/50 hover:text-white/70"
            title="Fermer le menu"
          >
            ✕
          </button>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 p-1.5 overflow-y-auto flex flex-col custom-scrollbar">
          <div className="flex flex-col gap-2 flex-1 min-h-0 justify-between">
            {menuItems.map((item, index) => {
              const hasChildren = item.children && item.children.length > 0
              const isExpanded = expandedMenus.has(item.id)
              const isActive = activeSection === item.id || (!activeSection && item.id === 'dashboard')
              const isChildActive = item.children?.some(child => activeSection === child.id)
              
              // Si pas d'enfants, afficher directement le lien
              if (!hasChildren) {
                return (
                  <div key={item.id} className="w-full">
                    {index > 0 && (
                      <div className="h-px bg-white/5 mx-2 mb-0.5"></div>
                    )}
                    <Link
                      href={item.path || '#'}
                      className={`flex flex-col items-center justify-center gap-1 px-2 py-2 rounded-lg transition-all group ${
                        isActive
                          ? 'bg-white/5 text-white/90 border-l-2 border-primary/60'
                          : 'text-white/50 hover:text-white/70 hover:bg-white/5'
                      }`}
                      title={item.label}
                    >
                      {item.icon === 'objectives' ? (
                      <ObjectivesIcon size={20} className="flex-shrink-0" />
                    ) : item.icon === 'dashboard' ? (
                      <DashboardIcon size={20} className="flex-shrink-0" />
                    ) : item.icon === 'chapters' ? (
                      <ChaptersIcon size={20} className="flex-shrink-0" />
                    ) : item.icon === 'characters' ? (
                      <CharactersIcon size={20} className="flex-shrink-0" />
                    ) : item.icon === 'places' ? (
                      <PlacesIcon size={20} className="flex-shrink-0" />
                    ) : item.icon === 'scenario' ? (
                      <ScenarioIcon size={20} className="flex-shrink-0" />
                    ) : item.icon === 'identity' ? (
                      <IdentityIcon size={20} className="flex-shrink-0" />
                    ) : item.icon === 'assets' ? (
                      <AssetsIcon size={20} className="flex-shrink-0" />
                    ) : item.icon === 'settings' ? (
                      <SettingsIcon size={20} className="flex-shrink-0" />
                    ) : (
                      <span className="text-xl flex-shrink-0">{item.icon}</span>
                    )}
                      <span 
                        className={`font-medium text-center leading-tight w-full px-1 whitespace-nowrap overflow-hidden text-ellipsis ${
                          isCollapsed ? 'text-[10px]' : 'text-[11px]'
                        }`}
                      >
                        {item.label}
                      </span>
                    </Link>
                  </div>
                )
              }

            // Gestion des menus avec enfants (pour compatibilité future)
            if (hasChildren && !isCollapsed) {
              return (
                <div key={item.id} className="flex flex-col flex-1 min-h-0">
                  <div className="flex items-center flex-shrink-0">
                    {item.path ? (
                      <Link
                        href={item.path}
                        className={`flex-1 flex items-center gap-2.5 px-2.5 py-2 rounded-lg transition-all group ${
                          isActive && !isChildActive
                            ? 'bg-white/5 text-white/90 border-l-2 border-primary/60'
                            : 'text-white/50 hover:text-white/70 hover:bg-white/5'
                        }`}
                      >
                        {item.icon === 'objectives' ? (
                          <ObjectivesIcon size={16} className="flex-shrink-0" />
                        ) : item.icon === 'dashboard' ? (
                          <DashboardIcon size={16} className="flex-shrink-0" />
                        ) : item.icon === 'chapters' ? (
                          <ChaptersIcon size={16} className="flex-shrink-0" />
                        ) : item.icon === 'characters' ? (
                          <CharactersIcon size={16} className="flex-shrink-0" />
                        ) : item.icon === 'places' ? (
                          <PlacesIcon size={16} className="flex-shrink-0" />
                        ) : item.icon === 'scenario' ? (
                          <ScenarioIcon size={16} className="flex-shrink-0" />
                        ) : item.icon === 'identity' ? (
                          <IdentityIcon size={16} className="flex-shrink-0" />
                        ) : item.icon === 'assets' ? (
                          <AssetsIcon size={16} className="flex-shrink-0" />
                        ) : item.icon === 'settings' ? (
                          <SettingsIcon size={16} className="flex-shrink-0" />
                        ) : (
                          <span className="text-base flex-shrink-0">{item.icon}</span>
                        )}
                        <span className="font-medium text-xs whitespace-nowrap overflow-hidden text-ellipsis">{item.label}</span>
                      </Link>
                    ) : (
                      <div className={`flex-1 flex items-center gap-2.5 px-2.5 py-2 rounded-lg ${
                        isActive && !isChildActive
                          ? 'bg-white/5 text-white/90 border-l-2 border-primary/60'
                          : 'text-white/50'
                      }`}>
                        {item.icon === 'objectives' ? (
                          <ObjectivesIcon size={16} className="flex-shrink-0" />
                        ) : item.icon === 'dashboard' ? (
                          <DashboardIcon size={16} className="flex-shrink-0" />
                        ) : item.icon === 'chapters' ? (
                          <ChaptersIcon size={16} className="flex-shrink-0" />
                        ) : item.icon === 'characters' ? (
                          <CharactersIcon size={16} className="flex-shrink-0" />
                        ) : item.icon === 'places' ? (
                          <PlacesIcon size={16} className="flex-shrink-0" />
                        ) : item.icon === 'scenario' ? (
                          <ScenarioIcon size={16} className="flex-shrink-0" />
                        ) : item.icon === 'identity' ? (
                          <IdentityIcon size={16} className="flex-shrink-0" />
                        ) : item.icon === 'assets' ? (
                          <AssetsIcon size={16} className="flex-shrink-0" />
                        ) : item.icon === 'settings' ? (
                          <SettingsIcon size={16} className="flex-shrink-0" />
                        ) : (
                          <span className="text-base flex-shrink-0">{item.icon}</span>
                        )}
                        <span className="font-medium text-xs whitespace-nowrap overflow-hidden text-ellipsis">{item.label}</span>
                      </div>
                    )}
                    <button
                      onClick={() => toggleMenu(item.id)}
                      className="p-2 rounded-lg hover:bg-white/5 transition"
                    >
                      <svg
                        className={`w-3 h-3 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                  </div>
                  {isExpanded && (
                    <div className="ml-4 mt-0.5 flex-1 flex flex-col justify-between min-h-0">
                      <div className="space-y-4 flex-1 flex flex-col justify-around">
                        {item.children!.map((child) => {
                          const isChildActive = activeSection === child.id
                          return (
                            <div key={child.id}>
                              <Link
                                href={child.path || '#'}
                                className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg transition-all text-sm ${
                                  isChildActive
                                    ? 'bg-white/5 text-white/90 border-l-2 border-primary/40'
                                    : 'text-white/40 hover:text-white/60 hover:bg-white/5'
                                }`}
                              >
                                {child.icon === 'objectives' ? (
                                  <ObjectivesIcon size={14} className="flex-shrink-0" />
                                ) : child.icon === 'dashboard' ? (
                                  <DashboardIcon size={14} className="flex-shrink-0" />
                                ) : child.icon === 'chapters' ? (
                                  <ChaptersIcon size={14} className="flex-shrink-0" />
                                ) : child.icon === 'characters' ? (
                                  <CharactersIcon size={14} className="flex-shrink-0" />
                                ) : child.icon === 'places' ? (
                                  <PlacesIcon size={14} className="flex-shrink-0" />
                                ) : child.icon === 'scenario' ? (
                                  <ScenarioIcon size={14} className="flex-shrink-0" />
                                ) : child.icon === 'identity' ? (
                                  <IdentityIcon size={14} className="flex-shrink-0" />
                                ) : child.icon === 'assets' ? (
                                  <AssetsIcon size={14} className="flex-shrink-0" />
                                ) : child.icon === 'settings' ? (
                                  <SettingsIcon size={14} className="flex-shrink-0" />
                                ) : (
                                  <span className="text-xs flex-shrink-0">{child.icon}</span>
                                )}
                                <span className="font-medium text-xs whitespace-nowrap overflow-hidden text-ellipsis">{child.label}</span>
                              </Link>
                              <div className="ml-7 mt-0.5 mb-1">
                                <span className="text-[10px] text-white/30 font-medium">{item.label}</span>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )
            }
            })}
          </div>
        </nav>

        {/* Footer */}
        <div className="p-1.5 border-t border-white/5 flex-shrink-0">
          {!isCollapsed && (
            <div className="text-[10px] text-white/30 text-center">
              Webtoon AI Maker
            </div>
          )}
        </div>
      </div>
    </>
  )
}

