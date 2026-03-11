/**
 * AI Service — uses fal.ai for image generation and LLM tasks.
 *
 * Models:
 * - Image gen:       fal-ai/flux/schnell (~$0.003/image — cheapest)
 * - Image-to-image:  fal-ai/flux/dev/image-to-image (~$0.025/image)
 * - Text/metadata:   fal-ai/any-llm with Gemini Flash (cheap, reliable JSON)
 *
 * Cost per mood board:  ~$0.013 (4 images + metadata)  vs ~$0.17 (DALL-E 3)
 * Cost per redesign:    ~$0.075 (3 images)              vs ~$0.15 (DALL-E 2)
 */

import { fal } from '@fal-ai/client';
import { buildMoodBoardPrompt, buildMetadataPrompt, buildRedesignPrompt, type MoodBoardParams, type RedesignParams } from '../utils/promptBuilder.js';
import { enhancePrompt } from '../utils/promptEnhancer.js';

// Configure fal.ai credentials
fal.config({ credentials: process.env.FAL_KEY });

const LLM_MODEL = process.env.FAL_LLM_MODEL || 'google/gemini-flash-1.5';

export interface GeneratedMoodBoard {
  images: string[];         // fal.ai CDN image URLs (temporary — re-upload to local storage)
  color_palette: object[];
  materials: string[];
  furniture_suggestions: object[];
  design_notes: string;
}

export interface GeneratedRedesign {
  images: string[];         // Redesigned room image URLs
}

/**
 * Generates a mood board using Flux Schnell for images and Gemini for metadata.
 * Generates 4 images per mood board.
 */
export async function generateMoodBoard(params: MoodBoardParams): Promise<GeneratedMoodBoard> {
  // Enhance the user's custom prompt (handles Arabic → English translation)
  if (params.customPrompt) {
    params.customPrompt = await enhancePrompt(params.customPrompt);
  }

  const imagePrompt = buildMoodBoardPrompt(params);
  const metadataPrompt = buildMetadataPrompt(params);

  // Generate 4 images in parallel using Flux Schnell (cheapest: ~$0.003/image)
  const imagePromises = Array.from({ length: 4 }, () =>
    fal.subscribe('fal-ai/flux/schnell', {
      input: {
        prompt: imagePrompt,
        image_size: 'landscape_4_3' as const,
        num_images: 1,
        num_inference_steps: 4,
        enable_safety_checker: false,
      },
    })
  );

  // Generate metadata concurrently with images
  const metadataPromise = fal.subscribe('fal-ai/any-llm', {
    input: {
      model: LLM_MODEL,
      messages: [
        { role: 'system', content: 'You are an expert interior designer. Return ONLY valid JSON, no markdown formatting.' },
        { role: 'user', content: metadataPrompt },
      ],
    },
  });

  const [imageResults, metadataResult] = await Promise.all([
    Promise.all(imagePromises),
    metadataPromise,
  ]);

  const images = imageResults
    .map((r: any) => r?.images?.[0]?.url)
    .filter((url: string | undefined): url is string => !!url);

  let metadata: any = { color_palette: [], materials: [], furniture_suggestions: [], design_notes: '' };
  try {
    const raw = (metadataResult as any)?.output;
    if (raw) {
      // Strip markdown code blocks if LLM wraps in ```json
      const cleaned = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      metadata = JSON.parse(cleaned);
    }
  } catch {
    console.error('[aiService] Failed to parse metadata JSON');
  }

  return {
    images,
    color_palette: metadata.color_palette || [],
    materials: metadata.materials || [],
    furniture_suggestions: metadata.furniture_suggestions || [],
    design_notes: metadata.design_notes || '',
  };
}

/**
 * Generates room redesign variations using Flux Dev image-to-image.
 * Accepts a Buffer of the room image and returns 3 redesigned versions.
 */
export async function generateRoomRedesign(
  imageBuffer: Buffer,
  params: RedesignParams
): Promise<GeneratedRedesign> {
  const prompt = buildRedesignPrompt(params);

  // Upload image to fal.ai temporary storage
  const blob = new Blob([imageBuffer], { type: 'image/jpeg' });
  const file = new File([blob], 'room.jpg', { type: 'image/jpeg' });
  const uploadedUrl = await fal.storage.upload(file);

  // Generate 3 variations using Flux Dev image-to-image
  // strength 0.75 = preserve room structure but change style significantly
  const results = await Promise.all(
    Array.from({ length: 3 }, () =>
      fal.subscribe('fal-ai/flux/dev/image-to-image', {
        input: {
          prompt,
          image_url: uploadedUrl,
          strength: 0.75,
          num_inference_steps: 28,
          num_images: 1,
          guidance_scale: 3.5,
        },
      })
    )
  );

  const images = results
    .map((r: any) => r?.images?.[0]?.url)
    .filter((url: string | undefined): url is string => !!url);

  return { images };
}
