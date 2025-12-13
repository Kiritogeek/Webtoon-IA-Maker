import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '@/lib/supabase'
import type { Project, Character, Chapter } from '@/lib/supabase'
import AuthGuard from '@/components/AuthGuard'
import ProjectSidebar from '@/components/project/ProjectSidebar'
import ProjectTopbar from '@/components/project/ProjectTopbar'
import ProjectHeader from '@/components/project/ProjectHeader'
import ProjectDashboard from '@/components/project/ProjectDashboard'
import ProjectCard from '@/components/project/ProjectCard'
import { useProjectStore } from '@/lib/stores/projectStore'

function ProjectPageContent() {
  const router = useRouter()
  const { id } = router.query
  // Sur mobile, la sidebar est cachée par défaut. Sur desktop, elle est toujours rétractée par défaut
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false) // Pour mobile
  const {
    project,
    characters,
    chapters,
    loading,
    updateProject,
    loadAllProjectData,
  } = useProjectStore()

  useEffect(() => {
    if (id && typeof id === 'string') {
      // Charger TOUT en une fois - même si ça prend 10 secondes !
      loadAllProjectData(id)
    }
  }, [id, loadAllProjectData])

  const handleProjectUpdate = async (updates: Partial<Project>) => {
    if (!id || typeof id !== 'string' || !project) return

    try {
      const { data, error } = await supabase
        .from('projects')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      setProject(data)
    } catch (error) {
      console.error('Error updating project:', error)
      alert('Erreur lors de la mise à jour du projet')
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
      }}
    >
      {/* Sidebar */}
      <ProjectSidebar 
        projectId={id} 
        isCollapsed={sidebarCollapsed}
        isOpen={sidebarOpen}
        onToggle={() => {
          // Sur desktop (lg+), toggle le collapse. Sur mobile, toggle l'ouverture
          setSidebarCollapsed(!sidebarCollapsed)
        }}
        onMobileToggle={() => {
          setSidebarOpen(!sidebarOpen)
        }}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Topbar */}
      <ProjectTopbar 
        projectId={id}
        sidebarCollapsed={sidebarCollapsed}
        onToggleSidebar={() => {
          setSidebarOpen(!sidebarOpen)
        }}
        onToggleCollapse={() => {
          setSidebarCollapsed(!sidebarCollapsed)
        }}
      />

      {/* Contenu principal */}
      <div className={`mt-16 p-4 lg:p-8 transition-all duration-300 ${
        sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-52'
      }`}>
        <div className="max-w-7xl mx-auto">
          {/* Header du projet */}
          <ProjectHeader project={project} onUpdate={handleProjectUpdate} />

          {/* Dashboard du projet */}
          <ProjectDashboard
            project={project}
            characters={characters}
            chapters={chapters}
          />

          {/* Modules du projet (cartes principales) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
            <ProjectCard
              type="characters"
              project={project}
              characters={characters}
            />
            <ProjectCard
              type="places"
              project={project}
            />
            <ProjectCard
              type="scenario"
              project={project}
              chapters={chapters}
            />
            <ProjectCard
              type="editor"
              project={project}
              chapters={chapters}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ProjectPage() {
  return (
    <AuthGuard>
      <ProjectPageContent />
    </AuthGuard>
  )
}
