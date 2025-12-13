import { useRouter } from 'next/router'
import type { Project, Character, Chapter } from '@/lib/supabase'
import ProjectObjectives from './ProjectObjectives'
import ProjectCard from './ProjectCard'
import ObjectivesIcon from '@/components/icons/ObjectivesIcon'
import ChaptersIcon from '@/components/icons/ChaptersIcon'
import IdentityIcon from '@/components/icons/IdentityIcon'
import ScenarioIcon from '@/components/icons/ScenarioIcon'

interface ProjectDashboardProps {
  project: Project
  characters: Character[]
  chapters: Chapter[]
}

export default function ProjectDashboard({ project, characters, chapters }: ProjectDashboardProps) {
  const router = useRouter()

  // Calculer les statistiques enrichies
  const charactersUsed = characters.filter(c => (c as any).used_in_chapters?.length > 0).length
  const charactersUnused = characters.length - charactersUsed
  const chaptersPublishable = chapters.filter(c => (c as any).status === 'ready' || (c as any).status === 'published').length
  const progress = chapters.length > 0 ? Math.min((chapters.length / 10) * 100, 100) : 0

  // Gradient de couverture basé sur les couleurs du projet
  const coverGradient = project.gradient_background || 'linear-gradient(135deg, rgba(79, 70, 229, 0.8) 0%, rgba(236, 72, 153, 0.8) 100%)'

  return (
    <div className="space-y-6 w-full">
      {/* 🖼️ 1. Bloc — Couverture du Webtoon (CRITIQUE) - Plein largeur */}
      <div 
        className="backdrop-blur-sm rounded-2xl border border-white/5 overflow-hidden relative w-full"
        style={{
          background: 'linear-gradient(135deg, rgba(5, 5, 16, 0.85) 0%, rgba(10, 10, 15, 0.8) 50%, rgba(5, 5, 16, 0.85) 100%)',
        }}
      >
        {/* Couverture plein largeur avec gradient */}
        <div className="relative w-full h-64 md:h-80 lg:h-96">
          <div 
            className="absolute inset-0"
            style={{
              background: coverGradient,
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/80" />
          </div>
          
          {/* Nom du projet intégré visuellement */}
          <div className="absolute inset-0 flex items-center justify-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white drop-shadow-2xl text-center px-4">
              {project.name}
            </h1>
          </div>

          {/* Boutons d'action */}
          <div className="absolute bottom-4 right-4 flex gap-2">
            <button
              onClick={() => router.push(`/project/${project.id}?action=generate-cover`)}
              className="px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white hover:bg-white/20 transition text-sm font-medium"
            >
              Modifier la couverture
            </button>
            <button
              onClick={() => router.push(`/project/${project.id}?action=generate-cover`)}
              className="px-4 py-2 bg-gradient-to-r from-primary to-accent rounded-lg text-white hover:opacity-90 transition text-sm font-medium shadow-lg"
            >
              Générer avec l'IA
            </button>
          </div>
        </div>
      </div>

      {/* 2. Bloc — Objectifs - Pleine largeur */}
      <ProjectObjectives
        project={project}
        characters={characters}
        chapters={chapters}
      />

      {/* 📖 3. Bloc — Chapitres (Vue Webtoon) - Pleine largeur */}
      <div 
        className="backdrop-blur-sm rounded-2xl p-6 border border-white/5 w-full"
        style={{
          background: 'linear-gradient(135deg, rgba(5, 5, 16, 0.85) 0%, rgba(10, 10, 15, 0.8) 50%, rgba(5, 5, 16, 0.85) 100%)',
        }}
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <ChaptersIcon size={24} className="flex-shrink-0" />
            Chapitres
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {chapters.length > 0 ? (
            chapters
              .sort((a, b) => a.order - b.order)
              .map((chapter) => {
                const status = (chapter as any).status || 'draft'
                const statusLabels: Record<string, string> = {
                  draft: 'Brouillon',
                  ready: 'Prêt',
                  published: 'Publié'
                }
                const statusColors: Record<string, string> = {
                  draft: 'bg-white/10 text-white/70',
                  ready: 'bg-primary/20 text-primary',
                  published: 'bg-accent/20 text-accent'
                }

                return (
                  <div
                    key={chapter.id}
                    onClick={() => router.push(`/project/${project.id}/chapter/${chapter.id}`)}
                    className="flex flex-col rounded-lg hover:bg-white/5 cursor-pointer transition group border border-white/5 p-3"
                  >
                    {/* Miniature = cover + 1er panel */}
                    <div className="relative w-full aspect-[3/4] rounded-lg overflow-hidden flex-shrink-0 bg-gradient-to-br from-primary/30 to-accent/30 mb-3">
                      {chapter.cover_image_url ? (
                        <div 
                          className="absolute inset-0 bg-cover bg-center"
                          style={{ backgroundImage: `url(${chapter.cover_image_url})` }}
                        />
                      ) : project?.gradient_background ? (
                        <div 
                          className="absolute inset-0"
                          style={{ background: project.gradient_background }}
                        />
                      ) : null}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      <div className="absolute bottom-2 left-2 right-2 text-white text-sm font-bold text-center">
                        Chapitre {chapter.order}
                      </div>
                    </div>

                    {/* Infos du chapitre */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-white font-medium truncate flex-1">{chapter.title}</p>
                        <span className={`px-2 py-0.5 rounded text-xs ${statusColors[status]}`}>
                          {statusLabels[status]}
                        </span>
                      </div>
                      
                      {/* Actions rapides */}
                      <div className="flex gap-2 mt-2 opacity-0 group-hover:opacity-100 transition">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            router.push(`/project/${project.id}/chapter/${chapter.id}`)
                          }}
                          className="text-xs text-primary hover:text-accent"
                        >
                          Ouvrir
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            // TODO: Dupliquer
                          }}
                          className="text-xs text-white/50 hover:text-white/70"
                        >
                          Dupliquer
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            // TODO: Générer avec IA
                          }}
                          className="text-xs text-white/50 hover:text-white/70"
                        >
                          IA
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })
          ) : (
            <div className="col-span-full text-center py-8">
              <p className="text-white/50 text-sm mb-3">Aucun chapitre créé</p>
              <button
                onClick={() => router.push(`/project/${project.id}/chapter/new`)}
                className="px-4 py-2 bg-primary/20 text-primary rounded-lg text-sm hover:bg-primary/30 transition"
              >
                Créer le premier chapitre
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 👤 4. Bloc — Personnages - Pleine largeur */}
      <ProjectCard
        type="characters"
        project={project}
        characters={characters}
        hideCreateButton={true}
      />

      {/* 🌍 5. Bloc — Lieux & Décors - Pleine largeur */}
      <ProjectCard
        type="places"
        project={project}
      />

      {/* 📝 6. Bloc — Scénario - Pleine largeur */}
      <ProjectCard
        type="scenario"
        project={project}
        chapters={chapters}
      />

      {/* 🎨 7. Bloc — Identité Visuelle & Moodboard - Pleine largeur */}
      <div 
        className="backdrop-blur-sm rounded-2xl p-6 border border-white/5 w-full"
        style={{
          background: 'linear-gradient(135deg, rgba(5, 5, 16, 0.85) 0%, rgba(10, 10, 15, 0.8) 50%, rgba(5, 5, 16, 0.85) 100%)',
        }}
      >
        <div className="flex items-center mb-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <IdentityIcon size={24} className="flex-shrink-0" />
            Identité Visuelle & Moodboard
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Tags d'ambiance */}
          <div>
            <p className="text-white/70 text-sm mb-2">Ambiance</p>
            <div className="flex flex-wrap gap-2">
              {project.ambiance ? (
                <span className="px-3 py-1 bg-primary/20 text-primary rounded-lg text-sm">
                  {project.ambiance}
                </span>
              ) : (
                <span className="text-white/50 text-sm">Aucune ambiance définie</span>
              )}
              {project.genre && (
                <span className="px-3 py-1 bg-accent/20 text-accent rounded-lg text-sm">
                  {project.genre}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Template/Identité visuelle (référence pour l'IA) */}
        {(project.identity_visual_reference_url || project.style_reference_image_url) && (
          <div className="mt-6">
            <p className="text-white/70 text-sm mb-3">Template de référence (cohérence graphique IA)</p>
            <div className="relative aspect-[2/3] max-w-xs rounded-lg overflow-hidden border-2 border-primary/30">
              <img
                src={project.identity_visual_reference_url || project.style_reference_image_url || ''}
                alt="Template de référence"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-2 left-2 right-2">
                <div className="bg-primary/80 text-white text-xs font-semibold px-2 py-1 rounded text-center">
                  ✓ Template utilisé par l'IA pour la cohérence graphique
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Références graphiques additionnelles */}
        <div className="mt-6">
          <p className="text-white/70 text-sm mb-3">Références graphiques additionnelles</p>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="aspect-square bg-darkest rounded-lg border-2 border-dashed border-white/10 flex items-center justify-center cursor-pointer hover:border-primary/50 transition"
              >
                <span className="text-white/30 text-xl">+</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 🧰 8. Bloc — Assets - Pleine largeur */}
      <ProjectCard
        type="editor"
        project={project}
        chapters={chapters}
      />

      {/* 🧠 9. Bloc — Intelligence Narrative (IA) - Pleine largeur */}
      <div 
        className="backdrop-blur-sm rounded-2xl p-6 border border-white/5 w-full"
        style={{
          background: 'linear-gradient(135deg, rgba(5, 5, 16, 0.85) 0%, rgba(10, 10, 15, 0.8) 50%, rgba(5, 5, 16, 0.85) 100%)',
        }}
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <ObjectivesIcon size={24} className="flex-shrink-0" />
            Intelligence Narrative
          </h3>
          <button className="text-sm text-primary hover:text-accent transition">
            Générer d'autres idées
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="p-4 bg-darkest/50 rounded-lg border border-primary-dark/30">
            <p className="text-white/80 text-sm mb-1">
              💡 <strong>Découpage de chapitres</strong>
            </p>
            <p className="text-white/60 text-xs">
              Suggestion : Diviser le scénario en 3-4 chapitres pour un meilleur rythme narratif
            </p>
          </div>
          <div className="p-4 bg-darkest/50 rounded-lg border border-primary-dark/30">
            <p className="text-white/80 text-sm mb-1">
              📈 <strong>Rythme narratif</strong>
            </p>
            <p className="text-white/60 text-xs">
              Le chapitre 1 pourrait bénéficier d'un cliffhanger plus fort à la fin
            </p>
          </div>
          <div className="p-4 bg-darkest/50 rounded-lg border border-primary-dark/30">
            <p className="text-white/80 text-sm mb-1">
              🎨 <strong>Variations visuelles</strong>
            </p>
            <p className="text-white/60 text-xs">
              Essayez des plans serrés pour les scènes émotionnelles, plans larges pour l'action
            </p>
          </div>
        </div>
      </div>

      {/* 📝 10. Bloc — Notes & Direction créative - Pleine largeur */}
      <div 
        className="backdrop-blur-sm rounded-2xl p-6 border border-white/5 w-full"
        style={{
          background: 'linear-gradient(135deg, rgba(5, 5, 16, 0.85) 0%, rgba(10, 10, 15, 0.8) 50%, rgba(5, 5, 16, 0.85) 100%)',
        }}
      >
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <ScenarioIcon size={24} className="flex-shrink-0" />
          Notes & Direction créative
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-white/70 text-sm mb-2 block">Intention artistique</label>
            <textarea
              placeholder="Décrivez l'intention artistique du Webtoon..."
              className="w-full p-3 bg-darkest/50 rounded-lg border border-white/10 text-white text-sm placeholder-white/30 focus:outline-none focus:border-primary/50 resize-none"
              rows={3}
            />
          </div>
          <div>
            <label className="text-white/70 text-sm mb-2 block">Message</label>
            <textarea
              placeholder="Quel message souhaitez-vous transmettre ?"
              className="w-full p-3 bg-darkest/50 rounded-lg border border-white/10 text-white text-sm placeholder-white/30 focus:outline-none focus:border-primary/50 resize-none"
              rows={3}
            />
          </div>
          <div>
            <label className="text-white/70 text-sm mb-2 block">Public cible</label>
            <input
              type="text"
              placeholder="Ex: Adolescents, jeunes adultes..."
              className="w-full p-3 bg-darkest/50 rounded-lg border border-white/10 text-white text-sm placeholder-white/30 focus:outline-none focus:border-primary/50"
            />
          </div>
          <div>
            <label className="text-white/70 text-sm mb-2 block">Évolution de l'histoire</label>
            <textarea
              placeholder="Notes sur l'évolution prévue de l'histoire..."
              className="w-full p-3 bg-darkest/50 rounded-lg border border-white/10 text-white text-sm placeholder-white/30 focus:outline-none focus:border-primary/50 resize-none"
              rows={3}
            />
          </div>
        </div>
        <button className="w-full mt-4 px-4 py-2 bg-primary/20 text-primary rounded-lg text-sm hover:bg-primary/30 transition">
          Sauvegarder les notes
        </button>
      </div>
    </div>
  )
}

