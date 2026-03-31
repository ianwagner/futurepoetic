import { NextResponse } from 'next/server';
import { createClient } from '@sanity/client';
import Anthropic from '@anthropic-ai/sdk';

const sanityClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  apiVersion: '2024-01-01',
  token: process.env.SANITY_WRITE_TOKEN,
  useCdn: false,
});

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const CONCEPT_PROMPT = `You are a generative design engine for an experimental UI laboratory called "Plastic."

Your job: invent ONE interface concept that has never existed. Not a redesign of something common — something genuinely new.

IMPORTANT: Vary wildly across domains. Do NOT default to emotions, conversations, or feelings. Rotate through these territories:
- Physical/material: interfaces for rust, crystal growth, erosion, fermentation, glass blowing, tectonic drift, weather inside a jar
- Spatial/architectural: a floor plan that breathes, a room that rearranges itself based on who's in it, a staircase that goes somewhere different each time
- Biological/organic: a dashboard for a single cell dividing, a progress bar made of roots, a notification system based on pheromones
- Temporal/historical: a scrubber for deep time, a calendar for civilizations, a version history of a coastline
- Sonic/musical: a mixing board for city noise, a waveform editor for silence, a synthesizer controlled by architecture
- Linguistic/textual: a text editor where words have weight and fall, a dictionary that forgets, a search engine for things that don't have names
- Mathematical/abstract: a number line that curves, a graph of impossible functions, a topology editor for donuts becoming coffee cups
- Mechanical/industrial: a control panel for a machine that doesn't exist, a gauge cluster for measuring wonder, a factory floor for manufacturing shadows
- Astronomical/geological: an orbit designer for imaginary planets, a seismograph for arguments, a telescope that looks inward
- Social/systemic: a network graph of missed connections, a supply chain for rumors, a dashboard for the half-life of trends

Be specific. Be weird. Be poetic. The subtitle should make someone stop and think "wait, that's actually interesting."

Respond with ONLY valid JSON, no markdown fences:
{
  "title": "2-5 word evocative name",
  "subtitle": "One vivid sentence describing what it does or how it works",
  "tags": ["1-3 tags from: experimental, interaction, generative, spatial, temporal, sensory, linguistic, biological, philosophical, material, sonic, social, archival, impossible"],
  "accentColor": "hex color that fits the mood"
}`;

const VISUAL_STYLES = [
  'Brutalist — raw, exposed structure, monospaced type, thick borders, no decoration, concrete-digital aesthetic',
  'Bioluminescent — deep ocean darks with living, pulsing glows, organic shapes, things that breathe light',
  'Blueprint — technical drawing aesthetic, white/cyan lines on deep blue, grid paper, precise annotations, engineering diagrams',
  'Acid graphic — neon overload, clashing colors, glitch effects, distortion, rave poster energy, maximal',
  'Paper & ink — warm off-white backgrounds, hand-drawn line quality, sketch feel, watercolor washes, analog warmth',
  'Terminal — green/amber on black, scanline effects, monospace everything, CRT glow, retro computing',
  'Glassmorphism — frosted translucent panels, layered depth, soft refracted light, delicate and airy',
  'Topographic — contour lines, elevation data aesthetic, earth tones, cartographic precision, terrain visualization',
  'Darkroom — deep reds and blacks, photographic negative effects, chemical process aesthetic, light-sensitive',
  'Celestial — star fields, nebula gradients, cosmic scale, gravitational distortion, astronomical instrument aesthetic',
  'Woodblock — bold flat areas of color, visible texture, Japanese print influence, limited palette, striking composition',
  'Industrial — steel grays, warning stripes, gauge clusters, pressure readings, factory control panel aesthetic',
  'Botanical — intricate line drawings of organic forms, muted greens and earth tones, specimen catalog aesthetic',
  'Pixel art — chunky low-res pixels, limited 16-color palette, dithering patterns, 8-bit nostalgia',
  'Noir — high contrast black and white, dramatic shadows, venetian blind light, cinematic tension',
  'Membrane — translucent layers, cellular structure, things visible through other things, biological transparency',
  'Stained glass — bold black outlines, jewel-tone color fills, light passing through, cathedral geometry',
  'Oscilloscope — vector display aesthetic, Lissajous curves, phosphor green traces, waveform visualization',
];

