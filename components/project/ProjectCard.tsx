import { useRouter } from 'next/router'
import Link from 'next/link'
import type { Project, Character, Chapter } from '@/lib/supabase'
import CharactersIcon from '@/components/icons/CharactersIcon'
import PlacesIcon from '@/components/icons/PlacesIcon'
import ScenarioIcon from '@/components/icons/ScenarioIcon'
import AssetsIcon from '@/components/icons/AssetsIcon'

interface ProjectCardProps {
  type: 'characters' | 'places' | 'scenario' | 'editor'
  project: Project
  characters?: Character[]
  chapters?: Chapter[]
  hideCreateButton?: boolean
}

export default function ProjectCard({ type, project, characters = [], chapters = [], hideCreateButton = false }: ProjectCardProps) {
  const router = useRouter()

  if (type === 'characters') {
    return (
      <div 
        className="backdrop-blur-sm rounded-2xl p-6 border border-white/5 hover:border-white/10 transition"
        style={{
          background: 'linear-gradient(135deg, rgba(5, 5, 16, 0.85) 0%, rgba(10, 10, 15, 0.8) 50%, rgba(5, 5, 16, 0.85) 100%)',
        }}
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-2xl font-bold text-white flex items-center gap-2">
            <CharactersIcon size={28} className="flex-shrink-0" />
            Personnages
          </h3>
          <div className="flex gap-2">
            {!hideCreateButton && (
              <Link
                href={`/project/${project.id}/character/new`}
                className="px-4 py-2 bg-gradient-to-r from-primary/20 to-accent/20 text-white rounded-lg hover:from-primary/30 hover:to-accent/30 transition text-sm font-medium border border-primary/30"
              >
                + Créer
              </Link>
            )}
          </div>
        </div>

        {characters.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-5xl mb-3">👤</div>
            <p className="text-white/60 mb-4">Aucun personnage créé</p>
            <Link
              href={`/project/${project.id}/character/new`}
              className="inline-block px-6 py-3 bg-gradient-to-r from-primary to-accent text-white rounded-xl font-semibold hover:shadow-lg transition"
            >
              Créer un personnage IA
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-3 mb-4">
            {characters.slice(0, 4).map((character) => (
              <Link
                key={character.id}
                href={`/project/${project.id}/character/${character.id}`}
                className="group relative aspect-square rounded-xl overflow-hidden border-2 border-primary-dark/30 hover:border-accent transition"
              >
                {character.image_url ? (
                  <img
                    src={character.image_url}
                    alt={character.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-primary/30 to-accent/30 flex items-center justify-center text-3xl text-white">
                    {character.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                  <span className="text-white font-semibold text-sm">{character.name}</span>
                </div>
              </Link>
            ))}
          </div>
        )}

        <div className="text-sm text-white/50">
          {characters.length > 0 && (
            <p>Cohérence de style : {characters.length > 1 ? '✓' : 'En cours...'}</p>
          )}
        </div>
      </div>
    )
  }

  if (type === 'places') {
    return (
      <div 
        className="backdrop-blur-sm rounded-2xl p-6 border border-white/5 hover:border-white/10 transition"
        style={{
          background: 'linear-gradient(135deg, rgba(5, 5, 16, 0.85) 0%, rgba(10, 10, 15, 0.8) 50%, rgba(5, 5, 16, 0.85) 100%)',
        }}
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-2xl font-bold text-white flex items-center gap-2">
            <PlacesIcon size={28} className="flex-shrink-0" />
            Lieux & Décors
          </h3>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="aspect-square bg-darkest rounded-lg border-2 border-dashed border-primary-dark/30 flex items-center justify-center cursor-pointer hover:border-primary transition"
            >
              <span className="text-white/30 text-2xl">+</span>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (type === 'scenario') {
    return (
      <div 
        className="backdrop-blur-sm rounded-2xl p-6 border border-white/5 hover:border-white/10 transition"
        style={{
          background: 'linear-gradient(135deg, rgba(5, 5, 16, 0.85) 0%, rgba(10, 10, 15, 0.8) 50%, rgba(5, 5, 16, 0.85) 100%)',
        }}
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-2xl font-bold text-white flex items-center gap-2">
            <ScenarioIcon size={28} className="flex-shrink-0" />
            Scénario
          </h3>
        </div>

        <div className="space-y-2">
          {chapters.length > 0 ? (
            chapters.slice(0, 5).map((chapter) => (
              <div
                key={chapter.id}
                className="p-3 bg-darkest/50 rounded-lg border border-primary-dark/30 hover:bg-darkest transition cursor-pointer"
                onClick={() => router.push(`/project/${project.id}/chapter/${chapter.id}`)}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary/30 to-accent/30 flex items-center justify-center text-white font-bold text-sm">
                    {chapter.order}
                  </div>
                  <div className="flex-1">
                    <p className="text-white font-medium">{chapter.title}</p>
                    <p className="text-white/50 text-xs">Chapitre {chapter.order}</p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <div className="text-5xl mb-3">📝</div>
              <p className="text-white/60 mb-4">Aucun chapitre créé</p>
              <button className="px-6 py-3 bg-gradient-to-r from-primary to-accent text-white rounded-xl font-semibold hover:shadow-lg transition">
                Créer un chapitre
              </button>
            </div>
          )}
        </div>
      </div>
    )
  }

  if (type === 'editor') {
    const lastChapter = chapters.length > 0 ? chapters[chapters.length - 1] : null

    return (
      <div 
        className="backdrop-blur-sm rounded-2xl p-6 border border-white/5 hover:border-white/10 transition"
        style={{
          background: 'linear-gradient(135deg, rgba(5, 5, 16, 0.85) 0%, rgba(10, 10, 15, 0.8) 50%, rgba(5, 5, 16, 0.85) 100%)',
        }}
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-2xl font-bold text-white flex items-center gap-2">
            <AssetsIcon size={28} className="flex-shrink-0" />
            Éditeur de planches
          </h3>
        </div>

        {lastChapter ? (
          <div className="mb-4">
            <div className="aspect-video bg-darkest rounded-lg border-2 border-primary-dark/30 mb-3 flex items-center justify-center">
              <span className="text-white/30">Aperçu de la dernière planche</span>
            </div>
            <p className="text-white/70 text-sm mb-2">Dernière modification : {lastChapter.title}</p>
          </div>
        ) : (
          <div className="aspect-video bg-darkest rounded-lg border-2 border-dashed border-primary-dark/30 mb-4 flex items-center justify-center">
            <span className="text-white/30">Aucune planche créée</span>
          </div>
        )}

        <button
          onClick={() => {
            if (lastChapter) {
              router.push(`/project/${project.id}/chapter/${lastChapter.id}`)
            } else {
              // Créer un nouveau chapitre
              router.push(`/project/${project.id}#editor`)
            }
          }}
          className="w-full py-4 bg-gradient-to-r from-primary to-accent text-white rounded-xl font-bold text-lg hover:shadow-lg transition flex items-center justify-center gap-2"
        >
          <span>🎨</span>
          <span>Ouvrir l'éditeur</span>
        </button>

        {chapters.length > 0 && (
          <div className="mt-4">
            <p className="text-white/50 text-sm mb-2">Timeline des planches</p>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {chapters.map((chapter) => (
                <div
                  key={chapter.id}
                  onClick={() => router.push(`/project/${project.id}/chapter/${chapter.id}`)}
                  className="flex-shrink-0 w-12 h-12 rounded-lg bg-gradient-to-br from-primary/30 to-accent/30 flex items-center justify-center text-white font-bold cursor-pointer hover:scale-110 transition"
                >
                  {chapter.order}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    )
  }

  return null
}

