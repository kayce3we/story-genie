import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthProvider'

// This screen lets a parent sign up or sign in with email + password.
export function AuthPage() {
  const { signIn, signUp, user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const params = new URLSearchParams(location.search)
  const startMode = params.get('mode') === 'signup' ? 'signup' : 'signin'

  const [mode, setMode] = useState<'signin' | 'signup'>(startMode)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const title = useMemo(() => (mode === 'signup' ? 'Create your account' : 'Welcome back'), [mode])

  // If already logged in, go to the welcome page.
  useEffect(() => {
    if (user) navigate('/welcome', { replace: true })
  }, [user, navigate])

  // This function submits the form to Supabase Auth.
  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError(null)

    const msg =
      mode === 'signup' ? await signUp(email, password) : await signIn(email, password)

    setBusy(false)

    if (msg) {
      setError(msg)
      return
    }

    navigate('/welcome')
  }

  return (
    <div className="min-h-screen bg-navy text-cream">
      <div className="mx-auto max-w-md px-6 py-14">
        <div className="text-center font-heading text-3xl font-bold">Story Genie</div>

        <h1 className="mt-10 text-center font-heading text-2xl font-semibold">{title}</h1>

        <form onSubmit={onSubmit} className="mt-8 space-y-4 rounded-2xl bg-white/5 p-6">
          <label className="block">
            <div className="mb-2 text-sm text-cream/80">Email</div>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              required
              className="w-full rounded-xl bg-white/10 px-4 py-3 text-cream placeholder:text-cream/40 outline-none ring-1 ring-white/10 focus:ring-2 focus:ring-gold/80"
              placeholder="you@example.com"
            />
          </label>

          <label className="block">
            <div className="mb-2 text-sm text-cream/80">Password</div>
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              required
              className="w-full rounded-xl bg-white/10 px-4 py-3 text-cream placeholder:text-cream/40 outline-none ring-1 ring-white/10 focus:ring-2 focus:ring-gold/80"
              placeholder="••••••••"
            />
          </label>

          {error ? <div className="rounded-xl bg-red-500/20 p-3 text-sm">{error}</div> : null}

          <button
            disabled={busy}
            className="w-full rounded-xl bg-gold px-6 py-3 font-semibold text-navy disabled:opacity-60"
          >
            {busy ? 'Working…' : mode === 'signup' ? 'Sign Up' : 'Sign In'}
          </button>

          <button
            type="button"
            onClick={() => setMode(mode === 'signup' ? 'signin' : 'signup')}
            className="w-full rounded-xl border border-white/15 px-6 py-3 font-semibold text-cream"
          >
            {mode === 'signup' ? 'Already have an account? Sign in' : 'New here? Create an account'}
          </button>
        </form>
      </div>
    </div>
  )
}

