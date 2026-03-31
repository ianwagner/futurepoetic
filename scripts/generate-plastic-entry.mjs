import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

const SYSTEM_PROMPT = `You are a generative design engine for an experimental UI laboratory called "Plastic."

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
  "tags": ["1-3 category tags from: experimental, interaction, generative, spatial, temporal, sensory, linguistic, biological, philosophical, material, sonic, social, archival, impossible"],
  "accentColor": "hex color that fits the mood of this concept"
}`;

async function generate() {
  const message = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 300,
    messages: [
      {
        role: "user",
        content:
          "Generate one experimental UI concept for today. Make it something no one has ever thought of before.",
      },
    ],
    system: SYSTEM_PROMPT,
  });

  const text = message.content[0].text;

  try {
    const entry = JSON.parse(text);
    console.log(JSON.stringify(entry, null, 2));
  } catch {
    console.error("Failed to parse JSON response:");
    console.error(text);
    process.exit(1);
  }
}

generate();
