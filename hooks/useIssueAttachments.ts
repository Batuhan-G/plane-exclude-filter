import { useEffect, useState } from 'react'
import type { PlaneAttachment, RawIssue } from '@/lib/types'

export function useIssueAttachments(issue: RawIssue | null) {
  const [attachments, setAttachments] = useState<PlaneAttachment[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!issue) { setAttachments([]); return }
    setLoading(true)
    fetch(`/api/plane?action=attachments&project=${issue.project}&issue=${issue.id}`)
      .then(r => r.json())
      .then(data => setAttachments(Array.isArray(data) ? data : []))
      .catch(() => setAttachments([]))
      .finally(() => setLoading(false))
  }, [issue?.id, issue?.project])

  return { attachments, loading }
}
