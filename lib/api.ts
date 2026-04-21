export async function planeApi<T>(action: string, project?: string, bust = false): Promise<T> {
  const params = new URLSearchParams({ action })
  if (project) params.set('project', project)
  if (bust) params.set('bust', Date.now().toString())
  const res = await fetch(`/api/plane?${params}`)
  if (!res.ok) {
    const err = await res.json() as { error?: string }
    throw new Error(err.error ?? `HTTP ${res.status}`)
  }
  return res.json() as Promise<T>
}
