import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { loadStoryPages } from '../lib/db'
import type { StoryPage } from '../types/story'

// This screen renders the story as a simple "storybook" with page flipping.
export function StorybookPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [pages, setPages] = useState<StoryPage[]>([])
  const [pageIndex, setPageIndex] = useState(0)
  const [error, setError] = useState<string | null>(null)

  const current = pages[pageIndex]

  const pageLabel = useMemo(() => {
    if (pages.length === 0) return 'Page 0 of 0'
    return `Page ${pageIndex + 1} of ${pages.length}`
  }, [pageIndex, pages.length])

  // This effect loads story pages from Supabase when the page opens.
  useEffect(() => {
    if (!id) {
      setError('Missing story id in URL.')
      return
    }
    const storyId = id

    async function load() {
      try {
        setError(null)
        const p = await loadStoryPages(storyId)
        setPages(p)
        setPageIndex(0)
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load story.')
      }
    }

    load()
  }, [id])

  // This function reads the current page aloud using the Web Speech API.
  function readAloud() {
    if (!current?.paragraph) return
    if (!('speechSynthesis' in window)) return

    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(current.paragraph)
    utterance.rate = 0.95
    window.speechSynthesis.speak(utterance)
  }

  return (
    <div className="min-h-screen bg-navy text-cream">
      <div className="mx-auto max-w-4xl px-6 py-14">
        <div className="flex items-center justify-between gap-4">
          <h1 className="font-heading text-3xl font-bold">Storybook</h1>
          <Link to="/saved" className="rounded-xl border border-white/15 px-4 py-2 text-sm">
            Saved Stories
          </Link>
        </div>

        {error ? (
          <div className="mt-8 rounded-2xl bg-red-500/20 p-6">
            <div className="font-semibold">Couldn’t load that story</div>
            <div className="mt-1 text-sm opacity-90">{error}</div>
            <button
              type="button"
              onClick={() => navigate('/saved')}
              className="mt-4 rounded-xl bg-gold px-4 py-2 font-semibold text-navy"
            >
              Back to Saved Stories
            </button>
          </div>
        ) : null}

        {current ? (
          <div className="mt-8 rounded-3xl bg-cream p-6 text-navy shadow-book">
            <img
              src={current.imageUrl}
              alt="Story illustration"
              className="h-72 w-full rounded-2xl object-cover sm:h-96"
            />

            <div className="mt-6 text-lg leading-relaxed">{current.paragraph}</div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-sm text-navy/60">{pageLabel}</div>

              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => setPageIndex((i) => Math.max(0, i - 1))}
                  disabled={pageIndex === 0}
                  className="rounded-xl border border-navy/15 px-4 py-2 font-semibold disabled:opacity-40"
                >
                  ← Previous
                </button>
                <button
                  type="button"
                  onClick={() => setPageIndex((i) => Math.min(pages.length - 1, i + 1))}
                  disabled={pageIndex === pages.length - 1}
                  className="rounded-xl border border-navy/15 px-4 py-2 font-semibold disabled:opacity-40"
                >
                  Next →
                </button>
                <button
                  type="button"
                  onClick={readAloud}
                  className="rounded-xl bg-navy px-4 py-2 font-semibold text-cream"
                >
                  Read Aloud
                </button>
                <Link
                  to="/new"
                  className="rounded-xl bg-gold px-4 py-2 font-semibold text-navy"
                >
                  Create New Story
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <div className="mt-8 rounded-2xl bg-white/5 p-6 text-cream/80">Loading pages…</div>
        )}
      </div>
    </div>
  )
}

