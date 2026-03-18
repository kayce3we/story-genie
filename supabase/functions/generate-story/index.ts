// Supabase Edge Function: generate-story
// - Receives: { name, age, events, theme, length }
// - Returns:  { storyText } where paragraphs are separated by "\n---\n"

type GenerateStoryRequest = {
  name: string
  age: number
  events: string
  theme: string
  length: string
}

// This function builds the Claude prompts exactly once in one place.
function buildPrompts(input: GenerateStoryRequest) {
  const system =
    `You are Story Genie, a warm and imaginative children's storyteller. ` +
    `Create personalized bedtime stories that feel magical, safe, and deeply personal to each child. ` +
    `Always use age-appropriate language. Weave the day's real events naturally into the heart of the story. ` +
    `Structure: warm opening → adventure → calm, sleepy resolution. ` +
    `End every story with the child drifting off to sleep feeling happy and safe. ` +
    `Write exactly 5 paragraphs. Separate each paragraph with --- on its own line. ` +
    `Never include scary, violent, or inappropriate content.`

  const user =
    `Create a ${input.theme} bedtime story for ${input.name}, age ${input.age}. ` +
    `Today's events: ${input.events}. ` +
    `Story length: ${input.length}.`

  return { system, user }
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

    const { system, user } = buildPrompts(input)

    const anthropicKey = Deno.env.get('ANTHROPIC_API_KEY')
    if (!anthropicKey) {
      return new Response(JSON.stringify({ error: 'Missing ANTHROPIC_API_KEY secret.' }), {
        status: 500,
        headers: { ...corsHeaders, 'content-type': 'application/json' },
      })
    }

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
        messages: [{ role: 'user', content: user }],
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

