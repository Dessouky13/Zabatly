/**
 * Builds AI prompts for mood board generation and room redesign.
 * All prompts are optimized for Egyptian home aesthetic.
 */

export interface MoodBoardParams {
  roomType: string;
  style: string;
  colorPreference: string;
  customPrompt?: string;
}

export interface RedesignParams {
  style: string;
  roomType?: string;
}

const STYLE_DESCRIPTIONS: Record<string, string> = {
  modern:       'clean lines, minimal clutter, neutral tones with bold accents, sleek furniture',
  scandinavian: 'warm natural woods, cozy textiles, white walls, hygge atmosphere, functional simplicity',
  minimal:      'extreme simplicity, only essential elements, monochromatic palette, zen-like calm',
  industrial:   'exposed brick and concrete, metal fixtures, Edison bulbs, reclaimed wood, urban loft feel',
  boho:         'eclectic layering, natural fibers, plants, global textiles, warm earthy palette, relaxed vibe',
  classic:      'timeless elegance, symmetry, rich fabrics, ornate details, traditional Egyptian hospitality',
  luxury:       'premium materials, marble surfaces, gold accents, statement furniture, opulent atmosphere',
};

/**
 * Builds the image generation prompt for mood board creation.
 */
export function buildMoodBoardPrompt(params: MoodBoardParams): string {
  const styleDesc = STYLE_DESCRIPTIONS[params.style.toLowerCase()] || params.style;
  const customPart = params.customPrompt?.trim()
    ? `\nAdditional requirements: ${params.customPrompt.trim()}`
    : '';

  return `Create a photorealistic, editorial-quality interior design mood board image for a ${params.roomType}.

Style: ${params.style} — ${styleDesc}
Color palette: Dominated by ${params.colorPreference} tones.
Aesthetic: Egyptian home, warm lighting, premium quality, magazine-worthy.${customPart}

The image should feel aspirational yet achievable. Show the space with carefully curated furniture, textiles, and decorative elements. Natural light, beautiful shadows, high-end photography style.`;
}

/**
 * Builds the GPT-4o prompt for generating structured design metadata (colors, materials, furniture).
 */
export function buildMetadataPrompt(params: MoodBoardParams): string {
  return `You are an expert interior designer specializing in Egyptian home aesthetics.
Based on this design concept, generate structured design metadata as JSON.

Room: ${params.roomType}
Style: ${params.style}
Color preference: ${params.colorPreference}
${params.customPrompt ? `Additional notes: ${params.customPrompt}` : ''}

Return ONLY valid JSON (no markdown, no explanation) with this exact structure:
{
  "color_palette": [
    {"hex": "#RRGGBB", "name": "Color Name", "role": "primary|secondary|accent|neutral"}
  ],
  "materials": ["Material 1", "Material 2", "Material 3", "Material 4"],
  "furniture_suggestions": [
    {"item": "Item Name", "description": "Brief description", "material": "Main material"}
  ],
  "design_notes": "2-3 sentences describing the overall vision"
}

Provide 5 colors, 4-6 materials, and 4-6 furniture pieces.`;
}

/**
 * Builds the room redesign prompt.
 */
export function buildRedesignPrompt(params: RedesignParams): string {
  const styleDesc = STYLE_DESCRIPTIONS[params.style.toLowerCase()] || params.style;
  const roomPart = params.roomType ? `This is a ${params.roomType}. ` : '';

  return `Transform this room photo into a ${params.style} style interior design.

${roomPart}Style characteristics: ${styleDesc}

Requirements:
- Preserve the room's architectural structure (walls, windows, doors, ceiling height)
- Replace all furniture and decor with ${params.style} style equivalents
- Apply appropriate lighting, color palette, and textures
- Make it look like a professional Egyptian home renovation
- Photorealistic, high-quality result
- Warm, inviting atmosphere

The final image should look like a real photograph, not a render.`;
}
