'use client'

import { useState } from 'react'
import { setupAuth } from '@/app/actions/auth'
import styles from './OnboardingModal.module.css'
import { OnboardingModalProps } from './OnboardingModal.types'


export function OnboardingModal({ onComplete }: OnboardingModalProps) {
  const [fields, setFields] = useState({ planeApiKey: '', workspaceSlug: '', geminiApiKey: '' })
  const [showPlaneKey,   setShowPlaneKey]   = useState(false)
  const [showGeminiKey,  setShowGeminiKey]  = useState(false)
  const [geminiExpanded, setGeminiExpanded] = useState(false)
  const [loading,        setLoading]        = useState(false)
  const [error,          setError]          = useState('')

  const setField = (key: keyof typeof fields) =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setFields(f => ({ ...f, [key]: e.target.value }))

  const canSubmit = fields.planeApiKey.trim() && fields.workspaceSlug.trim() && !loading

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!canSubmit) return

    setLoading(true)
    setError('')

    try {
      const result = await setupAuth({
        planeApiKey: fields.planeApiKey.trim(),
        workspaceSlug: fields.workspaceSlug.trim(),
        geminiApiKey: fields.geminiApiKey.trim() || undefined,
      })

      if ('error' in result) {
        setError(result.error)
        return
      }

      onComplete()
    } catch {
      setError('Network error. Please check your connection and try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.backdrop}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <div className={styles.logo}>
            <span className={styles.logoDot} />
            <span>plane<span className={styles.logoAccent}>filter</span></span>
          </div>
          <h1 className={styles.title}>Welcome to planefilter</h1>
          <p className={styles.subtitle}>
            Enter your credentials to get started. They are stored securely in your browser and never sent to any third party.
          </p>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="plane-api-key">
              Plane API Key
              <span className={styles.required}>*</span>
            </label>
            <div className={styles.inputWrap}>
              <input
                id="plane-api-key"
                className={styles.input}
                type={showPlaneKey ? 'text' : 'password'}
                value={fields.planeApiKey}
                onChange={setField('planeApiKey')}
                placeholder="plane_api_xxxxxxxxxxxxxxxx"
                autoComplete="off"
                spellCheck={false}
              />
              <button
                type="button"
                className={styles.eyeBtn}
                onClick={() => setShowPlaneKey(v => !v)}
                aria-label={showPlaneKey ? 'Hide key' : 'Show key'}
              >
                {showPlaneKey ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>
            <p className={styles.hint}>
              Get it from Plane → Profile Settings → Personal Access Tokens
            </p>
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="workspace-slug">
              Workspace Slug
              <span className={styles.required}>*</span>
            </label>
            <input
              id="workspace-slug"
              className={styles.input}
              type="text"
              value={fields.workspaceSlug}
              onChange={setField('workspaceSlug')}
              placeholder="my-workspace"
              autoComplete="off"
              spellCheck={false}
            />
            <p className={styles.hint}>
              Found in your Plane URL: app.plane.so/<strong>YOUR-SLUG</strong>/...
            </p>
          </div>

          <div className={styles.collapsible}>
            <button
              type="button"
              className={styles.collapseToggle}
              onClick={() => setGeminiExpanded(v => !v)}
            >
              Enable AI features
              <svg
                className={`${styles.chevron} ${geminiExpanded ? styles.chevronOpen : ''}`}
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>

            {geminiExpanded && (
              <div className={styles.collapsibleContent}>
                <div className={styles.field}>
                  <label className={styles.label} htmlFor="gemini-api-key">
                    Gemini API Key
                    <span className={styles.optional}>(optional)</span>
                  </label>
                  <div className={styles.inputWrap}>
                    <input
                      id="gemini-api-key"
                      className={styles.input}
                      type={showGeminiKey ? 'text' : 'password'}
                      value={fields.geminiApiKey}
                      onChange={setField('geminiApiKey')}
                      placeholder="AIza..."
                      autoComplete="off"
                      spellCheck={false}
                    />
                    <button
                      type="button"
                      className={styles.eyeBtn}
                      onClick={() => setShowGeminiKey(v => !v)}
                      aria-label={showGeminiKey ? 'Hide key' : 'Show key'}
                    >
                      {showGeminiKey ? <EyeOffIcon /> : <EyeIcon />}
                    </button>
                  </div>
                  <p className={styles.hint}>
                    Optional — enables AI features. Free at aistudio.google.com
                  </p>
                </div>
              </div>
            )}
          </div>

          {error && <p className={styles.error}>{error}</p>}

          <button
            type="submit"
            className={styles.submitBtn}
            disabled={!canSubmit}
          >
            {loading ? 'Validating...' : 'Save & Continue'}
          </button>
        </form>
      </div>
    </div>
  )
}

function EyeIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
}

function EyeOffIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  )
}
