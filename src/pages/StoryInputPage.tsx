import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { THEMES, VOICES, type NarrativeVoice, type StoryLanguage, type StoryLength, type ThemeKey } from '../types/story'

type StoryInputState = {
  childName: string
  childAge: number
  events: string
  theme: ThemeKey
  length: StoryLength
  language: StoryLanguage
  voice: NarrativeVoice
  photoFiles: File[]
}

const STORAGE_KEY = 'story-genie:form'

function loadSaved(): Partial<StoryInputState> {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}') } catch { return {} }
}

function saveDraft(patch: Partial<StoryInputState>) {
  try {
    const current = loadSaved()
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...current, ...patch }))
  } catch {}
}

// This screen collects the details needed to generate a story.
export function StoryInputPage() {
  const navigate = useNavigate()
  const saved = useMemo(loadSaved, [])

  const [childName, setChildName] = useState(saved.childName ?? '')
  const [childAge, setChildAge] = useState<number>(saved.childAge ?? 6)
  const [events, setEvents] = useState(saved.events ?? '')
  const [theme, setTheme] = useState<ThemeKey>(saved.theme ?? 'Magical')
  const [length, setLength] = useState<StoryLength>(saved.length ?? 'Medium')
  const [language, setLanguage] = useState<StoryLanguage>(saved.language ?? 'English')
  const [voice, setVoice] = useState<NarrativeVoice>(saved.voice ?? 'Classic')
  const [photoFiles, setPhotoFiles] = useState<File[]>([])

  const canSubmit = useMemo(() => {
    return childName.trim().length > 0 && events.trim().length > 10 && childAge >= 2 && childAge <= 10
  }, [childName, events, childAge])

  // This function moves us to the loading screen with the form data.
  function onGrantStory() {
    localStorage.removeItem(STORAGE_KEY)
    const state: StoryInputState = { childName, childAge, events, theme, length, language, voice, photoFiles }
    navigate('/loading', { state })
  }

  return (
    <div className="min-h-screen bg-navy pb-20 text-cream">
      <div className="mx-auto max-w-3xl px-6 py-14">
        <h1 className="font-heading text-3xl font-bold">Create a new story</h1>

        <div className="mt-8 space-y-6 rounded-2xl bg-white/5 p-6">
          <label className="block">
            <div className="mb-2 text-sm text-cream/80">Child’s name</div>
            <input
              value={childName}
              onChange={(e) => { setChildName(e.target.value); saveDraft({ childName: e.target.value }) }}
              className="w-full rounded-xl bg-white/10 px-4 py-3 outline-none ring-1 ring-white/10 focus:ring-2 focus:ring-gold/80"
              placeholder="Ava"
            />
          </label>

          <label className="block">
            <div className="mb-2 text-sm text-cream/80">Child’s age (2–10)</div>
            <input
              value={childAge}
              onChange={(e) => { setChildAge(Number(e.target.value)); saveDraft({ childAge: Number(e.target.value) }) }}
              type="number"
              min={2}
              max={10}
              className="w-full rounded-xl bg-white/10 px-4 py-3 outline-none ring-1 ring-white/10 focus:ring-2 focus:ring-gold/80"
            />
          </label>

          <label className="block">
            <div className="mb-2 text-sm text-cream/80">Today’s events</div>
            <textarea
              value={events}
              onChange={(e) => { setEvents(e.target.value); saveDraft({ events: e.target.value }) }}
              rows={5}
              className="w-full resize-none rounded-xl bg-white/10 px-4 py-3 outline-none ring-1 ring-white/10 focus:ring-2 focus:ring-gold/80"
              placeholder='e.g. "lost a tooth, saw a rainbow, had pizza for dinner"'
            />
          </label>

          <div>
            <div className="mb-2 text-sm text-cream/80">Theme</div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {THEMES.map((t) => (
                <button
                  key={t.key}
                  type="button"
                  onClick={() => { setTheme(t.key); saveDraft({ theme: t.key }) }}
                  className={[
                    'rounded-xl px-3 py-3 text-left ring-1 transition',
                    theme === t.key
                      ? 'bg-gold text-navy ring-gold'
                      : 'bg-white/5 text-cream ring-white/10 hover:bg-white/10',
                  ].join(' ')}
                >
                  <div className="text-lg">
                    {t.emoji} <span className="font-semibold">{t.key}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="mb-2 text-sm text-cream/80">Story length</div>
            <div className="flex gap-3">
              {(['Short', 'Medium', 'Long'] as StoryLength[]).map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => { setLength(opt); saveDraft({ length: opt }) }}
                  className={[
                    'flex-1 rounded-xl px-4 py-3 font-semibold ring-1',
                    length === opt
                      ? 'bg-gold text-navy ring-gold'
                      : 'bg-white/5 text-cream ring-white/10 hover:bg-white/10',
                  ].join(' ')}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="mb-2 text-sm text-cream/80">Story language</div>
            <div className="flex gap-3">
              {(['English', 'Chinese'] as StoryLanguage[]).map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => { setLanguage(opt); saveDraft({ language: opt }) }}
                  className={[
                    'flex-1 rounded-xl px-4 py-3 font-semibold ring-1',
                    language === opt
                      ? 'bg-gold text-navy ring-gold'
                      : 'bg-white/5 text-cream ring-white/10 hover:bg-white/10',
                  ].join(' ')}
                >
                  {opt === 'English' ? '🇬🇧 English' : '🇨🇳 Chinese'}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="mb-2 text-sm text-cream/80">Narrative voice</div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
              {VOICES.map((v) => (
                <button
                  key={v.key}
                  type="button"
                  onClick={() => { setVoice(v.key); saveDraft({ voice: v.key }) }}
                  className={[
                    'rounded-xl px-3 py-3 text-left ring-1 transition',
                    voice === v.key
                      ? 'bg-gold text-navy ring-gold'
                      : 'bg-white/5 text-cream ring-white/10 hover:bg-white/10',
                  ].join(' ')}
                >
                  <div className="text-lg">{v.emoji}</div>
                  <div className="mt-1 font-semibold text-sm">{v.key}</div>
                  <div className={['text-xs mt-0.5', voice === v.key ? 'text-navy/70' : 'text-cream/50'].join(' ')}>
                    {v.description}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <label className="block">
            <div className="mb-2 text-sm text-cream/80">Optional photos (we'll weave them into the story)</div>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => setPhotoFiles(Array.from(e.target.files ?? []))}
              className="block w-full text-sm text-cream/80 file:mr-4 file:rounded-xl file:border-0 file:bg-white/10 file:px-4 file:py-2 file:font-semibold file:text-cream hover:file:bg-white/15"
            />
            {photoFiles.length > 0 ? (
              <div className="mt-2 text-xs text-cream/70">{photoFiles.map((f) => f.name).join(', ')}</div>
            ) : null}
          </label>

          <button
            type="button"
            disabled={!canSubmit}
            onClick={onGrantStory}
            className="w-full rounded-2xl bg-gold px-6 py-4 text-lg font-bold text-navy shadow-book disabled:opacity-50"
          >
            ✨ Grant My Story
          </button>
        </div>
      </div>
    </div>
  )
}