const BUILD_PROMPT = `You are a master frontend engineer building experimental, interactive UI art pieces.

You will receive a concept (title + subtitle) and a visual style direction. Your job: build it as a single, self-contained HTML file.

Rules:
- Output ONLY the complete HTML document. No markdown fences, no explanation.
- The HTML must be fully self-contained — inline all CSS and JavaScript. No external dependencies or CDN links.
- COMMIT FULLY to the given visual style. Let it define the color palette, typography, texture, and overall feel. Do not default to generic dark-mode gradients.
- Use modern CSS (grid, flexbox, animations, gradients, filters, backdrop-filter, clip-path, etc.)
- Use vanilla JavaScript for interactivity (mouse tracking, click handlers, animations, canvas, Web Audio API, etc.)
- Make it INTERACTIVE — it should respond to mouse movement, clicks, scrolling, typing, or time
- The piece should feel alive, not static. Use requestAnimationFrame, CSS animations, or event-driven updates
- Fill the entire viewport. Use width: 100vw; height: 100vh; overflow: hidden on the body
- Typography should match the style — don't always default to clean sans-serif. Use monospace, serif, or stylized type when the style calls for it.
- The UI doesn't need to be "functional" in a practical sense — it's art. But it should be interactive and respond to the user
- Push the boundaries of what a browser can do. Use canvas, SVG, CSS transforms, blend modes, etc.
- Keep the code under 15KB total

Think of this as a digital art installation that happens to look like a UI.`;

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (
    process.env.CRON_SECRET &&
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const lastEntry = await sanityClient.fetch<{ dayNumber: number } | null>(
      `*[_type == "plastic"] | order(dayNumber desc) [0] { dayNumber }`
    );
    const nextDay = (lastEntry?.dayNumber ?? -1) + 1;

    const today = new Date().toISOString().split('T')[0];

    const existing = await sanityClient.fetch<{
      _id: string;
      htmlCode?: string;
    } | null>(
      `*[_type == "plastic" && date == $date][0] { _id, htmlCode }`,
      { date: today }
    );
    if (existing && existing.htmlCode) {
      return NextResponse.json({
        message: 'Already generated for today',
        date: today,
      });
    }
    // Delete incomplete entry if it exists
    if (existing) {
      await sanityClient.delete(existing._id);
    }

    // Step 1: Generate the concept
    const conceptMsg = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 300,
      system: CONCEPT_PROMPT,
      messages: [
        {
          role: 'user',
          content:
            'Generate one experimental UI concept for today. Make it something no one has ever thought of before.',
        },
      ],
    });

    const conceptText =
      conceptMsg.content[0].type === 'text' ? conceptMsg.content[0].text : '';
    const concept = JSON.parse(conceptText);

    // Step 2: Generate the actual UI with a random visual style
    const style =
      VISUAL_STYLES[Math.floor(Math.random() * VISUAL_STYLES.length)];
    const buildMsg = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 16000,
      system: BUILD_PROMPT,
      messages: [
        {
          role: 'user',
          content: `Build this concept:\n\nTitle: ${concept.title}\nDescription: ${concept.subtitle}\nAccent color: ${concept.accentColor}\n\nVisual style: ${style}\n\nCommit fully to this visual style. Make it interactive, visually rich, and completely self-contained.`,
        },
      ],
    });

    const htmlCode =
      buildMsg.content[0].type === 'text' ? buildMsg.content[0].text : '';

    // Write to Sanity
    const doc = await sanityClient.create({
      _type: 'plastic',
      title: concept.title,
      subtitle: concept.subtitle,
      date: today,
      dayNumber: nextDay,
      tags: concept.tags || [],
      accentColor: concept.accentColor || '#ffffff',
      htmlCode,
    });

    return NextResponse.json({
      success: true,
      entry: {
        id: doc._id,
        title: concept.title,
        subtitle: concept.subtitle,
        date: today,
        dayNumber: nextDay,
      },
    });
  } catch (error) {
    console.error('Plastic generation failed:', error);
    return NextResponse.json(
      { error: 'Generation failed', details: String(error) },
      { status: 500 }
    );
  }
}
