import { supabase } from './supabaseClient'
import type { NarrativeVoice, StoryLength, ThemeKey, StoryPage } from '../types/story'

type NewStoryInput = {
  childName: string
  childAge: number
  events: string
  theme: ThemeKey
  storyLength: StoryLength
  title: string
  narrativeVoice: NarrativeVoice
}

// This function creates a story row and returns its new id.
export async function createStory(input: NewStoryInput): Promise<string> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('You must be logged in to save a story.')

  const { data, error } = await supabase
    .from('stories')
    .insert({
      parent_id: user.id,
      child_name: input.childName,
      child_age: input.childAge,
      events: input.events,
      theme: input.theme,
      story_length: input.storyLength,
      title: input.title,
      narrative_voice: input.narrativeVoice,
    })
    .select('id')
    .single()

  if (error) throw new Error(error.message)
  return data.id as string
}

// This function saves each page (paragraph + image) for a story.
export async function saveStoryPages(storyId: string, pages: StoryPage[]) {
  const rows = pages.map((p) => ({
    story_id: storyId,
    page_number: p.pageNumber,
    paragraph_text: p.paragraph,
    image_url: p.imageUrl,
  }))

  const { error } = await supabase.from('story_pages').insert(rows)
  if (error) throw new Error(error.message)
}

// This function loads pages for one story, ordered like a book.
export async function loadStoryPages(storyId: string): Promise<StoryPage[]> {
  const { data, error } = await supabase
    .from('story_pages')
    .select('page_number, paragraph_text, image_url')
    .eq('story_id', storyId)
    .order('page_number', { ascending: true })

  if (error) throw new Error(error.message)

  return (data ?? []).map((r) => ({
    pageNumber: r.page_number as number,
    paragraph: r.paragraph_text as string,
    imageUrl: r.image_url as string,
  }))
}

// This function loads metadata (voice, language, etc.) for one story.
export async function loadStoryMeta(storyId: string): Promise<{ narrativeVoice: NarrativeVoice; title: string }> {
  const { data, error } = await supabase
    .from('stories')
    .select('narrative_voice, title')
    .eq('id', storyId)
    .single()

  if (error) throw new Error(error.message)
  return {
    narrativeVoice: (data.narrative_voice as NarrativeVoice) ?? 'Classic',
    title: (data.title as string) ?? 'My Story',
  }
}

// This function renames a story for the current parent.
export async function renameStory(storyId: string, title: string) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('You must be logged in.')

  const { error } = await supabase
    .from('stories')
    .update({ title })
    .eq('id', storyId)
    .eq('parent_id', user.id)

  if (error) throw new Error(error.message)
}

// This function deletes a story and its pages for the current parent.
export async function deleteStory(storyId: string) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('You must be logged in.')

  await supabase.from('story_pages').delete().eq('story_id', storyId)

  const { error } = await supabase
    .from('stories')
    .delete()
    .eq('id', storyId)
    .eq('parent_id', user.id)

  if (error) throw new Error(error.message)
}

// This function loads saved stories for the current parent.
export async function loadSavedStories() {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('You must be logged in.')

  const { data, error } = await supabase
    .from('stories')
    .select('id, title, created_at, theme')
    .eq('parent_id', user.id)
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)
  return data ?? []
}

