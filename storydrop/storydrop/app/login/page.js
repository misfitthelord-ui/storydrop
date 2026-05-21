'use client'
import { useState } from 'react'
import { supabase } from '../../lib/supabase'

export default function Login() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleLogin(e) {
    e.preventDefault()
    setLoading(true)
    await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/play` }
    })
    setSent(true)
    setLoading(false)
  }

  const cardStyle = {
    minHeight: '100vh',
    background: '#0A0A0F',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    fontFamily: 'system-ui, sans-serif'
  }

  return (
    <div style={cardStyle}>
      <div style={{
        background: 'rgba(255,255,255,0.04)',
        border: '0.5px solid rgba(255,255,255,0.1)',
        borderRadius: 16,
        padding: '40px 36px',
        width: '100%',
        maxWidth: 380,
        textAlign: 'center'
      }}>
        <div style={{ fontSize: 32, marginBottom: 16 }}>📖</div>
        <h1 style={{ color: '#fff', fontSize: 22, fontWeight: 500, marginBottom: 8 }}>
          Sign in to StoryDrop
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 14, marginBottom: 28 }}>
          No password needed — we'll email you a magic link.
        </p>

        {sent ? (
          <div style={{
            background: 'rgba(83,74,183,0.2)',
            border: '0.5px solid #534AB7',
            borderRadius: 10,
            padding: '16px',
            color: '#AFA9EC',
            fontSize: 14,
            lineHeight: 1.6
          }}>
            Check your inbox! Click the link in the email to start playing.
          </div>
        ) : (
          <form onSubmit={handleLogin}>
            <input
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              style={{
                width: '100%',
                background: 'rgba(255,255,255,0.06)',
                border: '0.5px solid rgba(255,255,255,0.15)',
                borderRadius: 10,
                padding: '12px 16px',
                color: '#fff',
                fontSize: 15,
                marginBottom: 12,
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                background: '#534AB7',
                color: '#fff',
                border: 'none',
                borderRadius: 10,
                padding: '13px',
                fontSize: 15,
                fontWeight: 500,
                cursor: loading ? 'default' : 'pointer',
                opacity: loading ? 0.7 : 1
              }}
            >
              {loading ? 'Sending...' : 'Send magic link →'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
