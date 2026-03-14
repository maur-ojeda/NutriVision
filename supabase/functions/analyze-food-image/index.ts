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

serve(async (req) => {
  // 1. Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'authorization, content-type',
      },
    });
  }

  // 2. Verify JWT token from Supabase Auth
  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
    return new Response('Missing authorization header', { status: 401 });
  }

  const supabaseClient = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    { global: { headers: { Authorization: authHeader } } }
  );

  const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
  if (authError || !user) {
    console.error('Auth error:', authError);
    return new Response('Unauthorized', { status: 401 });
  }

  // 3. Parse request body
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  let body: AnalysisRequest;
  try {
    body = await req.json();
  } catch (_error) {
    console.error('JSON parse error:', _error);
    return new Response('Invalid JSON body', { status: 400 });
  }

  if (!body.image_url) {
    return new Response('Missing image_url parameter', { status: 400 });
  }

  // 4. Download image from Supabase Storage
  let imageBase64: string;
  try {
    console.log('Downloading image from:', body.image_url);
    const imageResponse = await fetch(body.image_url);
    if (!imageResponse.ok) {
      return new Response('Failed to download image', { status: 400 });
    }
    const imageBuffer = await imageResponse.arrayBuffer();
    imageBase64 = btoa(String.fromCharCode(...new Uint8Array(imageBuffer)));
  } catch (error) {
    console.error('Image download error:', error);
    return new Response('Failed to process image', { status: 500 });
  }

  // 5. Call Gemini 1.5 Flash API
  const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
  if (!geminiApiKey) {
    console.error('Missing GEMINI_API_KEY environment variable');
    return new Response('Server configuration error', { status: 500 });
  }

  const systemPrompt = `Actúa como un nutricionista experto en estimación visual. Analiza la imagen y devuelve un JSON con: nombre del plato, peso estimado en gramos, calorías, proteínas, carbohidratos y grasas. Si hay ingredientes invisibles (aceite, sal), estímalos según el brillo y tipo de cocción. Formato: {"food": string, "calories": number, "macros": {"p": n, "c": n, "f": n}}.`;

  try {
    console.log('Calling Gemini API...');
    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            role: 'user',
            parts: [
              { text: systemPrompt },
              {
                inline_data: {
                  mime_type: 'image/jpeg',
                  data: imageBase64
                }
              }
            ]
          }]
        })
      }
    );

    const geminiData = await geminiResponse.json();

    if (geminiData.error) {
      console.error('Gemini API error:', geminiData.error);
      return new Response(`Gemini API error: ${geminiData.error.message}`, { status: 500 });
    }

    // 6. Parse JSON response
    const responseText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!responseText) {
      console.error('No response text from Gemini');
      return new Response('Failed to analyze image', { status: 500 });
    }

    // Extract JSON from response (Gemini might wrap it in markdown)
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error('No JSON found in response:', responseText);
      return new Response('Failed to parse analysis', { status: 500 });
    }

    const analysis: AnalysisResponse = JSON.parse(jsonMatch[0]);

    // 7. Return JSON response
    return new Response(JSON.stringify(analysis), {
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Gemini analysis error:', error);
    return new Response('Failed to analyze image', { status: 500 });
  }
});
