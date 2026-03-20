import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { RequireAuth } from './auth/RequireAuth'
import { NavBar } from './components/NavBar'
import { AuthPage } from './pages/AuthPage'
import { LandingPage } from './pages/LandingPage'
import { LoadingPage } from './pages/LoadingPage'
import { SavedStoriesPage } from './pages/SavedStoriesPage'
import { StoryInputPage } from './pages/StoryInputPage'
import { StorybookPage } from './pages/StorybookPage'
import { WelcomePage } from './pages/WelcomePage'

const NO_NAV = ['/', '/auth', '/loading']

// This is the "map" of all screens (routes) in our app.
export default function App() {
  const { pathname } = useLocation()
  const showNav = !NO_NAV.includes(pathname)

  return (
    <>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/auth" element={<AuthPage />} />

        <Route
          path="/welcome"
          element={
            <RequireAuth>
              <WelcomePage />
            </RequireAuth>
          }
        />

        <Route
          path="/new"
          element={
            <RequireAuth>
              <StoryInputPage />
            </RequireAuth>
          }
        />

        <Route
          path="/loading"
          element={
            <RequireAuth>
              <LoadingPage />
            </RequireAuth>
          }
        />

        <Route
          path="/saved"
          element={
            <RequireAuth>
              <SavedStoriesPage />
            </RequireAuth>
          }
        />

        <Route
          path="/story/:id"
          element={
            <RequireAuth>
              <StorybookPage />
            </RequireAuth>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {showNav && (
        <RequireAuth>
          <NavBar />
        </RequireAuth>
      )}
    </>
  )
}
