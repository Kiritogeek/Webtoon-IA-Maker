import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '@/lib/supabase'
import type { Project, Character, Chapter } from '@/lib/supabase'
import AuthGuard from '@/components/AuthGuard'
import ProjectSidebar from '@/components/project/ProjectSidebar'
import ProjectTopbar from '@/components/project/ProjectTopbar'
import ProjectObjectives from '@/components/project/ProjectObjectives'
import { useProjectStore } from '@/lib/stores/projectStore'
import ObjectivesIcon from '@/components/icons/ObjectivesIcon'
import { getProjectBackground } from '@/lib/backgroundPresets'

function ObjectivesPageContent() {
  const router = useRouter()
  const { id } = router.query
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const {
    project,
    characters,
    chapters,
    loading,
    loadAllProjectData,
  } = useProjectStore()

  useEffect(() => {
    if (id && typeof id === 'string') {
      // Charger TOUT en une fois si pas déjà chargé
      loadAllProjectData(id)
    }
  }, [id, loadAllProjectData])

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
        background: getProjectBackground(project),
        backgroundAttachment: 'fixed',
        backgroundSize: 'cover',
      }}
    >
      {/* Sidebar */}
      <ProjectSidebar 
        projectId={id} 
        activeSection="objectives"
        isCollapsed={sidebarCollapsed}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        onMobileToggle={() => setSidebarOpen(!sidebarOpen)}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Topbar */}
      <ProjectTopbar 
        projectId={id}
        sidebarCollapsed={sidebarCollapsed}
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      {/* Contenu principal */}
      <div className={`mt-16 p-4 lg:p-8 transition-all duration-300 ${
        sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-52'
      }`}>
        <div className="max-w-7xl mx-auto">
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-2">
              <ObjectivesIcon size={32} />
              <h1 className="text-3xl font-bold text-white">Objectifs du projet</h1>
            </div>
            <p className="text-white/70">Définissez les objectifs de votre Webtoon pour guider la création</p>
          </div>

          {/* Composant Objectifs en mode édition par défaut */}
          <ProjectObjectives
            project={project}
            characters={characters}
            chapters={chapters}
            defaultEditing={true}
            hideEmptyCoherence={false}
          />
        </div>
      </div>
    </div>
  )
}

export default function ObjectivesPage() {
  return (
    <AuthGuard>
      <ObjectivesPageContent />
    </AuthGuard>
  )
}
