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

Think about:
- Interfaces for things that don't normally have interfaces (grief, déjà vu, the feeling of forgetting a word, tidal patterns, mycorrhizal networks)
- Familiar UI patterns applied to absurd contexts (a Kanban board for managing your recurring dreams, a date picker for geological epochs)
- Interactions that bend the rules of digital interfaces (a button that gets heavier the more you click it, a form that fills itself in based on ambient sound)
- Tools for impossible tasks (a color picker for emotions, a slider that controls the passage of time in a room)
- Radical reimaginings of mundane software (a spreadsheet where cells are alive and compete for resources, a text editor that decays)

Be specific. Be weird. Be poetic. The subtitle should make someone stop and think "wait, that's actually interesting."

Respond with ONLY valid JSON, no markdown fences:
{
  "title": "2-5 word evocative name",
  "subtitle": "One vivid sentence describing what it does or how it works",
  "tags": ["1-3 tags from: experimental, interaction, generative, spatial, temporal, sensory, linguistic, biological, philosophical, material, sonic, social, archival, impossible"],
  "accentColor": "hex color that fits the mood"
}`;

const BUILD_PROMPT = `You are a master frontend engineer building experimental, interactive UI art pieces.

You will receive a concept (title + subtitle) for an impossible interface. Your job: build it as a single, self-contained HTML file.

Rules:
- Output ONLY the complete HTML document. No markdown fences, no explanation.
- The HTML must be fully self-contained — inline all CSS and JavaScript. No external dependencies or CDN links.
- Use modern CSS (grid, flexbox, animations, gradients, filters, backdrop-filter, clip-path, etc.)
- Use vanilla JavaScript for interactivity (mouse tracking, click handlers, animations, canvas, Web Audio API, etc.)
- The UI should be visually stunning on a dark background (#000000)
- Make it INTERACTIVE — it should respond to mouse movement, clicks, scrolling, typing, or time
- The piece should feel alive, not static. Use requestAnimationFrame, CSS animations, or event-driven updates
- Fill the entire viewport. Use width: 100vw; height: 100vh; overflow: hidden on the body
- Use a sophisticated color palette that matches the concept's mood
- Typography should be clean and modern — use system fonts (system-ui, -apple-system, sans-serif)
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

    const existing = await sanityClient.fetch<{ _id: string } | null>(
      `*[_type == "plastic" && date == $date][0] { _id }`,
      { date: today }
    );
    if (existing) {
      return NextResponse.json({
        message: 'Already generated for today',
        date: today,
      });
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

    // Step 2: Generate the actual UI
    const buildMsg = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 16000,
      system: BUILD_PROMPT,
      messages: [
        {
          role: 'user',
          content: `Build this concept:\n\nTitle: ${concept.title}\nDescription: ${concept.subtitle}\nAccent color: ${concept.accentColor}\n\nMake it interactive, visually rich, and completely self-contained.`,
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
