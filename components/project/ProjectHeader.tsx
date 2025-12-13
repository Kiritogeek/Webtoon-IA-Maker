import { useState, useRef } from 'react'
import type { Project } from '@/lib/supabase'
import { GENRES, AMBIANCES, STYLES_GRAPHIQUES } from '@/lib/projectConfig'
import { supabase } from '@/lib/supabase'

interface ProjectHeaderProps {
  project: Project
  onUpdate: (updates: Partial<Project>) => Promise<void>
}

export default function ProjectHeader({ project, onUpdate }: ProjectHeaderProps) {
  const [isEditingName, setIsEditingName] = useState(false)
  const [isEditingDescription, setIsEditingDescription] = useState(false)
  const [name, setName] = useState(project.name)
  const [description, setDescription] = useState(project.description || '')

  const handleNameSubmit = async () => {
    if (name.trim() && name !== project.name) {
      await onUpdate({ name: name.trim() })
    }
    setIsEditingName(false)
  }

  const handleDescriptionSubmit = async () => {
    await onUpdate({ description: description.trim() || null })
    setIsEditingDescription(false)
  }

  const genre = project.genre ? GENRES.find(g => g.value === project.genre) : null
  const ambiance = project.ambiance ? AMBIANCES.find(a => a.value === project.ambiance) : null
  const style = project.style_graphique ? STYLES_GRAPHIQUES.find(s => s.value === project.style_graphique) : null

  return (
    <div className="relative mb-8">
      {/* Contenu du header */}
      <div className="space-y-4">
        {/* Nom du projet (éditable inline) */}
        <div>
          {isEditingName ? (
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onBlur={handleNameSubmit}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleNameSubmit()
                }
              }}
              className="text-4xl font-black text-white bg-transparent border-b-2 border-primary focus:outline-none focus:border-accent w-full"
              autoFocus
            />
          ) : (
            <h1
              onClick={() => setIsEditingName(true)}
              className="text-4xl font-black text-white cursor-text hover:text-accent transition"
            >
              {project.name}
            </h1>
          )}
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2">
          {genre && (
            <span
              className="px-3 py-1 rounded-full text-sm font-semibold text-white"
              style={{ backgroundColor: genre.color + '40', border: `1px solid ${genre.color}` }}
            >
              {genre.label}
            </span>
          )}
          {ambiance && (
            <span
              className="px-3 py-1 rounded-full text-sm font-semibold text-white"
              style={{ backgroundColor: ambiance.color + '40', border: `1px solid ${ambiance.color}` }}
            >
              {ambiance.label}
            </span>
          )}
          {style && (
            <span
              className="px-3 py-1 rounded-full text-sm font-semibold text-white"
              style={{ backgroundColor: style.color + '40', border: `1px solid ${style.color}` }}
            >
              {style.label}
            </span>
          )}
        </div>

        {/* Dates */}
        <div className="flex gap-4 text-sm text-white/60">
          <span>
            Créé le {new Date(project.created_at).toLocaleDateString('fr-FR', {
              day: 'numeric',
              month: 'long',
              year: 'numeric'
            })}
          </span>
          {project.updated_at !== project.created_at && (
            <span>
              Modifié le {new Date(project.updated_at).toLocaleDateString('fr-FR', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
              })}
            </span>
          )}
        </div>

        {/* Description (éditable inline) */}
        <div>
          {isEditingDescription ? (
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              onBlur={handleDescriptionSubmit}
              className="w-full px-4 py-2 bg-darkest/50 border-2 border-primary-dark/50 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-primary transition resize-none"
              placeholder="Ajoutez une description du projet..."
              rows={3}
              autoFocus
            />
          ) : (
            <div
              onClick={() => setIsEditingDescription(true)}
              className="px-4 py-2 bg-darkest/50 border-2 border-transparent rounded-xl text-white/80 cursor-text hover:border-primary-dark/50 transition min-h-[3rem]"
            >
              {description || (
                <span className="text-white/40 italic">Ajoutez une description du projet...</span>
              )}
            </div>
          )}
        </div>

        {/* Bouton Générer avec IA */}
        <div>
          <button className="px-6 py-3 bg-gradient-to-r from-primary to-accent text-white rounded-xl font-semibold hover:shadow-lg transition flex items-center gap-2">
            <span>✨</span>
            <span>Générer avec IA</span>
          </button>
        </div>
      </div>
    </div>
  )
}

