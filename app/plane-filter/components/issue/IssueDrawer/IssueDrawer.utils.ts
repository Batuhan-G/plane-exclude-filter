export function getFileIcon(mimeType: string): string {
  if (mimeType.startsWith('image/')) return '🖼'
  if (mimeType.startsWith('video/')) return '🎬'
  if (mimeType.startsWith('audio/')) return '🎵'
  if (mimeType.includes('pdf')) return '📄'
  if (mimeType.includes('spreadsheet') || mimeType.includes('excel')) return '📊'
  if (mimeType.includes('zip') || mimeType.includes('compressed')) return '🗜'
  return '📎'
}

export function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function sanitizeDescHtml(html: string, issueUrl: string | null): string {
  const placeholder = issueUrl
    ? `<a href="${issueUrl}" target="_blank" rel="noreferrer" class="planePlaceholderImg">&#128444; Image (view in Plane)</a>`
    : '<span class="planePlaceholderImg">&#128444; Image</span>'
  return html
    .replace(/<img[^>]*\/?>/gi, placeholder)
    .replace(/<image-component[^>]*>[\s\S]*?<\/image-component>/gi, placeholder)
    .replace(/<image-component[^/]*\/>/gi, placeholder)
}
