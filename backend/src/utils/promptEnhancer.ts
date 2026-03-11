/**
 * Prompt Enhancer — detects Arabic text, translates to English,
 * and enhances prompts for better AI image generation.
 *
 * Uses fal.ai any-llm with a cheap model for text processing.
 */

import { fal } from '@fal-ai/client';

const LLM_MODEL = process.env.FAL_LLM_MODEL || 'google/gemini-flash-1.5';

/**
 * Detects if text contains Arabic characters.
 */
function containsArabic(text: string): boolean {
  return /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/.test(text);
}

/**
 * Enhances a user prompt for better AI interior design image generation.
 * - Detects Arabic and translates to English
 * - Adds professional interior design language
 * - Optimized for Flux image generation
 */
export async function enhancePrompt(userPrompt: string): Promise<string> {
  if (!userPrompt?.trim()) return '';

  const isArabic = containsArabic(userPrompt);

  const systemPrompt = isArabic
    ? `You are a professional interior designer and translator. 
The user wrote their design request in Arabic. 
1. Translate it accurately to English
2. Enhance it into a professional interior design description suitable for AI image generation
3. Add specific design terminology (materials, lighting, textures, furniture styles)
4. Keep the user's original intent and preferences intact
Return ONLY the enhanced English prompt. No explanations, no quotes, just the prompt text.`
    : `You are a professional interior designer.
Enhance this user prompt into a professional interior design description suitable for AI image generation.
1. Keep the user's intent and preferences intact
2. Add specific design terminology (materials, lighting, textures, furniture styles)
3. Make it more descriptive and visual
4. Keep it concise (2-3 sentences max)
Return ONLY the enhanced prompt. No explanations, no quotes, just the prompt text.`;

  try {
    const result: any = await fal.subscribe('fal-ai/any-llm', {
      input: {
        model: LLM_MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
      },
    });

    const enhanced = result?.output?.trim();
    if (enhanced && enhanced.length > 5) {
      console.log(`[promptEnhancer] ${isArabic ? 'AR→EN' : 'Enhanced'}: "${userPrompt}" → "${enhanced}"`);
      return enhanced;
    }

    return userPrompt;
  } catch (err) {
    console.error('[promptEnhancer] Enhancement failed, using original prompt:', err);
    return userPrompt;
  }
}
