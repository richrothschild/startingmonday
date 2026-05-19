import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  // Placeholder: Accept LinkedIn PDF upload, do nothing yet
  // TODO: Implement actual extraction/storage logic
  return NextResponse.json({ ok: true })
}
