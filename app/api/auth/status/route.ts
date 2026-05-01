import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  if (process.env.NODE_ENV === 'development') {
    return NextResponse.json({ configured: true })
  }
  const planeKey = req.cookies.get('plane_api_key')?.value
  const planeUrl = req.cookies.get('plane_url')?.value
  return NextResponse.json({
    configured: !!(planeKey && planeUrl),
  })
}
