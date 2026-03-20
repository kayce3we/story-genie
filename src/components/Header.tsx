// Persistent top header shown on all authenticated pages.
export function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-navy/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-4xl items-center gap-2 px-6 py-3">
        <span className="text-2xl">🪔</span>
        <span className="font-heading text-lg font-bold text-gold">Story Genie</span>
      </div>
    </header>
  )
}
