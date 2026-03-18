export type StoryLength = 'Short' | 'Medium' | 'Long'

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

