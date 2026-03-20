import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthProvider'

const FLOATING = ['⭐', '🌙', '✨', '🌟', '💫', '🪄']

// This screen greets the user after login and gives them two quick actions.
export function WelcomePage() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  async function handleSignOut() {
    await signOut()
    navigate('/')
  }

  const firstName = user?.email?.split('@')[0] ?? 'there'

  return (
    <div className="relative min-h-screen overflow-hidden bg-navy pb-20 pt-16 text-cream">

      {/* Floating background decorations */}
      {FLOATING.map((emoji, i) => (
        <div
          key={i}
          className="pointer-events-none absolute select-none animate-bounce opacity-20"
          style={{
            top: `${10 + (i * 14) % 70}%`,
            left: `${5 + (i * 17) % 85}%`,
            fontSize: `${1.2 + (i % 3) * 0.4}rem`,
            animationDelay: `${i * 0.4}s`,
            animationDuration: `${2.5 + (i % 3) * 0.8}s`,
          }}
        >
          {emoji}
        </div>
      ))}

      <div className="relative mx-auto max-w-md px-6 pt-10 text-center">

        {/* Hero lamp */}
        <div className="text-8xl drop-shadow-lg">🪔</div>
        <h1 className="mt-4 font-heading text-4xl font-bold text-gold">Story Genie</h1>
        <p className="mt-2 text-cream/60">
          Hey {firstName}! Ready to create magic?
        </p>

        {/* Divider */}
        <div className="mx-auto mt-8 h-px w-16 bg-white/10" />

        {/* Actions */}
        <div className="mt-8 flex flex-col gap-4">
          <Link
            to="/new"
            className="group relative overflow-hidden rounded-2xl bg-gold px-6 py-5 font-heading text-xl font-bold text-navy shadow-lg transition hover:opacity-95 active:scale-95"
          >
            <span className="relative z-10">✨ Create a New Story</span>
          </Link>

          <Link
            to="/saved"
            className="rounded-2xl border border-white/20 bg-white/5 px-6 py-5 font-heading text-xl font-semibold text-cream transition hover:bg-white/10 active:scale-95"
          >
            📚 My Story Library
          </Link>
        </div>

        {/* Fun tagline */}
        <p className="mt-10 text-xs text-cream/30 italic">
          "Every child deserves a story made just for them."
        </p>

        <button
          type="button"
          onClick={handleSignOut}
          className="mt-6 text-xs text-cream/30 hover:text-cream/60"
        >
          Sign out
        </button>
      </div>
    </div>
  )
}
