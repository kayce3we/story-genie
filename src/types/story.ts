export type StoryLength = 'Short' | 'Medium' | 'Long'

export type StoryLanguage = 'English' | 'Chinese'

export type NarrativeVoice = 'Classic' | 'Whimsical' | 'Epic' | 'Cozy' | 'Funny'

export type VoiceOption = { key: NarrativeVoice; emoji: string; description: string }

export const VOICES: VoiceOption[] = [
  { key: 'Classic', emoji: '📖', description: 'Warm & traditional' },
  { key: 'Whimsical', emoji: '🦄', description: 'Playful & magical' },
  { key: 'Epic', emoji: '⚔️', description: 'Grand & adventurous' },
  { key: 'Cozy', emoji: '🛋️', description: 'Soft & soothing' },
  { key: 'Funny', emoji: '😄', description: 'Silly & hilarious' },
]

export type ThemeKey =
  | 'Magical'
  | 'Animals'
  | 'Space'
  | 'Funny'
  | 'Ocean'
  | 'Superhero'
  | 'Fairy Tale'
  | 'Dinosaurs'

export type ThemeOption = { key: ThemeKey; emoji: string }

export const THEMES: ThemeOption[] = [
  { key: 'Magical', emoji: '✨' },
  { key: 'Animals', emoji: '🐾' },
  { key: 'Space', emoji: '🚀' },
  { key: 'Funny', emoji: '😂' },
  { key: 'Ocean', emoji: '🌊' },
  { key: 'Superhero', emoji: '🦸' },
  { key: 'Fairy Tale', emoji: '🧚' },
  { key: 'Dinosaurs', emoji: '🦕' },
]

export type StoryPage = {
  pageNumber: number
  paragraph: string
  imageUrl: string
}

