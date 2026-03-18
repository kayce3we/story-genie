// Supabase Edge Function: generate-illustrations
// - Receives: { paragraphs: string[], theme: string, childName: string }
// - Calls DALL-E 3 in parallel (Promise.all)
// - Uploads images to Supabase Storage
// - Returns: { imageUrls: string[] }

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1'

type GenerateIllustrationsRequest = {
  paragraphs: string[]
  theme: string
  childName: string
}

function firstSentence(paragraph: string) {
  const trimmed = paragraph.trim()
  const dot = trimmed.indexOf('.')
  if (dot === -1) return trimmed
  return trimmed.slice(0, dot + 1)
}

function userIdFromAuthHeader(req: Request) {
  const auth = req.headers.get('authorization') ?? ''
  const token = auth.startsWith('Bearer ') ? auth.slice('Bearer '.length) : null
  if (!token) return null
  try {
    const payload = token.split('.')[1]
    const json = atob(payload.replace(/-/g, '+').replace(/_/g, '/'))
    const data = JSON.parse(json)
    return (data.sub as string | undefined) ?? null
  } catch {
    return null
  }
}

function buildImagePrompt(theme: string, paragraph: string) {
  const scene = firstSentence(paragraph)
  return (
    `Children's storybook illustration in a warm, soft watercolor style. ` +
    `${theme} theme. Scene: ${scene} ` +
    `Child-friendly, dreamy, cozy bedtime storybook aesthetic. No text in image.`
  )
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const input = (await req.json()) as GenerateIllustrationsRequest

    const openaiKey = Deno.env.get('OPENAI_API_KEY')
    if (!openaiKey) {
      return new Response(JSON.stringify({ error: 'Missing OPENAI_API_KEY secret.' }), {
        status: 500,
        headers: { ...corsHeaders, 'content-type': 'application/json' },
      })
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    if (!supabaseUrl || !serviceRoleKey) {
      return new Response(
        JSON.stringify({ error: 'Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.' }),
        { status: 500, headers: { ...corsHeaders, 'content-type': 'application/json' } },
      )
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey)
    const userId = userIdFromAuthHeader(req) ?? 'anonymous'

    async function generateOne(paragraph: string, index: number) {
      const prompt = buildImagePrompt(input.theme, paragraph)

      const imgRes = await fetch('https://api.openai.com/v1/images/generations', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          authorization: `Bearer ${openaiKey}`,
        },
        body: JSON.stringify({
          model: 'dall-e-3',
          prompt,
          size: '1024x1024',
          quality: 'standard',
        }),
      })

      if (!imgRes.ok) {
        const text = await imgRes.text()
        throw new Error(`OpenAI image error: ${imgRes.status} ${text}`)
      }

      const imgData = await imgRes.json()
      const url = imgData?.data?.[0]?.url as string | undefined
      if (!url) throw new Error('OpenAI did not return an image URL.')

      const downloaded = await fetch(url)
      const bytes = new Uint8Array(await downloaded.arrayBuffer())

      const path = `illustrations/${userId}/${crypto.randomUUID()}-${index + 1}.png`

      const { error: uploadError } = await supabase.storage
        .from('storybook')
        .upload(path, bytes, { contentType: 'image/png', upsert: false })

      if (uploadError) throw new Error(uploadError.message)

      const { data: publicUrl } = supabase.storage.from('storybook').getPublicUrl(path)
      return publicUrl.publicUrl as string
    }

    const imageUrls = await Promise.all(input.paragraphs.map(generateOne))

    return new Response(JSON.stringify({ imageUrls }), {
      status: 200,
      headers: { ...corsHeaders, 'content-type': 'application/json' },
    })
  } catch (e) {
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'content-type': 'application/json' } },
    )
  }
})
