'use client'

import { useEffect } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[v0] Error:', error)
  }, [error])

  return (
    <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', padding: '1rem', backgroundColor: '#0f0f0f' }}>
      <div style={{ width: '100%', maxWidth: '28rem', gap: '1rem', display: 'flex', flexDirection: 'column', textAlign: 'center' }}>
        <h2 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#fafafa' }}>Error</h2>
        <p style={{ fontSize: '0.875rem', color: '#a1a1a1' }}>
          Ocurrió un error inesperado.
        </p>
        <button
          onClick={() => reset()}
          style={{
            padding: '0.5rem 1rem',
            borderRadius: '0.375rem',
            backgroundColor: '#ea580c',
            color: '#fafafa',
            fontWeight: '600',
            cursor: 'pointer',
            border: 'none'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#dc3f05'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#ea580c'
          }}
        >
          Intentar de nuevo
        </button>
      </div>
    </div>
  )
}
