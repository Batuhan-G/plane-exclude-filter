import { NextResponse } from 'next/server'

export async function POST() {
  const res = NextResponse.json({ ok: true })
  res.cookies.delete('plane_api_key')
  res.cookies.delete('plane_workspace_slug')
  res.cookies.delete('gemini_api_key')
  return res
}
