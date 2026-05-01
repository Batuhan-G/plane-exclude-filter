import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  if (process.env.NODE_ENV === 'development') {
    return NextResponse.json({ configured: true, hasGemini: !!process.env.GEMINI_API_KEY })
  }
  const planeKey = req.cookies.get('plane_api_key')?.value
  const workspaceSlug = req.cookies.get('plane_workspace_slug')?.value
  const geminiKey = req.cookies.get('gemini_api_key')?.value
  return NextResponse.json({
    configured: !!(planeKey && workspaceSlug),
    hasGemini: !!geminiKey,
  })
}
