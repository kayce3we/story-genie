import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { loadSavedStories } from '../lib/db'
import { THEMES, type ThemeKey } from '../types/story'

type StoryCard = {
  id: string
  title: string
  createdAt: string
  theme: ThemeKey
  coverUrl: string | null
}

// This screen shows a grid of saved stories for the logged-in parent.
export function SavedStoriesPage() {
  const navigate = useNavigate()
  const [cards, setCards] = useState<StoryCard[]>([])
  const [error, setError] = useState<string | null>(null)

  // This effect loads saved stories and their cover images (page 1).
  useEffect(() => {
    async function load() {
      try {
        setError(null)
        const stories = await loadSavedStories()

        const withCovers = await Promise.all(
          stories.map(async (s) => {
            const { data } = await supabase
              .from('story_pages')
              .select('image_url')
              .eq('story_id', s.id)
              .eq('page_number', 1)
              .maybeSingle()

            return {
              id: s.id as string,
              title: (s.title as string) ?? 'Untitled story',
              createdAt: s.created_at as string,
              theme: s.theme as ThemeKey,
              coverUrl: (data?.image_url as string | undefined) ?? null,
            }
          }),
        )

        setCards(withCovers)
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load stories.')
      }
    }

    load()
  }, [])

  // This helper finds the emoji for a theme.
  function themeEmoji(theme: ThemeKey) {
    return THEMES.find((t) => t.key === theme)?.emoji ?? '✨'
  }

  return (
    <div className="min-h-screen bg-navy text-cream">
      <div className="mx-auto max-w-5xl px-6 py-14">
        <div className="flex items-center justify-between gap-4">
          <h1 className="font-heading text-3xl font-bold">Saved Stories</h1>
          <Link to="/new" className="rounded-xl bg-gold px-4 py-2 font-semibold text-navy">
            Create New
          </Link>
        </div>

        {error ? (
          <div className="mt-8 rounded-2xl bg-red-500/20 p-6">
            <div className="font-semibold">Couldn’t load stories</div>
            <div className="mt-1 text-sm opacity-90">{error}</div>
          </div>
        ) : null}

        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => navigate(`/story/${c.id}`)}
              className="overflow-hidden rounded-2xl bg-white/5 text-left ring-1 ring-white/10 hover:bg-white/10"
            >
              <div className="aspect-[4/3] w-full bg-black/20">
                {c.coverUrl ? (
                  <img
                    src={c.coverUrl}
                    alt="Cover"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-5xl">🪔</div>
                )}
              </div>
              <div className="p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="font-semibold">{c.title}</div>
                  <div className="text-lg">{themeEmoji(c.theme)}</div>
                </div>
                <div className="mt-1 text-sm text-cream/70">
                  {new Date(c.createdAt).toLocaleDateString()}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

