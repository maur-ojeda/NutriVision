import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Type definitions
interface AnalysisRequest {
  image_url: string;
}

interface AnalysisResponse {
  food: string;
  calories: number;
  macros: {
    protein: number;  // grams
    carbs: number;    // grams
    fat: number;      // grams
  };
}

function isValidAnalysis(value: unknown): value is AnalysisResponse {
  if (typeof value !== 'object' || value === null) return false;
  const v = value as Record<string, unknown>;
  if (typeof v.food !== 'string' || typeof v.calories !== 'number' || !Number.isFinite(v.calories)) {
    return false;
  }
  if (typeof v.macros !== 'object' || v.macros === null) return false;
  const m = v.macros as Record<string, unknown>;
  return ['protein', 'carbs', 'fat'].every((key) => typeof m[key] === 'number' && Number.isFinite(m[key]));
}

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // 1. Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: CORS_HEADERS });
  }

  // 2. Verify JWT token from Supabase Auth
  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
    return new Response('Missing authorization header', { status: 401, headers: CORS_HEADERS });
  }

  const supabaseClient = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    { global: { headers: { Authorization: authHeader } } }
  );

  const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
  if (authError || !user) {
    console.error('Auth error:', authError);
    return new Response('Unauthorized', { status: 401, headers: CORS_HEADERS });
  }

  // 3. Parse request body
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405, headers: CORS_HEADERS });
  }

  let body: AnalysisRequest;
  try {
    body = await req.json();
  } catch (_error) {
    console.error('JSON parse error:', _error);
    return new Response('Invalid JSON body', { status: 400, headers: CORS_HEADERS });
  }

  if (!body.image_url) {
    return new Response('Missing image_url parameter', { status: 400, headers: CORS_HEADERS });
  }

  // 4. Download image from Supabase Storage
  let imageBase64: string;
  let imageMimeType = 'image/jpeg';
  try {
    console.log('Downloading image from:', body.image_url);
    const imageResponse = await fetch(body.image_url);
    if (!imageResponse.ok) {
      return new Response('Failed to download image', { status: 400, headers: CORS_HEADERS });
    }
    imageMimeType = imageResponse.headers.get('content-type')?.split(';')[0] || imageMimeType;
    const imageBuffer = await imageResponse.arrayBuffer();
    imageBase64 = btoa(String.fromCharCode(...new Uint8Array(imageBuffer)));
  } catch (error) {
    console.error('Image download error:', error);
    return new Response('Failed to process image', { status: 500, headers: CORS_HEADERS });
  }

  // 5. Call NVIDIA Build API (llama-3.2-90b-vision-instruct)
  const nvidiaApiKey = Deno.env.get('NVIDIA_API_KEY');
  if (!nvidiaApiKey) {
    console.error('Missing NVIDIA_API_KEY environment variable');
    return new Response('Server configuration error', { status: 500, headers: CORS_HEADERS });
  }

  const systemPrompt = `Actúa como un nutricionista experto en estimación visual. Analiza la imagen y devuelve un JSON con: nombre del plato, peso estimado en gramos, calorías, proteínas, carbohidratos y grasas. Si hay ingredientes invisibles (aceite, sal), estímalos según el brillo y tipo de cocción. Formato: {"food": string, "calories": number, "macros": {"protein": n, "carbs": n, "fat": n}}.`;

  try {
    console.log('Calling NVIDIA Build API...');
    const nvidiaResponse = await fetch(
      'https://integrate.api.nvidia.com/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${nvidiaApiKey}`,
        },
        body: JSON.stringify({
          model: 'meta/llama-3.2-90b-vision-instruct',
          messages: [{
            role: 'user',
            content: [
              { type: 'text', text: systemPrompt },
              {
                type: 'image_url',
                image_url: { url: `data:${imageMimeType};base64,${imageBase64}` }
              }
            ]
          }],
          max_tokens: 512,
          temperature: 0.2,
        })
      }
    );

    const nvidiaData = await nvidiaResponse.json();

    if (!nvidiaResponse.ok) {
      console.error('NVIDIA API error:', nvidiaData);
      return new Response(`NVIDIA API error: ${nvidiaData?.detail ?? nvidiaResponse.statusText}`, { status: 500, headers: CORS_HEADERS });
    }

    // 6. Parse JSON response
    const responseText = nvidiaData.choices?.[0]?.message?.content;
    if (!responseText) {
      console.error('No response text from NVIDIA API');
      return new Response('Failed to analyze image', { status: 500, headers: CORS_HEADERS });
    }

    // Extract JSON from response (model might wrap it in markdown)
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error('No JSON found in response:', responseText);
      return new Response('Failed to parse analysis', { status: 500, headers: CORS_HEADERS });
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(jsonMatch[0]);
    } catch (parseError) {
      console.error('JSON.parse error on NVIDIA output:', parseError, jsonMatch[0]);
      return new Response('El modelo devolvió un JSON inválido', { status: 502, headers: CORS_HEADERS });
    }

    if (!isValidAnalysis(parsed)) {
      console.error('NVIDIA output has unexpected shape:', parsed);
      return new Response('El modelo devolvió una respuesta con formato inesperado', { status: 502, headers: CORS_HEADERS });
    }

    const analysis: AnalysisResponse = parsed;

    // 7. Return JSON response
    return new Response(JSON.stringify(analysis), {
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('NVIDIA analysis error:', error);
    return new Response('Failed to analyze image', { status: 500, headers: CORS_HEADERS });
  }
});
