import { Link, useLocation } from 'react-router-dom'

const TABS = [
  { to: '/welcome', label: 'Home',    icon: '🏠' },
  { to: '/new',     label: 'Create',  icon: '✨' },
  { to: '/saved',   label: 'Library', icon: '📚' },
]

export function NavBar() {
  const { pathname } = useLocation()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/10 bg-navy">
      <div className="mx-auto flex max-w-lg">
        {TABS.map((tab) => {
          const active = pathname === tab.to
          return (
            <Link
              key={tab.to}
              to={tab.to}
              className={[
                'flex flex-1 flex-col items-center gap-1 py-3 text-xs font-semibold transition',
                active ? 'text-gold' : 'text-cream/50 hover:text-cream',
              ].join(' ')}
            >
              <span className="text-xl">{tab.icon}</span>
              {tab.label}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
