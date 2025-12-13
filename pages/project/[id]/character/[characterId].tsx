import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '@/lib/supabase'
import type { Character, Project } from '@/lib/supabase'
import { buildImageGenerationPrompt } from '@/lib/aiContextBuilder'
import Link from 'next/link'
import AuthGuard from '@/components/AuthGuard'

function EditCharacterContent() {
  const router = useRouter()
  const { id, characterId } = router.query
  const [character, setCharacter] = useState<Character | null>(null)
  const [project, setProject] = useState<Project | null>(null)
  
  // États de base
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  
  // Identité visuelle
  const [faceDescription, setFaceDescription] = useState('')
  const [bodyDescription, setBodyDescription] = useState('')
  const [faceImageFile, setFaceImageFile] = useState<File | null>(null)
  const [faceImagePreview, setFaceImagePreview] = useState<string | null>(null)
  const [bodyImageFile, setBodyImageFile] = useState<File | null>(null)
  const [bodyImagePreview, setBodyImagePreview] = useState<string | null>(null)
  
  // Histoire et traits
  const [history, setHistory] = useState('')
  const [personalityTraits, setPersonalityTraits] = useState<string[]>([])
  const [newTrait, setNewTrait] = useState('')
  
  // Images de référence
  const [referenceImages, setReferenceImages] = useState<string[]>([])
  const [referenceImageFiles, setReferenceImageFiles] = useState<File[]>([])
  
  // États UI
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [generatingFace, setGeneratingFace] = useState(false)
  const [generatingBody, setGeneratingBody] = useState(false)

  useEffect(() => {
    if (characterId && id) {
      loadProject()
      loadCharacter()
    }
  }, [characterId, id])

  const loadProject = async () => {
    if (!id || typeof id !== 'string') return
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', id)
        .single()
      if (error) throw error
      setProject(data)
    } catch (error) {
      console.error('Error loading project:', error)
    }
  }

  const loadCharacter = async () => {
    if (!characterId || typeof characterId !== 'string') return

    try {
      const { data, error } = await supabase
        .from('characters')
        .select('*')
        .eq('id', characterId)
        .single()

      if (error) throw error
      setCharacter(data)
      setName(data.name)
      setDescription(data.description || '')
      setImagePreview(data.image_url)
      setFaceDescription(data.face_description || '')
      setBodyDescription(data.body_description || '')
      setFaceImagePreview(data.face_image_url || null)
      setBodyImagePreview(data.body_image_url || null)
      setHistory(data.history || '')
      setPersonalityTraits(data.personality_traits || [])
      setReferenceImages(data.reference_images || [])
    } catch (error) {
      console.error('Error loading character:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'main' | 'face' | 'body') => {
    const file = e.target.files?.[0]
    if (file) {
      if (type === 'main') {
        setImageFile(file)
        const reader = new FileReader()
        reader.onloadend = () => setImagePreview(reader.result as string)
        reader.readAsDataURL(file)
      } else if (type === 'face') {
        setFaceImageFile(file)
        const reader = new FileReader()
        reader.onloadend = () => setFaceImagePreview(reader.result as string)
        reader.readAsDataURL(file)
      } else if (type === 'body') {
        setBodyImageFile(file)
        const reader = new FileReader()
        reader.onloadend = () => setBodyImagePreview(reader.result as string)
        reader.readAsDataURL(file)
      }
    }
  }

  const handleReferenceImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    setReferenceImageFiles([...referenceImageFiles, ...files])
    
    files.forEach(file => {
      const reader = new FileReader()
      reader.onloadend = () => {
        setReferenceImages(prev => [...prev, reader.result as string])
      }
      reader.readAsDataURL(file)
    })
  }

  const removeReferenceImage = (index: number) => {
    setReferenceImages(prev => prev.filter((_, i) => i !== index))
    setReferenceImageFiles(prev => prev.filter((_, i) => i !== index))
  }

  const addTrait = () => {
    if (newTrait.trim() && !personalityTraits.includes(newTrait.trim())) {
      setPersonalityTraits([...personalityTraits, newTrait.trim()])
      setNewTrait('')
    }
  }

  const removeTrait = (index: number) => {
    setPersonalityTraits(personalityTraits.filter((_, i) => i !== index))
  }

  const uploadImage = async (file: File, path: string): Promise<string> => {
    const fileExt = file.name.split('.').pop()
    const fileName = `${Math.random()}.${fileExt}`
    const filePath = `${path}/${fileName}`

    const { error: uploadError } = await supabase.storage
      .from('images')
      .upload(filePath, file)

    if (uploadError) throw uploadError

    const { data: { publicUrl } } = supabase.storage
      .from('images')
      .getPublicUrl(filePath)

    return publicUrl
  }

  const generateImageWithAI = async (type: 'face' | 'body', prompt: string) => {
    if (!project || !prompt.trim() || !character) return

    if (type === 'face') {
      setGeneratingFace(true)
    } else {
      setGeneratingBody(true)
    }

    try {
      // Utiliser le constructeur de contexte pour garantir la cohérence avec le template sélectionné
      const userPrompt = `${type === 'face' ? 'Visage' : 'Corps'} de ${name}: ${prompt}. ${type === 'face' ? 'Portrait, visage détaillé, expressions' : 'Corps complet, pose, proportions webtoon vertical'}`

      const { prompt: fullPrompt, styleReference, format } = buildImageGenerationPrompt(
        {
          project,
          character
        },
        userPrompt,
        'character'
      )

      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: fullPrompt,
          styleReference: styleReference,
          format: format,
          projectId: project.id,
          characterId: character.id,
          imageType: 'character'
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        const errorMessage = errorData.error || 'Failed to generate image'
        
        // Si c'est une erreur de configuration, afficher un message plus clair
        if (errorMessage.includes('Service IA non configuré')) {
          alert('⚠️ Service IA non configuré\n\nPour générer des images, vous devez configurer un service IA dans .env.local\n\nVoir docs/AI_SERVICE_INTEGRATION.md pour les instructions.')
        } else {
          throw new Error(errorMessage)
        }
        return
      }

      const { imageUrl, warnings, success } = await response.json()

      if (!success || !imageUrl) {
        throw new Error('Aucune image générée')
      }

      if (warnings && warnings.length > 0) {
        console.warn('Warnings:', warnings)
      }

      if (type === 'face') {
        setFaceImagePreview(imageUrl)
      } else {
        setBodyImagePreview(imageUrl)
      }

      const identityVisualReference = project.identity_visual_reference_url || project.style_reference_image_url
      alert(`Image ${type === 'face' ? 'du visage' : 'du corps'} générée avec succès! ${identityVisualReference ? 'Style cohérent avec l\'identité visuelle du projet.' : ''}`)
    } catch (error: any) {
      console.error('Error generating image:', error)
      alert(`Erreur lors de la génération de l'image: ${error.message || 'Erreur inconnue'}`)
    } finally {
      if (type === 'face') {
        setGeneratingFace(false)
      } else {
        setGeneratingBody(false)
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !characterId || typeof characterId !== 'string' || !id || typeof id !== 'string') return

    setUploading(true)

    try {
      let imageUrl = character?.image_url || null
      let faceImageUrl = character?.face_image_url || null
      let bodyImageUrl = character?.body_image_url || null
      const uploadedReferenceImages: string[] = [...referenceImages.filter(url => url.startsWith('http'))]

      // Upload image principale
      if (imageFile) {
        imageUrl = await uploadImage(imageFile, `characters/${id}`)
      }

      // Upload image visage
      if (faceImageFile) {
        faceImageUrl = await uploadImage(faceImageFile, `characters/${id}/faces`)
      } else if (faceImagePreview && faceImagePreview.startsWith('data:')) {
        // Si c'est une image générée par IA, on la sauvegarde
        faceImageUrl = faceImagePreview
      }

      // Upload image corps
      if (bodyImageFile) {
        bodyImageUrl = await uploadImage(bodyImageFile, `characters/${id}/bodies`)
      } else if (bodyImagePreview && bodyImagePreview.startsWith('data:')) {
        // Si c'est une image générée par IA, on la sauvegarde
        bodyImageUrl = bodyImagePreview
      }

      // Upload images de référence
      for (const file of referenceImageFiles) {
        const url = await uploadImage(file, `characters/${id}/references`)
        uploadedReferenceImages.push(url)
      }

      const { error } = await supabase
        .from('characters')
        .update({
          name,
          description: description || null,
          image_url: imageUrl,
          face_description: faceDescription || null,
          body_description: bodyDescription || null,
          face_image_url: faceImageUrl,
          body_image_url: bodyImageUrl,
          history: history || null,
          personality_traits: personalityTraits.length > 0 ? personalityTraits : null,
          reference_images: uploadedReferenceImages.length > 0 ? uploadedReferenceImages : null,
        })
        .eq('id', characterId)

      if (error) throw error

      router.push(`/project/${id}`)
    } catch (error) {
      console.error('Error updating character:', error)
      alert('Erreur lors de la mise à jour du personnage')
    } finally {
      setUploading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center creative-bg">
        <div className="text-2xl gradient-text font-bold animate-pulse">Chargement...</div>
      </div>
    )
  }

  if (!character) {
    return (
      <div className="min-h-screen flex items-center justify-center creative-bg">
        <div className="text-2xl gradient-text font-bold">Personnage non trouvé</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen creative-bg">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Link
          href={`/project/${id}`}
          className="text-white hover:text-secondary transition mb-6 inline-block font-semibold"
        >
          ← Retour au projet
        </Link>

        <div className="bg-darker/90 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border-2 border-primary-dark/50">
          <div className="flex items-center gap-4 mb-8">
            {imagePreview ? (
              <img
                src={imagePreview}
                alt={character.name}
                className="w-20 h-20 rounded-2xl object-cover border-2 border-primary-dark/50"
              />
            ) : (
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-light font-black text-3xl">
                {character.name.charAt(0).toUpperCase()}
              </div>
            )}
            <h1 className="text-4xl font-black gradient-text">Éditer Personnage</h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Informations de base */}
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white border-b border-white/10 pb-2">Informations de base</h2>
              
              <div>
                <label className="block text-sm font-bold text-light mb-2">
                  Nom <span className="text-white">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-darkest border-2 border-dark-gray rounded-xl focus:outline-none focus:border-primary-dark transition text-light"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-light mb-2">
                  Description générale
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 bg-darkest border-2 border-dark-gray rounded-xl focus:outline-none focus:border-primary-dark transition resize-none text-light"
                  placeholder="Description générale du personnage..."
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-light mb-2">
                  Image principale
                </label>
                <div className="border-2 border-dashed border-dark-gray rounded-xl p-6 hover:border-primary-dark transition cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageChange(e, 'main')}
                    className="w-full cursor-pointer"
                  />
                </div>
                {imagePreview && (
                  <div className="mt-4 rounded-xl overflow-hidden border-2 border-primary-dark/50 shadow-lg">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-64 object-cover"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Identité visuelle */}
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white border-b border-white/10 pb-2">🎨 Identité visuelle</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Visage */}
                <div className="space-y-4">
                  <label className="block text-sm font-bold text-light mb-2">
                    Visage
                  </label>
                  <textarea
                    value={faceDescription}
                    onChange={(e) => setFaceDescription(e.target.value)}
                    rows={4}
                    className="w-full px-4 py-3 bg-darkest border-2 border-dark-gray rounded-xl focus:outline-none focus:border-primary-dark transition resize-none text-light"
                    placeholder="Description du visage (yeux, cheveux, expression...)"
                  />
                  <div className="flex gap-2">
                    <div className="flex-1 border-2 border-dashed border-dark-gray rounded-xl p-4 hover:border-primary-dark transition cursor-pointer">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageChange(e, 'face')}
                        className="w-full cursor-pointer text-xs"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => generateImageWithAI('face', faceDescription || `Visage de ${name}`)}
                      disabled={generatingFace || !project}
                      className="px-4 py-2 bg-gradient-to-r from-primary to-accent text-white rounded-xl hover:shadow-lg transition font-semibold disabled:opacity-50 text-sm whitespace-nowrap"
                    >
                      {generatingFace ? '⏳' : '🎨 IA'}
                    </button>
                  </div>
                  {faceImagePreview && (
                    <div className="mt-2 rounded-xl overflow-hidden border-2 border-primary-dark/50">
                      <img
                        src={faceImagePreview}
                        alt="Visage"
                        className="w-full h-48 object-cover"
                      />
                    </div>
                  )}
                </div>

                {/* Corps */}
                <div className="space-y-4">
                  <label className="block text-sm font-bold text-light mb-2">
                    Corps
                  </label>
                  <textarea
                    value={bodyDescription}
                    onChange={(e) => setBodyDescription(e.target.value)}
                    rows={4}
                    className="w-full px-4 py-3 bg-darkest border-2 border-dark-gray rounded-xl focus:outline-none focus:border-primary-dark transition resize-none text-light"
                    placeholder="Description du corps (taille, silhouette, pose...)"
                  />
                  <div className="flex gap-2">
                    <div className="flex-1 border-2 border-dashed border-dark-gray rounded-xl p-4 hover:border-primary-dark transition cursor-pointer">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageChange(e, 'body')}
                        className="w-full cursor-pointer text-xs"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => generateImageWithAI('body', bodyDescription || `Corps de ${name}`)}
                      disabled={generatingBody || !project}
                      className="px-4 py-2 bg-gradient-to-r from-primary to-accent text-white rounded-xl hover:shadow-lg transition font-semibold disabled:opacity-50 text-sm whitespace-nowrap"
                    >
                      {generatingBody ? '⏳' : '🎨 IA'}
                    </button>
                  </div>
                  {bodyImagePreview && (
                    <div className="mt-2 rounded-xl overflow-hidden border-2 border-primary-dark/50">
                      <img
                        src={bodyImagePreview}
                        alt="Corps"
                        className="w-full h-48 object-cover"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Histoire et personnalité */}
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white border-b border-white/10 pb-2">📖 Histoire & Personnalité</h2>
              
              <div>
                <label className="block text-sm font-bold text-light mb-2">
                  Histoire
                </label>
                <textarea
                  value={history}
                  onChange={(e) => setHistory(e.target.value)}
                  rows={6}
                  className="w-full px-4 py-3 bg-darkest border-2 border-dark-gray rounded-xl focus:outline-none focus:border-primary-dark transition resize-none text-light"
                  placeholder="Histoire, background, passé du personnage..."
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-light mb-2">
                  Traits de caractère
                </label>
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={newTrait}
                    onChange={(e) => setNewTrait(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTrait())}
                    placeholder="Ajouter un trait (ex: courageux, loyal...)"
                    className="flex-1 px-4 py-2 bg-darkest border-2 border-dark-gray rounded-xl focus:outline-none focus:border-primary-dark transition text-light"
                  />
                  <button
                    type="button"
                    onClick={addTrait}
                    className="px-4 py-2 bg-primary text-white rounded-xl hover:bg-primary/80 transition font-semibold"
                  >
                    + Ajouter
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {personalityTraits.map((trait, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-primary/20 text-primary rounded-lg text-sm flex items-center gap-2"
                    >
                      {trait}
                      <button
                        type="button"
                        onClick={() => removeTrait(index)}
                        className="text-primary hover:text-primary/70 transition"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Images de référence */}
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white border-b border-white/10 pb-2">🖼️ Images de référence</h2>
              
              <div className="border-2 border-dashed border-dark-gray rounded-xl p-6 hover:border-primary-dark transition cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleReferenceImagesChange}
                  className="w-full cursor-pointer"
                />
                <p className="text-center text-white/60 mt-2 text-sm">
                  Cliquez pour ajouter des images de référence (multiple)
                </p>
              </div>

              {referenceImages.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {referenceImages.map((url, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={url}
                        alt={`Référence ${index + 1}`}
                        className="w-full h-48 object-cover rounded-xl border-2 border-primary-dark/50"
                      />
                      <button
                        type="button"
                        onClick={() => removeReferenceImage(index)}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end gap-4 pt-4 border-t border-white/10">
              <Link
                href={`/project/${id}`}
                className="px-6 py-3 text-light bg-dark-gray rounded-xl hover:bg-dark-gray/80 transition font-semibold"
              >
                Annuler
              </Link>
              <button
                type="submit"
                disabled={uploading}
                className="btn-creative px-6 py-3 bg-gradient-to-r from-primary to-accent text-light rounded-xl hover:shadow-lg transition font-semibold disabled:opacity-50"
              >
                {uploading ? '⏳ Sauvegarde...' : '💾 Sauvegarder'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default function EditCharacter() {
  return (
    <AuthGuard>
      <EditCharacterContent />
    </AuthGuard>
  )
}
