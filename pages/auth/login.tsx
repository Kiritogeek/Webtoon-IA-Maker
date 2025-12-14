import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { supabase, getUser } from '@/lib/supabase'
import Link from 'next/link'

export default function Login() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    checkUser()
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user && router.pathname === '/auth/login') {
        // Utiliser replace au lieu de push pour éviter les conflits
        router.replace('/dashboard')
      }
    })
    return () => subscription.unsubscribe()
  }, [router])

  const checkUser = async () => {
    const { user } = await getUser()
    if (user) {
      router.push('/dashboard')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      if (isSignUp) {
        // Vérifier que les champs sont remplis
        if (!firstName.trim() || !lastName.trim()) {
          throw new Error('Le prénom et le nom sont obligatoires')
        }

        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: undefined,
          }
        })
        if (error) throw error
        
        // Si l'utilisateur est créé, créer le profil et connecter
        if (data.user) {
          // Créer le profil utilisateur
          const { error: profileError } = await supabase
            .from('user_profiles')
            .insert([
              {
                user_id: data.user.id,
                email: email.trim(),
                first_name: firstName.trim(),
                last_name: lastName.trim(),
              },
            ])

          if (profileError) {
            console.error('Error creating profile:', profileError)
            // Afficher l'erreur mais continuer quand même
            setError(`Erreur lors de la création du profil: ${profileError.message}. Veuillez vérifier que la table user_profiles existe dans Supabase.`)
            setLoading(false)
            return
          }

          // Attendre un peu pour que le trigger confirme l'email
          await new Promise(resolve => setTimeout(resolve, 500))

          // Connexion automatique après inscription
          const { error: signInError } = await supabase.auth.signInWithPassword({
            email,
            password,
          })
          
          if (signInError) {
            // Si erreur "Email not confirmed", réessayer après un délai
            if (signInError.message.includes('Email not confirmed') || signInError.message.includes('email_not_confirmed')) {
              await new Promise(resolve => setTimeout(resolve, 1000))
              const { error: retryError } = await supabase.auth.signInWithPassword({
                email,
                password,
              })
              if (retryError) throw retryError
            } else {
              throw signInError
            }
          }
          
          // Utiliser replace pour éviter les conflits de navigation
          router.replace('/dashboard')
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        
        if (error) {
          // Message d'erreur personnalisé pour les emails non confirmés
          if (error.message.includes('Email not confirmed') || error.message.includes('email_not_confirmed')) {
            throw new Error('Email non confirmé. Veuillez exécuter le script supabase-confirm-emails.sql dans Supabase ou désactiver la confirmation d\'email dans Authentication > Settings.')
          }
          throw error
        }
        
        // Utiliser replace pour éviter les conflits de navigation
        router.replace('/dashboard')
      }
    } catch (error: any) {
      // Vérifier si c'est une erreur de configuration Supabase
      if (error.message?.includes('CORS') || error.message?.includes('NetworkError') || error.message?.includes('fetch') || error.message?.includes('Failed to fetch') || error.message?.includes('votre-projet')) {
        setError('⚠️ Configuration Supabase incorrecte!\n\nLe fichier .env.local contient encore des valeurs PLACEHOLDER.\n\nVous devez:\n1. Ouvrir .env.local\n2. Remplacer "https://votre-projet.supabase.co" par votre vraie URL Supabase\n3. Remplacer "votre_cle_anon_ici" par votre vraie clé anon\n4. Redémarrer le serveur (Ctrl+C puis npm run dev)\n\nTrouvez vos clés dans Supabase: Settings → API')
        console.error('❌ Erreur CORS - Supabase non configuré correctement')
        console.error('📝 Le fichier .env.local contient encore des valeurs PLACEHOLDER!')
        console.error('   Vous devez remplacer:')
        console.error('   - "https://votre-projet.supabase.co" → votre vraie URL Supabase')
        console.error('   - "votre_cle_anon_ici" → votre vraie clé anon')
        console.error('   Puis redémarrer le serveur')
      } else {
        setError(error.message || 'Une erreur est survenue')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen creative-bg flex items-center justify-center p-4">
      <button
        onClick={() => router.push('/')}
        className="fixed top-4 left-4 w-12 h-12 flex items-center justify-center bg-darker/90 backdrop-blur-sm border-2 border-white/50 rounded-full text-white hover:text-accent hover:border-yellow transition font-semibold text-2xl shadow-lg z-50"
      >
        ←
      </button>
      
      <div className="w-full max-w-md">

        <div className="bg-darker/90 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border-2 border-primary-dark/50">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-black gradient-text mb-2">
              {isSignUp ? 'Créer un compte' : 'Connexion'}
            </h1>
            <p className="text-white/80">
              {isSignUp ? 'Rejoignez-nous pour créer vos webtoons' : 'Connectez-vous à votre compte'}
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-orange-dark/30 border-2 border-primary-dark rounded-xl text-white">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {isSignUp && (
              <>
                <div>
                  <label className="block text-sm font-bold text-white mb-2">
                    Prénom <span className="text-yellow">*</span>
                  </label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                    className="w-full px-4 py-3 bg-darkest border-2 border-primary-dark rounded-xl focus:outline-none focus:border-accent transition text-white"
                    placeholder="Jean"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-white mb-2">
                    Nom <span className="text-yellow">*</span>
                  </label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                    className="w-full px-4 py-3 bg-darkest border-2 border-primary-dark rounded-xl focus:outline-none focus:border-accent transition text-white"
                    placeholder="Dupont"
                  />
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-bold text-white mb-2">
                Email <span className="text-yellow">*</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 bg-darkest border-2 border-primary-dark rounded-xl focus:outline-none focus:border-accent transition text-white"
                placeholder="votre@email.com"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-white mb-2">
                Mot de passe <span className="text-yellow">*</span>
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full px-4 py-3 bg-darkest border-2 border-primary-dark rounded-xl focus:outline-none focus:border-accent transition text-white"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-creative w-full py-4 bg-gradient-to-r from-yellow to-orange text-white rounded-xl hover:shadow-lg transition font-bold text-lg disabled:opacity-50"
            >
              {loading ? '⏳' : isSignUp ? '✨ Créer mon compte' : '🚀 Se connecter'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp)
                setError(null)
                setFirstName('')
                setLastName('')
              }}
              className="text-white hover:text-accent transition font-semibold"
            >
              {isSignUp 
                ? 'Déjà un compte ? Se connecter' 
                : 'Pas encore de compte ? S\'inscrire'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

