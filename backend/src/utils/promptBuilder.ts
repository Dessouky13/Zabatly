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
  'neo-classical':        'grand proportions, symmetry, columns, ornate moldings, marble, gilded accents, refined elegance',
  'classical':            'timeless elegance, symmetry, rich fabrics, ornate details, traditional hospitality, warm wood tones',
  'victorian':            'ornate woodwork, rich colors, heavy drapes, antique furniture, patterned wallpaper, opulent details',
  'japandi':              'Japanese minimalism meets Scandinavian warmth, wabi-sabi, muted tones, natural materials, serene simplicity',
  'scandinavian':         'warm natural woods, cozy textiles, white walls, hygge atmosphere, functional simplicity',
  'minimalist':           'extreme simplicity, only essential elements, monochromatic palette, zen-like calm, clean surfaces',
  'modern':               'clean lines, minimal clutter, neutral tones with bold accents, sleek furniture, open spaces',
  'contemporary':         'current design trends, fluid forms, mixed materials, neutral with pops of color, artful lighting',
  'industrial':           'exposed brick and concrete, metal fixtures, Edison bulbs, reclaimed wood, urban loft feel',
  'loft':                 'open floor plan, high ceilings, exposed ductwork, raw materials, urban sophistication, large windows',
  'bohemian':             'eclectic layering, natural fibers, plants, global textiles, warm earthy palette, relaxed vibe',
  'coastal':              'light blues and whites, natural textures, driftwood, linen, airy and breezy beach atmosphere',
  'tropical':             'lush greenery, bold prints, rattan furniture, warm colors, indoor-outdoor living, exotic flair',
  'rustic':               'raw wood, stone, natural imperfections, warm earth tones, cozy cabin atmosphere, handcrafted charm',
  'farmhouse':            'shiplap walls, apron sinks, distressed wood, vintage accents, comfortable and lived-in charm',
  'art-deco':             'geometric patterns, luxe materials, bold colors, metallic accents, glamorous 1920s-inspired opulence',
  'hollywood-glam':       'dramatic luxury, velvet upholstery, mirrored surfaces, crystal chandeliers, bold statement pieces',
  'maximalist':           'bold patterns, vibrant colors, layered textures, curated collections, more-is-more philosophy',
  'mediterranean':        'terracotta tiles, wrought iron, warm earth tones, arched doorways, rustic yet elegant coastal charm',
  'moroccan':             'intricate tile work (zellige), carved wood, vibrant jewel tones, lanterns, rich textiles, exotic flair',
  'arabic-islamic':       'geometric patterns, arabesque motifs, arched doorways, mashrabiya screens, rich jewel tones, ornate calligraphy',
  'japanese-traditional': 'tatami mats, shoji screens, natural wood, minimalism, zen gardens, wabi-sabi aesthetic, paper lanterns',
  'transitional':         'blend of traditional and contemporary, neutral palette, classic shapes with modern finishes, balanced elegance',
  'modern-classic':       'updated traditional elements, sophisticated neutrals, tailored furniture, subtle luxury, timeless appeal',
  'eclectic':             'curated mix of styles and eras, personal expression, unexpected pairings, global influences, bold and unique',
  'retro':                'vintage mid-century elements, bold colors, nostalgic patterns, funky furniture, 60s-70s inspired playfulness',
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
