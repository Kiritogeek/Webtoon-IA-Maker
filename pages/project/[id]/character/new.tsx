import { useState } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '@/lib/supabase'
import AuthGuard from '@/components/AuthGuard'

function NewCharacterContent() {
  const router = useRouter()
  const { id } = router.query
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !id || typeof id !== 'string') return

    setUploading(true)

    try {
      let imageUrl = null

      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop()
        const fileName = `${Math.random()}.${fileExt}`
        const filePath = `characters/${id}/${fileName}`

        const { error: uploadError } = await supabase.storage
          .from('images')
          .upload(filePath, imageFile)

        if (uploadError) throw uploadError

        const { data: { publicUrl } } = supabase.storage
          .from('images')
          .getPublicUrl(filePath)

        imageUrl = publicUrl
      }

      const { data, error } = await supabase
        .from('characters')
        .insert([
          {
            project_id: id,
            name,
            description: description || null,
            image_url: imageUrl,
          },
        ])
        .select()
        .single()

      if (error) throw error

      router.push(`/project/${id}`)
    } catch (error) {
      console.error('Error creating character:', error)
      alert('Erreur lors de la création du personnage')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="min-h-screen creative-bg">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Bouton retour en haut à gauche */}
        <button
          onClick={() => router.back()}
          className="mb-6 inline-flex items-center gap-2 text-white hover:text-secondary transition font-semibold group"
        >
          <span className="text-2xl group-hover:-translate-x-1 transition-transform">←</span>
          <span>Retour</span>
        </button>

        <div className="bg-darker/90 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border-2 border-primary-dark/50">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-light font-black text-3xl">
              👤
            </div>
            <h1 className="text-4xl font-black gradient-text">Nouveau Personnage</h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
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
                placeholder="Nom du personnage"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-light mb-2">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={5}
                className="w-full px-4 py-3 bg-darkest border-2 border-dark-gray rounded-xl focus:outline-none focus:border-primary-dark transition resize-none text-light"
                placeholder="Décrivez votre personnage, sa personnalité, son apparence, son histoire..."
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-light mb-2">
                Image de référence
              </label>
              <div className="border-2 border-dashed border-dark-gray rounded-xl p-6 hover:border-primary-dark transition cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="w-full cursor-pointer"
                />
                {!imagePreview && (
                  <p className="text-center text-white/60 mt-2">
                    Cliquez pour sélectionner une image
                  </p>
                )}
              </div>
              {imagePreview && (
                <div className="mt-4 rounded-xl overflow-hidden border-2 border-primary-dark/50 shadow-lg">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-80 object-cover"
                  />
                </div>
              )}
            </div>

            <div className="flex justify-end gap-4 pt-4">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-6 py-3 text-light bg-dark-gray rounded-xl hover:bg-dark-gray/80 transition font-semibold"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={uploading}
                className="btn-creative px-6 py-3 bg-gradient-to-r from-primary to-accent text-light rounded-xl hover:shadow-lg transition font-semibold disabled:opacity-50"
              >
                {uploading ? '⏳ Création...' : '✨ Créer'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default function NewCharacter() {
  return (
    <AuthGuard>
      <NewCharacterContent />
    </AuthGuard>
  )
}
