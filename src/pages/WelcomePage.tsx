import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthProvider'

// This screen greets the user after login and gives them two quick actions.
export function WelcomePage() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  async function handleSignOut() {
    await signOut()
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-navy pb-20 text-cream">
      <div className="mx-auto max-w-md px-6 py-20 text-center">
        <div className="font-heading text-4xl font-bold">Story Genie</div>
        <div className="mt-3 text-cream/60">
          {user?.email ? `Welcome back, ${user.email}` : 'Welcome back!'}
        </div>

        <div className="mt-14 flex flex-col gap-4">
          <Link
            to="/new"
            className="rounded-2xl bg-gold px-6 py-5 font-heading text-xl font-bold text-navy hover:opacity-90"
          >
            ✨ Create a New Story
          </Link>
          <Link
            to="/saved"
            className="rounded-2xl border border-white/20 px-6 py-5 font-heading text-xl font-semibold text-cream hover:bg-white/5"
          >
            📚 Saved Stories
          </Link>
          <button
            type="button"
            onClick={handleSignOut}
            className="mt-4 text-sm text-cream/40 hover:text-cream/70"
          >
            Sign out
          </button>
        </div>
      </div>
    </div>
  )
}
