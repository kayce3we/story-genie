// Supabase Edge Function: generate-story
// - Receives: { name, age, events, theme, length, language, voice, photos }
// - Returns:  { storyText } where paragraphs are separated by "\n---\n"

type PhotoData = { data: string; mediaType: string }

type GenerateStoryRequest = {
  name: string
  age: number
  events: string
  theme: string
  length: string
  language: string
  voice: string
  photos: PhotoData[]
}

const VOICE_INSTRUCTIONS: Record<string, string> = {
  Classic:
    'Tell the story in a warm, gentle, traditional bedtime storyteller voice — timeless and comforting.',
  Whimsical:
    'Tell the story with whimsy and playful magic — use vivid unexpected imagery, talking creatures, enchanted objects, and a sense of delightful surprise at every turn.',
  Epic:
    'Tell the story in a grand, epic narrator voice — the child is a true hero on a mighty quest. Use dramatic, inspiring language that makes every moment feel legendary.',
  Cozy:
    'Tell the story in an ultra-soothing, cozy voice — speak softly and slowly, with gentle imagery of warmth, comfort, and safety. Let every sentence ease the child toward sleep.',
  Funny:
    'Tell the story in a hilarious, comedic voice — pack it with silly jokes, absurd situations, fun wordplay, and laugh-out-loud moments that will delight a child.',
}

// This function builds the Claude prompts exactly once in one place.
function buildPrompts(input: GenerateStoryRequest) {
  const isChinese = input.language === 'Chinese'
  const voiceInstruction = VOICE_INSTRUCTIONS[input.voice] ?? VOICE_INSTRUCTIONS['Classic']

  const system =
    `You are a warm, playful storyteller speaking directly to a toddler. ` +
    `Write exactly how a fun parent or babysitter would sound reading aloud — natural, expressive, and full of life. Never sound formal or robotic. ` +
    `Use contractions always (it's, they're, couldn't, didn't). ` +
    `Vary sentence length — mix short punchy lines with longer flowing ones. ` +
    `Add natural spoken rhythm: "And you know what happened next?", "Oh my!". ` +
    `Use gentle sound words: whoosh, giggle, tiptoe, snuggle, pop! ` +
    `Never use stiff phrases like "the protagonist", "subsequently", or "therefore". ` +
    `Write like you're performing it, not reporting it. ` +
    `Weave the day's real events naturally into the heart of the story. ` +
    `Structure: warm opening → adventure → calm, sleepy resolution. ` +
    `End every story with the child drifting off to sleep feeling happy and safe. ` +
    `Write exactly 5 paragraphs. Separate each paragraph with --- on its own line. ` +
    `Never include scary, violent, or inappropriate content. ` +
    `${voiceInstruction} ` +
    (input.photos?.length > 0
      ? `Photos of the child or their world have been provided. Naturally incorporate what you observe — their appearance, surroundings, or any meaningful objects — into the story. `
      : '') +
    (isChinese ? `Write the entire story in Simplified Chinese.` : `Write the story in English.`)

  const userText =
    `Create a ${input.theme} bedtime story for ${input.name}, age ${input.age}. ` +
    `Today's events: ${input.events}. ` +
    `Story length: ${input.length}.`

  return { system, userText }
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// This function is the HTTP handler for the edge function.
Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const input = (await req.json()) as GenerateStoryRequest

    const { system, userText } = buildPrompts(input)

    const anthropicKey = Deno.env.get('ANTHROPIC_API_KEY')
    if (!anthropicKey) {
      return new Response(JSON.stringify({ error: 'Missing ANTHROPIC_API_KEY secret.' }), {
        status: 500,
        headers: { ...corsHeaders, 'content-type': 'application/json' },
      })
    }

    // Build user message content — images first, then the text prompt.
    type ContentBlock =
      | { type: 'text'; text: string }
      | { type: 'image'; source: { type: 'base64'; media_type: string; data: string } }

    const userContent: ContentBlock[] = [
      ...(input.photos ?? []).map((p) => ({
        type: 'image' as const,
        source: { type: 'base64' as const, media_type: p.mediaType, data: p.data },
      })),
      { type: 'text' as const, text: userText },
    ]

    // Call Claude Messages API.
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': anthropicKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 1200,
        system,
        messages: [{ role: 'user', content: userContent }],
      }),
    })

    if (!res.ok) {
      const text = await res.text()
      return new Response(JSON.stringify({ error: `Anthropic error: ${res.status} ${text}` }), {
        status: 500,
        headers: { ...corsHeaders, 'content-type': 'application/json' },
      })
    }

    const data = await res.json()
    const storyText = (data?.content?.[0]?.text ?? '').toString()

    return new Response(JSON.stringify({ storyText }), {
      status: 200,
      headers: { ...corsHeaders, 'content-type': 'application/json' },
    })
  } catch (e) {
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'content-type': 'application/json' },
    })
  }
})
