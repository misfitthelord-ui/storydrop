'use client'
import { useRouter } from 'next/navigation'
import { supabase } from '../lib/supabase'
import { useEffect, useState } from 'react'

export default function Home() {
  const router = useRouter()
  const [user, setUser] = useState(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user))
  }, [])

  return (
    <main style={{
      minHeight: '100vh',
      background: '#0A0A0F',
      color: '#fff',
      fontFamily: "'Georgia', serif",
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 20px',
      textAlign: 'center'
    }}>
      <div style={{ maxWidth: 560 }}>
        <div style={{
          width: 56, height: 56,
          background: '#534AB7',
          borderRadius: 14,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 28px',
          fontSize: 28
        }}>📖</div>

        <h1 style={{
          fontSize: 52,
          fontWeight: 400,
          letterSpacing: '-2px',
          lineHeight: 1.1,
          marginBottom: 20,
          background: 'linear-gradient(135deg, #fff 60%, #7F77DD)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          Every story is<br />uniquely yours.
        </h1>

        <p style={{
          fontSize: 18,
          color: 'rgba(255,255,255,0.55)',
          lineHeight: 1.7,
          marginBottom: 40,
          fontFamily: 'system-ui, sans-serif',
          fontWeight: 400
        }}>
          AI writes your story live as you play. Mystery, horror, sci-fi, adventure —
          no two playthroughs are ever the same.
        </p>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={() => router.push(user ? '/play' : '/login')}
            style={{
              background: '#534AB7',
              color: '#fff',
              border: 'none',
              borderRadius: 12,
              padding: '14px 32px',
              fontSize: 16,
              fontWeight: 500,
              cursor: 'pointer',
              fontFamily: 'system-ui, sans-serif'
            }}
          >
            Start playing free →
          </button>
          <button
            onClick={() => router.push('/pricing')}
            style={{
              background: 'rgba(255,255,255,0.08)',
              color: 'rgba(255,255,255,0.7)',
              border: '0.5px solid rgba(255,255,255,0.15)',
              borderRadius: 12,
              padding: '14px 32px',
              fontSize: 16,
              cursor: 'pointer',
              fontFamily: 'system-ui, sans-serif'
            }}
          >
            See pricing
          </button>
        </div>

        <div style={{
          marginTop: 60,
          display: 'flex',
          gap: 32,
          justifyContent: 'center',
          color: 'rgba(255,255,255,0.35)',
          fontSize: 13,
          fontFamily: 'system-ui, sans-serif'
        }}>
          <span>3 free stories/month</span>
          <span>4 genres</span>
          <span>Infinite endings</span>
        </div>
      </div>
    </main>
  )
}
