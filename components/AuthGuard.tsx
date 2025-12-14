import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { getUser } from '@/lib/supabase'
import { supabase } from '@/lib/supabase'

interface AuthGuardProps {
  children: React.ReactNode
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    checkUser()
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const newUser = session?.user ?? null
      setUser(newUser)
      setLoading(false)
      
      // Rediriger seulement si on n'est pas déjà sur la page de login
      if (!newUser && router.pathname !== '/auth/login') {
        router.replace('/auth/login')
      }
    })
    return () => subscription.unsubscribe()
  }, [router])

  const checkUser = async () => {
    const { user } = await getUser()
    setUser(user)
    setLoading(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center creative-bg">
        <div className="text-2xl gradient-text font-bold animate-pulse">Chargement...</div>
      </div>
    )
  }

  if (!user) {
    // Utiliser replace pour éviter les conflits
    if (router.pathname !== '/auth/login') {
      router.replace('/auth/login')
    }
    return null
  }

  return <>{children}</>
}

