import { NextResponse } from 'next/server';
import { createClient } from '@sanity/client';

const sanityClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  apiVersion: '2024-01-01',
  token: process.env.SANITY_WRITE_TOKEN,
  useCdn: false,
});

export async function DELETE(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (
    process.env.CRON_SECRET &&
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const day = searchParams.get('day');
  const all = searchParams.get('all');

  try {
    if (all === 'true') {
      const entries = await sanityClient.fetch<{ _id: string }[]>(
        `*[_type == "plastic"] { _id }`
      );
      for (const entry of entries) {
        await sanityClient.delete(entry._id);
      }
      return NextResponse.json({ deleted: entries.length });
    }

    if (!day) {
      return NextResponse.json(
        { error: 'Provide ?day=NUMBER or ?all=true' },
        { status: 400 }
      );
    }

    const entry = await sanityClient.fetch<{ _id: string } | null>(
      `*[_type == "plastic" && dayNumber == $day][0] { _id }`,
      { day: parseInt(day, 10) }
    );

    if (!entry) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    await sanityClient.delete(entry._id);
    return NextResponse.json({ deleted: 1, day: parseInt(day, 10) });
  } catch (error) {
    return NextResponse.json(
      { error: 'Delete failed', details: String(error) },
      { status: 500 }
    );
  }
}
