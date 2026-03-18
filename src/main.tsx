import React, { useEffect, useState } from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'

// Show a clear message if .env is missing so the app doesn’t white-screen.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
const hasEnv = supabaseUrl && supabaseAnonKey && !String(supabaseUrl).includes('YOUR_')

function EnvError() {
  return (
    <div style={{ padding: 24, maxWidth: 480, margin: '40px auto', fontFamily: 'system-ui' }}>
      <h1 style={{ fontSize: 20 }}>Story Genie – setup needed</h1>
      <p>
        Add <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_ANON_KEY</code> to a{' '}
        <code>.env</code> file in the project root (see <code>.env.example</code>).
      </p>
      <p>Restart the dev server after changing <code>.env</code>.</p>
    </div>
  )
}

function Root() {
  const [App, setApp] = useState<typeof import('./App')['default'] | null>(null)
  const [AuthProvider, setAuthProvider] = useState<typeof import('./auth/AuthProvider')['AuthProvider'] | null>(null)
  const [err, setErr] = useState<Error | null>(null)

  useEffect(() => {
    if (!hasEnv) return
    Promise.all([import('./App'), import('./auth/AuthProvider')])
      .then(([appMod, authMod]) => {
        setApp(() => appMod.default)
        setAuthProvider(() => authMod.AuthProvider)
      })
      .catch((e) => setErr(e instanceof Error ? e : new Error(String(e))))
  }, [])

  if (!hasEnv) return <EnvError />
  if (err) return <div style={{ padding: 24 }}>Error: {err.message}</div>
  if (!App || !AuthProvider) return <div style={{ padding: 24 }}>Loading…</div>

  return (
    <React.StrictMode>
      <AuthProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </AuthProvider>
    </React.StrictMode>
  )
}

ReactDOM.createRoot(document.getElementById('root')!).render(<Root />)
