import { useState } from 'react'
import type { Project, Character, Chapter } from '@/lib/supabase'
import { supabase } from '@/lib/supabase'
import { useProjectStore } from '@/lib/stores/projectStore'
import ObjectivesIcon from '@/components/icons/ObjectivesIcon'


interface ObjectivesData {
  // Objectifs globaux
  totalChapters?: number
  totalReadingTime?: string
  complexity?: 'simple' | 'moyen' | 'dense'
  targetAudience?: 'grand_public' | 'ados' | 'mature'
  
  // Objectifs de contenu
  maxCharacters?: number
  maxPlaces?: number
  maxAssets?: number
  
  // Objectifs de cohérence
  coherenceRules?: string[]
  
  // Objectifs de rythme
  publicationRhythm?: 'hebdomadaire' | 'mensuel'
  averageChapterSize?: string
  cliffhangerRequired?: boolean
}

interface ProjectObjectivesProps {
  project: Project
  characters: Character[]
  chapters: Chapter[]
  defaultEditing?: boolean // Permet de forcer le mode édition
  hideEmptyCoherence?: boolean // Cache la section Cohérence si vide (pour le dashboard)
}

export default function ProjectObjectives({ project, characters, chapters, defaultEditing = false, hideEmptyCoherence = true }: ProjectObjectivesProps) {
  const { updateProject } = useProjectStore()
  const [isEditing, setIsEditing] = useState(defaultEditing)
  const [saving, setSaving] = useState(false)

  // Charger les objectifs depuis le projet (sans valeurs par défaut pour détecter les valeurs non définies)
  const objectives: ObjectivesData = {
    totalChapters: (project as any).objectives_total_chapters ?? undefined,
    totalReadingTime: (project as any).objectives_total_reading_time ?? undefined,
    complexity: (project as any).objectives_complexity ?? undefined,
    targetAudience: (project as any).objectives_target_audience ?? undefined,
    maxCharacters: (project as any).objectives_max_characters ?? undefined,
    maxPlaces: (project as any).objectives_max_places ?? undefined,
    maxAssets: (project as any).objectives_max_assets ?? undefined,
    coherenceRules: (project as any).objectives_coherence_rules ?? [],
    publicationRhythm: (project as any).objectives_publication_rhythm ?? undefined,
    averageChapterSize: (project as any).objectives_average_chapter_size ?? undefined,
    cliffhangerRequired: (project as any).objectives_cliffhanger_required ?? undefined,
  }

  // Valeurs par défaut pour le formulaire (uniquement en mode édition)
  const defaultFormData: ObjectivesData = {
    totalChapters: objectives.totalChapters ?? 5,
    totalReadingTime: objectives.totalReadingTime ?? '25-30',
    complexity: objectives.complexity ?? 'moyen',
    targetAudience: objectives.targetAudience ?? 'ados',
    maxCharacters: objectives.maxCharacters ?? 5,
    maxPlaces: objectives.maxPlaces ?? 4,
    maxAssets: objectives.maxAssets ?? 10,
    coherenceRules: objectives.coherenceRules ?? [],
    publicationRhythm: objectives.publicationRhythm ?? 'hebdomadaire',
    averageChapterSize: objectives.averageChapterSize ?? '5-7',
    cliffhangerRequired: objectives.cliffhangerRequired ?? true,
  }

  const [formData, setFormData] = useState<ObjectivesData>(defaultFormData)
  const [initialFormData, setInitialFormData] = useState<ObjectivesData>(defaultFormData)

  // Fonction pour réinitialiser le formulaire avec les valeurs par défaut
  const resetFormData = () => {
    const resetData: ObjectivesData = {
      totalChapters: objectives.totalChapters ?? 5,
      totalReadingTime: objectives.totalReadingTime ?? '25-30',
      complexity: objectives.complexity ?? 'moyen',
      targetAudience: objectives.targetAudience ?? 'ados',
      maxCharacters: objectives.maxCharacters ?? 5,
      maxPlaces: objectives.maxPlaces ?? 4,
      maxAssets: objectives.maxAssets ?? 10,
      coherenceRules: objectives.coherenceRules ?? [],
      publicationRhythm: objectives.publicationRhythm ?? 'hebdomadaire',
      averageChapterSize: objectives.averageChapterSize ?? '5-7',
      cliffhangerRequired: objectives.cliffhangerRequired ?? true,
    }
    setFormData(resetData)
    setInitialFormData(resetData)
  }

  // Fonctions pour vérifier si un objectif est défini
  const isDefined = (value: any): boolean => {
    if (value === null || value === undefined) return false
    if (typeof value === 'string' && value.trim() === '') return false
    if (typeof value === 'number' && (isNaN(value) || value <= 0)) return false
    if (Array.isArray(value) && value.length === 0) return false
    return true
  }

  const hasTotalChapters = isDefined(objectives.totalChapters)
  const hasTotalReadingTime = isDefined(objectives.totalReadingTime)
  const hasComplexity = isDefined(objectives.complexity)
  const hasTargetAudience = isDefined(objectives.targetAudience)
  const hasMaxCharacters = isDefined(objectives.maxCharacters)
  const hasMaxPlaces = isDefined(objectives.maxPlaces)
  const hasMaxAssets = isDefined(objectives.maxAssets)
  const hasCoherenceRules = objectives.coherenceRules && objectives.coherenceRules.length > 0
  const hasPublicationRhythm = isDefined(objectives.publicationRhythm)
  const hasAverageChapterSize = isDefined(objectives.averageChapterSize)
  const hasCliffhangerRequired = objectives.cliffhangerRequired !== undefined

  // Vérifier si au moins un objectif global est défini
  const hasGlobalObjectives = hasTotalChapters || hasTotalReadingTime || hasComplexity || hasTargetAudience
  // Vérifier si au moins un objectif de contenu est défini
  const hasContentObjectives = hasMaxCharacters || hasMaxPlaces || hasMaxAssets
  // Vérifier si au moins un objectif de rythme est défini
  const hasRhythmObjectives = hasPublicationRhythm || hasAverageChapterSize || hasCliffhangerRequired

  // Vérifier si aucun objectif n'est défini
  const hasAnyObjective = hasGlobalObjectives || hasContentObjectives || hasCoherenceRules || hasRhythmObjectives

  // Calculer les statistiques
  const charactersUsed = characters.filter(c => (c as any).used_in_chapters?.length > 0).length
  const placesCreated = 0 // TODO: récupérer depuis la base
  const assetsCreated = 0 // TODO: récupérer depuis la base

  // Fonction pour détecter les changements dans le formulaire
  const hasChanges = (): boolean => {
    // Comparer formData avec initialFormData (valeurs au moment de l'entrée en mode édition)
    const compareValue = (formVal: any, initialVal: any): boolean => {
      if (Array.isArray(formVal) && Array.isArray(initialVal)) {
        if (formVal.length !== initialVal.length) return true
        return formVal.some((val, idx) => val !== initialVal[idx])
      }
      return formVal !== initialVal
    }

    return (
      compareValue(formData.totalChapters, initialFormData.totalChapters) ||
      compareValue(formData.totalReadingTime, initialFormData.totalReadingTime) ||
      compareValue(formData.complexity, initialFormData.complexity) ||
      compareValue(formData.targetAudience, initialFormData.targetAudience) ||
      compareValue(formData.maxCharacters, initialFormData.maxCharacters) ||
      compareValue(formData.maxPlaces, initialFormData.maxPlaces) ||
      compareValue(formData.maxAssets, initialFormData.maxAssets) ||
      compareValue(formData.coherenceRules, initialFormData.coherenceRules) ||
      compareValue(formData.publicationRhythm, initialFormData.publicationRhythm) ||
      compareValue(formData.averageChapterSize, initialFormData.averageChapterSize) ||
      compareValue(formData.cliffhangerRequired, initialFormData.cliffhangerRequired)
    )
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const updates: any = {
        objectives_total_chapters: formData.totalChapters,
        objectives_total_reading_time: formData.totalReadingTime,
        objectives_complexity: formData.complexity,
        objectives_target_audience: formData.targetAudience,
        objectives_max_characters: formData.maxCharacters,
        objectives_max_places: formData.maxPlaces,
        objectives_max_assets: formData.maxAssets,
        objectives_coherence_rules: formData.coherenceRules,
        objectives_publication_rhythm: formData.publicationRhythm,
        objectives_average_chapter_size: formData.averageChapterSize,
        objectives_cliffhanger_required: formData.cliffhangerRequired,
      }

      const { error } = await supabase
        .from('projects')
        .update(updates)
        .eq('id', project.id)

      if (error) throw error

      updateProject(updates)
      // Mettre à jour initialFormData après sauvegarde pour réinitialiser la détection de changements
      setInitialFormData(formData)
      setIsEditing(false)
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des objectifs:', error)
    } finally {
      setSaving(false)
    }
  }

  const addCoherenceRule = () => {
    setFormData({
      ...formData,
      coherenceRules: [...(formData.coherenceRules || []), '']
    })
  }

  const updateCoherenceRule = (index: number, value: string) => {
    const newRules = [...(formData.coherenceRules || [])]
    newRules[index] = value
    setFormData({ ...formData, coherenceRules: newRules })
  }

  const removeCoherenceRule = (index: number) => {
    const newRules = (formData.coherenceRules || []).filter((_, i) => i !== index)
    setFormData({ ...formData, coherenceRules: newRules })
  }

  return (
    <div 
      id="objectives"
      className="backdrop-blur-sm rounded-2xl p-6 border border-white/5"
      style={{
        background: 'linear-gradient(135deg, rgba(5, 5, 16, 0.85) 0%, rgba(10, 10, 15, 0.8) 50%, rgba(5, 5, 16, 0.85) 100%)',
      }}
    >
      <div className="flex justify-between items-center mb-6 pb-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <ObjectivesIcon size={28} />
          <h3 className="text-2xl font-bold text-white">Objectifs</h3>
        </div>
        {/* Afficher les boutons seulement si on n'est pas dans le dashboard (hideEmptyCoherence = false) */}
        {!hideEmptyCoherence && (
          <>
            {!isEditing ? (
              <button
                onClick={() => {
                  resetFormData()
                  setIsEditing(true)
                }}
                className="px-4 py-2 bg-white/5 border border-white/10 text-primary rounded-lg hover:bg-white/10 hover:border-primary/30 transition text-sm font-medium"
              >
                Modifier
              </button>
            ) : (
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    resetFormData()
                    setIsEditing(false)
                  }}
                  className="px-4 py-2 bg-white/5 border border-white/10 text-white/70 rounded-lg hover:bg-white/10 hover:text-white transition text-sm font-medium"
                >
                  Annuler
                </button>
                {hasChanges() && (
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="px-4 py-2 bg-gradient-to-r from-primary to-accent text-white rounded-lg hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium shadow-lg"
                  >
                    {saving ? 'Mise à jour...' : 'Mettre à jour'}
                  </button>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* Afficher "Définir un objectif" si aucun objectif n'est défini dans le dashboard */}
      {hideEmptyCoherence && !hasAnyObjective && !isEditing ? (
        <div className="text-center py-12">
          <p className="text-white/50 text-lg mb-4">Aucun objectif défini</p>
          <button
            onClick={() => {
              resetFormData()
              setIsEditing(true)
            }}
            className="px-6 py-3 bg-primary/20 text-primary rounded-lg hover:bg-primary/30 transition text-sm font-medium"
          >
            Définir un objectif
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 1️⃣ Objectifs globaux du Webtoon */}
          {(!hideEmptyCoherence || hasGlobalObjectives || isEditing) && (
            <div>
              <h4 className="text-white font-bold mb-4 text-base pb-2 border-b border-primary/30">Objectifs globaux</h4>
              <div className="space-y-3">
                {(!hideEmptyCoherence || hasTotalChapters || isEditing) && (
                  <div>
                    <label className="text-primary text-sm font-semibold mb-2 block uppercase tracking-wide">Nombre total de chapitres</label>
                    {isEditing ? (
                      <input
                        type="number"
                        value={formData.totalChapters || ''}
                        onChange={(e) => setFormData({ ...formData, totalChapters: parseInt(e.target.value) || 0 })}
                        className="w-full p-2 bg-darkest/50 rounded-lg border border-white/10 text-white text-sm focus:outline-none focus:border-primary/50"
                      />
                    ) : (
                      <p className="text-white text-base font-medium">{objectives.totalChapters} chapitres</p>
                    )}
                  </div>
                )}

                {(!hideEmptyCoherence || hasTotalReadingTime || isEditing) && (
                  <div>
                    <label className="text-primary text-sm font-semibold mb-2 block uppercase tracking-wide">Durée totale de lecture cible (minutes)</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={formData.totalReadingTime || ''}
                        onChange={(e) => setFormData({ ...formData, totalReadingTime: e.target.value })}
                        placeholder="25-30"
                        className="w-full p-2 bg-darkest/50 rounded-lg border border-white/10 text-white text-sm focus:outline-none focus:border-primary/50"
                      />
                    ) : (
                      <p className="text-white text-base font-medium">{objectives.totalReadingTime} minutes</p>
                    )}
                  </div>
                )}

                {(!hideEmptyCoherence || hasComplexity || isEditing) && (
                  <div>
                    <label className="text-primary text-sm font-semibold mb-2 block uppercase tracking-wide">Niveau de complexité</label>
                    {isEditing ? (
                      <select
                        value={formData.complexity || 'moyen'}
                        onChange={(e) => setFormData({ ...formData, complexity: e.target.value as any })}
                        className="w-full p-2 bg-darkest/50 rounded-lg border border-white/10 text-white text-sm focus:outline-none focus:border-primary/50"
                      >
                        <option value="simple">Simple</option>
                        <option value="moyen">Moyen</option>
                        <option value="dense">Dense</option>
                      </select>
                    ) : (
                      <p className="text-white text-base font-medium capitalize">{objectives.complexity}</p>
                    )}
                  </div>
                )}

                {(!hideEmptyCoherence || hasTargetAudience || isEditing) && (
                  <div>
                    <label className="text-primary text-sm font-semibold mb-2 block uppercase tracking-wide">Public visé</label>
                    {isEditing ? (
                      <select
                        value={formData.targetAudience || 'ados'}
                        onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value as any })}
                        className="w-full p-2 bg-darkest/50 rounded-lg border border-white/10 text-white text-sm focus:outline-none focus:border-primary/50"
                      >
                        <option value="grand_public">Grand public</option>
                        <option value="ados">Ados</option>
                        <option value="mature">Mature</option>
                      </select>
                    ) : (
                      <p className="text-white text-base font-medium">
                        {objectives.targetAudience === 'grand_public' ? 'Grand public' : 
                         objectives.targetAudience === 'ados' ? 'Ados' : 'Mature'}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 3️⃣ Objectifs de Contenu (Ressources) */}
          {(!hideEmptyCoherence || hasContentObjectives || isEditing) && (
            <div>
              <h4 className="text-white font-bold mb-4 text-base pb-2 border-b border-primary/30">Objectifs de Contenu</h4>
              <div className="space-y-3">
                {(!hideEmptyCoherence || hasMaxCharacters || isEditing) && (
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-primary text-sm font-semibold uppercase tracking-wide">Personnages maximum</label>
                      {!isEditing && hasMaxCharacters && (
                        <span className="text-white/50 text-xs">{charactersUsed} / {objectives.maxCharacters}</span>
                      )}
                    </div>
                    {isEditing ? (
                      <input
                        type="number"
                        value={formData.maxCharacters || ''}
                        onChange={(e) => setFormData({ ...formData, maxCharacters: parseInt(e.target.value) || 0 })}
                        className="w-full p-2 bg-darkest/50 rounded-lg border border-white/10 text-white text-sm focus:outline-none focus:border-primary/50"
                      />
                    ) : (
                      <div className="w-full bg-darkest rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-primary to-accent h-2 rounded-full transition-all"
                          style={{ width: `${Math.min((charactersUsed / (objectives.maxCharacters || 1)) * 100, 100)}%` }}
                        />
                      </div>
                    )}
                  </div>
                )}

                {(!hideEmptyCoherence || hasMaxPlaces || isEditing) && (
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-primary text-sm font-semibold uppercase tracking-wide">Lieux / décors</label>
                      {!isEditing && hasMaxPlaces && (
                        <span className="text-white/50 text-xs">{placesCreated} / {objectives.maxPlaces}</span>
                      )}
                    </div>
                    {isEditing ? (
                      <input
                        type="number"
                        value={formData.maxPlaces || ''}
                        onChange={(e) => setFormData({ ...formData, maxPlaces: parseInt(e.target.value) || 0 })}
                        className="w-full p-2 bg-darkest/50 rounded-lg border border-white/10 text-white text-sm focus:outline-none focus:border-primary/50"
                      />
                    ) : (
                      <div className="w-full bg-darkest rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-primary to-accent h-2 rounded-full transition-all"
                          style={{ width: `${Math.min((placesCreated / (objectives.maxPlaces || 1)) * 100, 100)}%` }}
                        />
                      </div>
                    )}
                  </div>
                )}

                {(!hideEmptyCoherence || hasMaxAssets || isEditing) && (
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-primary text-sm font-semibold uppercase tracking-wide">Assets spéciaux</label>
                      {!isEditing && hasMaxAssets && (
                        <span className="text-white/50 text-xs">{assetsCreated} / {objectives.maxAssets}</span>
                      )}
                    </div>
                    {isEditing ? (
                      <input
                        type="number"
                        value={formData.maxAssets || ''}
                        onChange={(e) => setFormData({ ...formData, maxAssets: parseInt(e.target.value) || 0 })}
                        className="w-full p-2 bg-darkest/50 rounded-lg border border-white/10 text-white text-sm focus:outline-none focus:border-primary/50"
                      />
                    ) : (
                      <div className="w-full bg-darkest rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-primary to-accent h-2 rounded-full transition-all"
                          style={{ width: `${Math.min((assetsCreated / (objectives.maxAssets || 1)) * 100, 100)}%` }}
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

        {/* 4️⃣ Objectifs de Cohérence - Affiché seulement s'il y a des règles définies (ou toujours si hideEmptyCoherence est false, c'est-à-dire sur la page objectives) */}
        {(!hideEmptyCoherence || (objectives.coherenceRules && objectives.coherenceRules.length > 0)) && (
          <div className="lg:col-span-2">
            <h4 className="text-white font-bold mb-4 text-base pb-2 border-b border-primary/30">Objectifs de Cohérence</h4>
            {isEditing ? (
              <div className="space-y-2">
                {(formData.coherenceRules || []).map((rule, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      value={rule}
                      onChange={(e) => updateCoherenceRule(index, e.target.value)}
                      placeholder="Ex: Toujours garder une ambiance sombre"
                      className="flex-1 p-2 bg-darkest/50 rounded-lg border border-white/10 text-white text-sm focus:outline-none focus:border-primary/50"
                    />
                    <button
                      onClick={() => removeCoherenceRule(index)}
                      className="px-3 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition text-sm"
                    >
                      ✕
                    </button>
                  </div>
                ))}
                <button
                  onClick={addCoherenceRule}
                  className="w-full px-3 py-2 bg-primary/20 text-primary rounded-lg hover:bg-primary/30 transition text-sm"
                >
                  + Ajouter une règle
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {objectives.coherenceRules!.map((rule, index) => (
                  <div key={index} className="p-2 bg-darkest/50 rounded-lg border border-primary-dark/30">
                    <p className="text-white/80 text-xs">{rule}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

          {/* 5️⃣ Objectifs de Rythme & Publication */}
          {(!hideEmptyCoherence || hasRhythmObjectives || isEditing) && (
            <div className="lg:col-span-2">
              <h4 className="text-white font-bold mb-4 text-base pb-2 border-b border-primary/30">Rythme & Publication</h4>
              <div className="space-y-3">
                {(!hideEmptyCoherence || hasPublicationRhythm || isEditing) && (
                  <div>
                    <label className="text-primary text-sm font-semibold mb-2 block uppercase tracking-wide">Rythme de publication</label>
                    {isEditing ? (
                      <select
                        value={formData.publicationRhythm || 'hebdomadaire'}
                        onChange={(e) => setFormData({ ...formData, publicationRhythm: e.target.value as any })}
                        className="w-full p-2 bg-darkest/50 rounded-lg border border-white/10 text-white text-sm focus:outline-none focus:border-primary/50"
                      >
                        <option value="hebdomadaire">Hebdomadaire</option>
                        <option value="mensuel">Mensuel</option>
                      </select>
                    ) : (
                      <p className="text-white text-sm capitalize">{objectives.publicationRhythm}</p>
                    )}
                  </div>
                )}

                {(!hideEmptyCoherence || hasAverageChapterSize || isEditing) && (
                  <div>
                    <label className="text-primary text-sm font-semibold mb-2 block uppercase tracking-wide">Taille moyenne d'un chapitre (minutes)</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={formData.averageChapterSize || ''}
                        onChange={(e) => setFormData({ ...formData, averageChapterSize: e.target.value })}
                        placeholder="5-7"
                        className="w-full p-2 bg-darkest/50 rounded-lg border border-white/10 text-white text-sm focus:outline-none focus:border-primary/50"
                      />
                    ) : (
                      <p className="text-white text-sm">{objectives.averageChapterSize} minutes</p>
                    )}
                  </div>
                )}

                {(!hideEmptyCoherence || hasCliffhangerRequired || isEditing) && (
                  <div>
                    <label className="text-primary text-sm font-semibold mb-2 block uppercase tracking-wide">Cliffhanger requis</label>
                    {isEditing ? (
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.cliffhangerRequired ?? true}
                          onChange={(e) => setFormData({ ...formData, cliffhangerRequired: e.target.checked })}
                          className="w-4 h-4 rounded border-white/20 bg-darkest/50 text-primary focus:ring-primary"
                        />
                        <span className="text-white text-sm">Oui</span>
                      </label>
                    ) : (
                      <p className="text-white text-sm">{objectives.cliffhangerRequired ? 'Oui' : 'Non'}</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
