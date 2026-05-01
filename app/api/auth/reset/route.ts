import { NextResponse } from 'next/server'

export async function POST() {
  const res = NextResponse.json({ ok: true })
  res.cookies.delete('plane_api_key')
  res.cookies.delete('plane_url')
  return res
}
