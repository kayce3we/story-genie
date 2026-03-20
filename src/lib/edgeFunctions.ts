import { supabase } from './supabaseClient'

// This file contains tiny helper functions for calling Supabase Edge Functions.

type EdgeFunctionName = 'generate-story' | 'generate-illustrations' | 'text-to-speech'

// This function calls an Edge Function and returns JSON.
export async function callEdgeFunction<TResponse>(
  name: EdgeFunctionName,
  body: unknown,
): Promise<TResponse> {
  const { data, error } = await supabase.functions.invoke<TResponse>(name, { body: body as Record<string, unknown> })

  if (error) {
    // Try to extract the actual error body from the response
    const context = (error as unknown as { context?: Response }).context
    if (context) {
      const text = typeof context.text === 'function'
        ? await context.text().catch(() => error.message)
        : (typeof context === 'string' ? context : JSON.stringify(context) ?? error.message)
      throw new Error(`Edge Function "${name}" failed: ${context.status ?? ''} ${text}`)
    }
    throw new Error(`Edge Function "${name}" failed: ${error.message}`)
  }

  return data as TResponse
}

