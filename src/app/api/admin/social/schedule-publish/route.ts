import { createAdminClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST() {
  const admin = createAdminClient();

  // Fetch unscheduled posts
  const { data: unscheduledPosts, error: fetchError } = await admin
    .from('social_posts')
    .select('id, post_date, pillar, draft_text')
    .is('buffer_scheduled_at', null);

  if (fetchError) {
    return NextResponse.json({ error: fetchError.message }, { status: 500 });
  }

  // Schedule posts
  const now = new Date();
  const updates = unscheduledPosts.map((post, index) => {
    const scheduleDate = new Date(now.getTime() + index * 60 * 60 * 1000); // Schedule hourly
    return {
      id: post.id,
      buffer_scheduled_at: scheduleDate.toISOString(),
    };
  });

  for (const update of updates) {
    const { error: updateError } = await admin
      .from('social_posts')
      .update({ buffer_scheduled_at: update.buffer_scheduled_at })
      .eq('id', update.id);

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }
  }

  return NextResponse.json({ ok: true, scheduled: updates.length });
}