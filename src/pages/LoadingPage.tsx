import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { callEdgeFunction } from '../lib/edgeFunctions'
import { createStory, saveStoryPages } from '../lib/db'
import type { StoryLanguage, StoryLength, ThemeKey, StoryPage } from '../types/story'

type LoadingState = {
  childName: string
  childAge: number
  events: string
  theme: ThemeKey
  length: StoryLength
  language: StoryLanguage
  photoFile: File | null
}

type GenerateStoryResponse = { storyText: string }
type GenerateIllustrationsResponse = { imageUrls: string[] }

// This screen runs the full generation flow, then redirects to the storybook.
export function LoadingPage() {
  const location = useLocation()
  const navigate = useNavigate()

  const input = location.state as LoadingState | null

  const [stage, setStage] = useState<1 | 2>(1)
  const [error, setError] = useState<string | null>(null)
  const [doneCount, setDoneCount] = useState(0)
  const [totalCount, setTotalCount] = useState(5)

  const stageText = useMemo(() => {
    return stage === 1 ? 'Your genie is writing your story…' : 'Now painting your illustrations…'
  }, [stage])

  // This helper turns the Claude story into an array of paragraphs.
  function splitParagraphs(storyText: string) {
    return storyText
      .split('\n---\n')
      .map((p) => p.trim())
      .filter(Boolean)
  }

  // This effect starts generation once when we arrive on this page.
  useEffect(() => {
    if (!input) {
      navigate('/new', { replace: true })
      return
    }
    const i = input

    // This function runs the full flow:
    // 1) Claude for text
    // 2) DALL-E for images (parallel)
    // 3) Save to database
    async function run() {
      try {
        setError(null)
        setStage(1)

        const storyRes = await callEdgeFunction<GenerateStoryResponse>('generate-story', {
          name: i.childName,
          age: i.childAge,
          events: i.events,
          theme: i.theme,
          length: i.length,
          language: i.language ?? 'English',
        })

        const paragraphs = splitParagraphs(storyRes.storyText)
        setTotalCount(paragraphs.length)

        setStage(2)
        setDoneCount(0)

        // We ask the illustration function for ALL images at once.
        const illRes = await callEdgeFunction<GenerateIllustrationsResponse>('generate-illustrations', {
          childName: i.childName,
          theme: i.theme,
          paragraphs,
        })

        // We can't see progress inside the edge function, so we update progress once at the end.
        setDoneCount(paragraphs.length)

        const pages: StoryPage[] = paragraphs.map((p, idx) => ({
          pageNumber: idx + 1,
          paragraph: p,
          imageUrl: illRes.imageUrls[idx],
        }))

        const title = `${i.childName}’s ${i.theme} Story`
        const storyId = await createStory({
          childName: i.childName,
          childAge: i.childAge,
          events: i.events,
          theme: i.theme,
          storyLength: i.length,
          title,
        })

        await saveStoryPages(storyId, pages)

        navigate(`/story/${storyId}`, { replace: true })
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Something went wrong.')
      }
    }

    run()
  }, [input, navigate])

  const percent = totalCount === 0 ? 0 : Math.round((doneCount / totalCount) * 100)

  return (
    <div className="min-h-screen bg-navy text-cream">
      <div className="mx-auto max-w-3xl px-6 py-14">
        <div className="text-center">
          <div className="mx-auto text-6xl">🪔</div>
          <h1 className="mt-6 font-heading text-3xl font-bold">Summoning your story…</h1>
          <p className="mt-3 text-cream/80">{stageText}</p>
        </div>

        <div className="mt-10 rounded-2xl bg-white/5 p-6">
          <div className="flex items-center justify-between text-sm text-cream/80">
            <div>
              Painting illustration {Math.min(doneCount + (stage === 2 ? 1 : 0), totalCount)} of{' '}
              {totalCount}…
            </div>
            <div>{percent}%</div>
          </div>

          <div className="mt-3 h-3 w-full rounded-full bg-white/10">
            <div
              className="h-3 rounded-full bg-gold transition-all"
              style={{ width: `${percent}%` }}
            />
          </div>

          {error ? (
            <div className="mt-5 rounded-xl bg-red-500/20 p-4 text-sm">
              <div className="font-semibold">Oops — generation failed</div>
              <div className="mt-1 opacity-90">{error}</div>
              <button
                type="button"
                onClick={() => navigate('/new')}
                className="mt-4 rounded-xl bg-gold px-4 py-2 font-semibold text-navy"
              >
                Back to form
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}

