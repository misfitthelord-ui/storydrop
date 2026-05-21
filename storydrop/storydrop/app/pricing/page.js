'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useRouter } from 'next/navigation'

export default function Pricing() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user))
  }, [])

  async function handleUpgrade() {
    if (!user) return router.push('/login')
    setLoading(true)
    const res = await fetch('/api/create-checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: user.id, email: user.email })
    })
    const { url } = await res.json()
    window.location.href = url
  }

  const dark = '#0A0A0F'
  const card = { background: 'rgba(255,255,255,0.04)', border: '0.5px solid rgba(255,255,255,0.1)', borderRadius: 16, padding: '32px 28px' }

  return (
    <div style={{ minHeight: '100vh', background: dark, color: '#fff', fontFamily: 'system-ui, sans-serif', padding: '60px 20px' }}>
      <div style={{ maxWidth: 560, margin: '0 auto', textAlign: 'center' }}>
        <h1 style={{ fontSize: 36, fontWeight: 500, marginBottom: 12, letterSpacing: '-1px' }}>Simple pricing</h1>
        <p style={{ color: 'rgba(255,255,255,0.45)', marginBottom: 48 }}>Start free. Upgrade when you're hooked.</p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 40 }}>
          <div style={card}>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '.08em' }}>Free</div>
            <div style={{ fontSize: 36, fontWeight: 500, marginBottom: 4 }}>$0</div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)', marginBottom: 24 }}>forever</div>
            {['3 stories / month', '4 genres', 'AI-generated endings', 'Story points'].map(f => (
              <div key={f} style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)', padding: '7px 0', borderTop: '0.5px solid rgba(255,255,255,0.07)', textAlign: 'left' }}>✓ {f}</div>
            ))}
            <button onClick={() => router.push('/play')} style={{ marginTop: 20, width: '100%', background: 'rgba(255,255,255,0.08)', color: '#fff', border: '0.5px solid rgba(255,255,255,0.15)', borderRadius: 10, padding: '12px', fontSize: 14, cursor: 'pointer' }}>
              Start free
            </button>
          </div>

          <div style={{ ...card, border: '2px solid #534AB7', position: 'relative' }}>
            <div style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', background: '#534AB7', color: '#fff', fontSize: 11, fontWeight: 500, padding: '3px 12px', borderRadius: 20 }}>Most popular</div>
            <div style={{ fontSize: 13, color: '#AFA9EC', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '.08em' }}>Pro</div>
            <div style={{ fontSize: 36, fontWeight: 500, marginBottom: 4 }}>$4.99</div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)', marginBottom: 24 }}>per month</div>
            {['Unlimited stories', '12+ genres', 'Horror, romance & more', 'Daily new worlds', 'Priority generation', 'Cancel anytime'].map(f => (
              <div key={f} style={{ fontSize: 14, color: 'rgba(255,255,255,0.75)', padding: '7px 0', borderTop: '0.5px solid rgba(255,255,255,0.07)', textAlign: 'left' }}>✓ {f}</div>
            ))}
            <button onClick={handleUpgrade} disabled={loading} style={{ marginTop: 20, width: '100%', background: '#534AB7', color: '#fff', border: 'none', borderRadius: 10, padding: '12px', fontSize: 14, fontWeight: 500, cursor: loading ? 'default' : 'pointer', opacity: loading ? 0.7 : 1 }}>
              {loading ? 'Loading...' : 'Upgrade to Pro →'}
            </button>
          </div>
        </div>

        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)' }}>
          Secure payment via Stripe. Cancel anytime from your account.
        </p>
      </div>
    </div>
  )
}
