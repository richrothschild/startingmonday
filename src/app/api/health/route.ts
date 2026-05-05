import { NextResponse } from 'next/server'

const START_TIME = Date.now()

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    uptime: Math.floor((Date.now() - START_TIME) / 1000),
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version ?? 'unknown',
  })
}
