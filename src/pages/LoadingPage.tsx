import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { callEdgeFunction } from '../lib/edgeFunctions'
import { createStory, saveStoryPages } from '../lib/db'
import type { NarrativeVoice, StoryLanguage, StoryLength, ThemeKey, StoryPage } from '../types/story'

type LoadingState = {
  childName: string
  childAge: number
  events: string
  theme: ThemeKey
  length: StoryLength
  language: StoryLanguage
  voice: NarrativeVoice
  photoFiles: File[]
}

type PhotoData = { data: string; mediaType: string }

function fileToBase64(file: File): Promise<PhotoData> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result as string
      resolve({ data: result.split(',')[1], mediaType: file.type || 'image/jpeg' })
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
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

        const photos: PhotoData[] = await Promise.all((i.photoFiles ?? []).map(fileToBase64))

        const storyRes = await callEdgeFunction<GenerateStoryResponse>('generate-story', {
          name: i.childName,
          age: i.childAge,
          events: i.events,
          theme: i.theme,
          length: i.length,
          language: i.language ?? 'English',
          voice: i.voice ?? 'Classic',
          photos,
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

        const title = `${i.childName}'s ${i.theme} Story`
        const storyId = await createStory({
          childName: i.childName,
          childAge: i.childAge,
          events: i.events,
          theme: i.theme,
          storyLength: i.length,
          title,
          narrativeVoice: i.voice ?? 'Classic',
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

  const steps = [
    { label: 'Writing your story', done: stage > 1, active: stage === 1 },
    { label: 'Painting illustrations', done: false, active: stage === 2 },
    { label: 'Saving to your library', done: false, active: false },
  ]

  return (
    <div className="min-h-screen bg-navy text-cream">
      <div className="mx-auto max-w-md px-6 py-16">

        {/* Lamp + title */}
        <div className="text-center">
          <div className="text-7xl animate-bounce">🪔</div>
          <h1 className="mt-6 font-heading text-3xl font-bold">Summoning your story…</h1>
          <p className="mt-2 text-cream/60 text-sm">{stageText}</p>
        </div>

        {/* Step indicators */}
        <div className="mt-10 flex flex-col gap-3">
          {steps.map((step, i) => (
            <div
              key={i}
              className={[
                'flex items-center gap-4 rounded-2xl px-5 py-4 transition-all',
                step.active ? 'bg-gold/15 ring-1 ring-gold/40' : 'bg-white/5',
              ].join(' ')}
            >
              <div className={[
                'flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold',
                step.done ? 'bg-green-500 text-white' : step.active ? 'bg-gold text-navy' : 'bg-white/10 text-cream/30',
              ].join(' ')}>
                {step.done ? '✓' : i + 1}
              </div>
              <div className={['font-semibold text-sm', step.active ? 'text-cream' : step.done ? 'text-cream/50' : 'text-cream/30'].join(' ')}>
                {step.label}
              </div>
              {step.active && (
                <div className="ml-auto flex gap-1">
                  {[0, 1, 2].map((d) => (
                    <div
                      key={d}
                      className="h-2 w-2 rounded-full bg-gold animate-bounce"
                      style={{ animationDelay: `${d * 0.15}s` }}
                    />
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Illustration progress bar (stage 2 only) */}
        {stage === 2 && (
          <div className="mt-6 rounded-2xl bg-white/5 p-5">
            <div className="flex items-center justify-between text-sm text-cream/70 mb-3">
              <span>Illustration {Math.min(doneCount + 1, totalCount)} of {totalCount}</span>
              <span className="font-semibold text-gold">{percent}%</span>
            </div>
            <div className="h-2 w-full rounded-full bg-white/10">
              <div
                className="h-2 rounded-full bg-gold transition-all duration-500"
                style={{ width: `${percent}%` }}
              />
            </div>
          </div>
        )}

        {error ? (
          <div className="mt-6 rounded-2xl bg-red-500/20 p-5 text-sm">
            <div className="font-semibold">Oops — generation failed</div>
            {error.includes('401') || error.includes('Invalid JWT') ? (
              <>
                <div className="mt-1 opacity-90">Your session has expired. Please sign in again to continue.</div>
                <button
                  type="button"
                  onClick={() => navigate('/auth')}
                  className="mt-4 rounded-xl bg-gold px-4 py-2 font-semibold text-navy"
                >
                  Sign in again
                </button>
              </>
            ) : (
              <>
                <div className="mt-1 opacity-90">{error}</div>
                <button
                  type="button"
                  onClick={() => navigate('/new')}
                  className="mt-4 rounded-xl bg-gold px-4 py-2 font-semibold text-navy"
                >
                  Back to form
                </button>
              </>
            )}
          </div>
        ) : null}
      </div>
    </div>
  )
}

