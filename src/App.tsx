import { Navigate, Route, Routes } from 'react-router-dom'
import { RequireAuth } from './auth/RequireAuth'
import { AuthPage } from './pages/AuthPage'
import { LandingPage } from './pages/LandingPage'
import { LoadingPage } from './pages/LoadingPage'
import { SavedStoriesPage } from './pages/SavedStoriesPage'
import { StoryInputPage } from './pages/StoryInputPage'
import { StorybookPage } from './pages/StorybookPage'

// This is the "map" of all screens (routes) in our app.
export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/auth" element={<AuthPage />} />

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
  )
}
