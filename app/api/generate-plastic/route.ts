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
  'Minimal and clean — white or near-black background, thin lines, lots of whitespace, understated. Let the interaction be the star.',
  'Warm and analog — soft creams, muted tones, subtle grain. Feels handmade but the behavior is digital.',
  'Cold and precise — monospace type, tight grids, cool grays and blues. Clinical but surprising.',
  'Neon on dark — black background, one or two vivid accent colors. Simple shapes, dramatic contrast.',
  'Playful and bright — bold primaries, rounded shapes, chunky type. Toylike but smart.',
  'Monochrome — one color only (plus black/white). All visual interest comes from layout and movement.',
];

const BUILD_PROMPT = `You build interactive web pieces where the BEHAVIOR is the point, not the visuals.

You'll receive a concept and a visual style. Build it as a single self-contained HTML file.

WHAT MATTERS — in order of importance:
1. BEHAVIOR. What does it DO? What happens when you interact? What surprises you? 90% of your effort goes here.
2. Interaction design. How does the user discover what's possible? Can they poke at it and find new things?
3. Visual style. Keep it simple and clean. The style should support the behavior, not compete with it.

THE BEHAVIOR SHOULD BE THE SHOW:
- Elements that have their own physics, desires, or rules
- Things that respond to the cursor, clicks, or keyboard in unexpected ways
- Systems where small inputs create disproportionate or chain-reaction outputs
- Emergent patterns from simple rules (boids, cellular automata, reaction-diffusion, gravity)
- UI elements that subvert expectations (buttons that flee, text that rearranges, forms that have opinions)
- Content that must be uncovered, chased, earned, or that disappears
- Things that evolve, grow, decay, or change state over time without user input

KEEP THE VISUALS SIMPLE:
- Clean layouts. No heavy texturing, no ornate borders, no decorative illustrations.
- Use the given style direction for color palette and typography, but don't overdesign.
- A plain div with fascinating behavior > a beautiful graphic that sits there.
- If you're spending more code on CSS than JavaScript, you're doing it wrong.

AVOID:
- Dashboards, control panels, sliders, knobs
- Static graphics, posters, illustrations with no real interaction
- Heavy visual themes that become the entire piece (woodblock prints, stained glass, etc.)
- Educational explainers or infographics
- Decorative animations with no user agency

Technical:
- Output ONLY the complete HTML. No markdown fences, no explanation.
- Self-contained — inline CSS and JS. No external dependencies.
- Responsive — works on desktop and mobile.
- Allow scrolling if needed.
- Vanilla JS. Use canvas, SVG, requestAnimationFrame where appropriate.
- Under 15KB.`;

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

    let htmlCode =
      buildMsg.content[0].type === 'text' ? buildMsg.content[0].text : '';
    // Strip markdown fences if present
    htmlCode = htmlCode
      .replace(/^```html?\s*\n?/i, '')
      .replace(/\n?```\s*$/i, '')
      .trim();

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
