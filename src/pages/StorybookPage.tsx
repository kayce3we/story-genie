import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { loadStoryMeta, loadStoryPages } from '../lib/db'
import { callEdgeFunction } from '../lib/edgeFunctions'
import type { NarrativeVoice, StoryPage } from '../types/story'

// This screen renders the story as a simple "storybook" with page flipping.
export function StorybookPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [pages, setPages] = useState<StoryPage[]>([])
  const [pageIndex, setPageIndex] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [narrativeVoice, setNarrativeVoice] = useState<NarrativeVoice>('Classic')
  const [title, setTitle] = useState<string>('')
  const [readAloudState, setReadAloudState] = useState<'idle' | 'loading' | 'playing'>('idle')
  const audioCtxRef = useRef<AudioContext | null>(null)
  const audioSourceRef = useRef<AudioBufferSourceNode | null>(null)

  const current = pages[pageIndex]

  // Stop audio whenever the page changes.
  useEffect(() => { stopAudio() }, [pageIndex]) // eslint-disable-line react-hooks/exhaustive-deps

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
        const [p, meta] = await Promise.all([loadStoryPages(storyId), loadStoryMeta(storyId)])
        setPages(p)
        setNarrativeVoice(meta.narrativeVoice)
        setTitle(meta.title)
        setPageIndex(0)
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load story.')
      }
    }

    load()
  }, [id])

  // Stop any currently playing audio.
  function stopAudio() {
    try { audioSourceRef.current?.stop() } catch {}
    audioSourceRef.current = null
    audioCtxRef.current?.close().catch(() => {})
    audioCtxRef.current = null
    setReadAloudState('idle')
  }

  // This function reads the current page aloud using Google Cloud TTS Neural2.
  async function readAloud() {
    if (!current?.paragraph) return

    // If already playing, stop.
    if (readAloudState !== 'idle') {
      stopAudio()
      return
    }

    // Create and resume AudioContext synchronously within the user gesture.
    // Web Audio API stays unlocked on iOS even after async operations, unlike HTMLAudioElement.
    const ctx = new AudioContext()
    audioCtxRef.current = ctx
    ctx.resume() // Called synchronously — iOS registers the gesture here.

    try {
      setReadAloudState('loading')

      const isChinese = /[\u4e00-\u9fff]/.test(current.paragraph)
      const ttsPromise = callEdgeFunction<{ audioContent: string }>('text-to-speech', {
        text: current.paragraph,
        voice: narrativeVoice,
        isChinese,
      })
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Request timed out')), 20000)
      )
      const { audioContent } = await Promise.race([ttsPromise, timeoutPromise])

      // If the user navigated away while fetching, abort.
      if (audioCtxRef.current !== ctx) { ctx.close(); return }

      const bytes = Uint8Array.from(atob(audioContent), c => c.charCodeAt(0))
      const audioBuffer = await ctx.decodeAudioData(bytes.buffer.slice(0))

      if (audioCtxRef.current !== ctx) { ctx.close(); return }

      const source = ctx.createBufferSource()
      source.buffer = audioBuffer
      source.connect(ctx.destination)
      audioSourceRef.current = source
      source.onended = () => {
        audioCtxRef.current = null
        audioSourceRef.current = null
        ctx.close().catch(() => {})
        setReadAloudState('idle')
      }
      source.start(0)
      setReadAloudState('playing')
    } catch {
      if (audioCtxRef.current === ctx) {
        audioCtxRef.current = null
        ctx.close().catch(() => {})
      }
      setReadAloudState('idle')
    }
  }

  return (
    <div className="min-h-screen bg-navy pb-20 pt-16 text-cream">
      <div className="mx-auto max-w-4xl px-6 py-14">
        <div className="flex items-center justify-between gap-4">
          <h1 className="font-heading text-3xl font-bold">{title || 'My Story'}</h1>
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
              className="w-full rounded-2xl object-contain"
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
                  disabled={readAloudState === 'loading'}
                  className="rounded-xl bg-navy px-4 py-2 font-semibold text-cream disabled:opacity-60"
                >
                  {readAloudState === 'loading' ? 'Loading…' : readAloudState === 'playing' ? '⏹ Stop' : '🔊 Read Aloud'}
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

