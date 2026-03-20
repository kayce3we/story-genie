// Supabase Edge Function: text-to-speech
// - Receives: { text, voice, isChinese }
// - Calls Google Cloud Text-to-Speech Neural2
// - Returns: { audioContent } (base64-encoded MP3)

type TTSRequest = {
  text: string
  voice: string
  isChinese: boolean
}

type VoiceConfig = {
  name: string
  languageCode: string
  speakingRate: number
  pitch: number
}

const EN_VOICES: Record<string, VoiceConfig> = {
  Classic:   { name: 'en-US-Neural2-F', languageCode: 'en-US', speakingRate: 0.95, pitch: 0.0  },
  Whimsical: { name: 'en-US-Neural2-G', languageCode: 'en-US', speakingRate: 1.05, pitch: 2.0  },
  Epic:      { name: 'en-US-Neural2-D', languageCode: 'en-US', speakingRate: 0.82, pitch: -3.0 },
  Cozy:      { name: 'en-US-Neural2-H', languageCode: 'en-US', speakingRate: 0.80, pitch: -1.0 },
  Funny:     { name: 'en-US-Neural2-A', languageCode: 'en-US', speakingRate: 1.10, pitch: 3.0  },
}

const ZH_VOICES: Record<string, VoiceConfig> = {
  Classic:   { name: 'zh-CN-Neural2-A', languageCode: 'zh-CN', speakingRate: 0.95, pitch: 0.0  },
  Whimsical: { name: 'zh-CN-Neural2-C', languageCode: 'zh-CN', speakingRate: 1.05, pitch: 2.0  },
  Epic:      { name: 'zh-CN-Neural2-B', languageCode: 'zh-CN', speakingRate: 0.82, pitch: -3.0 },
  Cozy:      { name: 'zh-CN-Neural2-A', languageCode: 'zh-CN', speakingRate: 0.80, pitch: -1.0 },
  Funny:     { name: 'zh-CN-Neural2-D', languageCode: 'zh-CN', speakingRate: 1.10, pitch: 3.0  },
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
    const { text, voice, isChinese } = (await req.json()) as TTSRequest

    const apiKey = Deno.env.get('GOOGLE_TTS_API_KEY')
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'Missing GOOGLE_TTS_API_KEY secret.' }), {
        status: 500,
        headers: { ...corsHeaders, 'content-type': 'application/json' },
      })
    }

    const voiceMap = isChinese ? ZH_VOICES : EN_VOICES
    const config: VoiceConfig = voiceMap[voice] ?? voiceMap['Classic']

    const res = await fetch(
      `https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          input: { text },
          voice: { languageCode: config.languageCode, name: config.name },
          audioConfig: {
            audioEncoding: 'MP3',
            speakingRate: config.speakingRate,
            pitch: config.pitch,
          },
        }),
      },
    )

    if (!res.ok) {
      const text = await res.text()
      return new Response(JSON.stringify({ error: `Google TTS error: ${res.status} ${text}` }), {
        status: 500,
        headers: { ...corsHeaders, 'content-type': 'application/json' },
      })
    }

    const data = await res.json()

    return new Response(JSON.stringify({ audioContent: data.audioContent }), {
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
