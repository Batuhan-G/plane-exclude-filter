function makeAssetProxyUrl(src: string, projectId: string | null, issueId: string | null = null): string {
  const params = new URLSearchParams({ action: 'asset', url: src })
  if (projectId) params.set('project', projectId)
  if (issueId) params.set('issue', issueId)
  return `/api/plane?${params.toString()}`
}

export function sanitizeDescHtml(html: string, projectId: string | null = null, issueId: string | null = null): string {
  let result = html.replace(/<img([^>]*?)src="([^"]*)"([^>]*?)\/?>/gi, (_, before, src, after) => {
    if (!src) return ''
    return `<img${before}src="${makeAssetProxyUrl(src, projectId, issueId)}"${after} data-desc-img="1">`
  })
  result = result.replace(
    /<image-component([^>]*?)src="([^"]*)"[^>]*?>[\s\S]*?<\/image-component>/gi,
    (_, _attrs, src) => {
      if (!src) return ''
      return `<img src="${makeAssetProxyUrl(src, projectId, issueId)}" data-desc-img="1">`
    }
  )
  result = result.replace(
    /<image-component([^>]*?)src="([^"]*)"[^>]*?\/>/gi,
    (_, _attrs, src) => {
      if (!src) return ''
      return `<img src="${makeAssetProxyUrl(src, projectId, issueId)}" data-desc-img="1">`
    }
  )
  return result
}
