import { Link } from 'react-router-dom'

// This screen is the public landing page (no login required).
export function LandingPage() {
  return (
    <div className="min-h-screen bg-navy text-cream">
      <div className="mx-auto max-w-5xl px-6 py-14">
        <div className="flex items-center gap-3">
          <div className="text-3xl">🪔</div>
          <div className="font-heading text-2xl font-bold tracking-wide">Story Genie</div>
        </div>

        <h1 className="mt-10 font-heading text-4xl font-bold leading-tight md:text-5xl">
          Bedtime stories from today&apos;s magic moments
        </h1>

        <p className="mt-5 max-w-2xl text-lg text-cream/80">
          Parents describe the day. Your genie creates a cozy, personalized storybook with
          illustrations.
        </p>

        <div className="mt-10 flex flex-col gap-4 sm:flex-row">
          <Link
            to="/auth?mode=signup"
            className="rounded-xl bg-gold px-6 py-3 text-center font-semibold text-navy shadow-book"
          >
            Sign Up
          </Link>
          <Link
            to="/auth?mode=signin"
            className="rounded-xl border border-gold/70 px-6 py-3 text-center font-semibold text-cream"
          >
            Sign In
          </Link>
        </div>
      </div>
    </div>
  )
}

