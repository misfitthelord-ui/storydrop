'use client'
import { Suspense } from 'react'
import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'

const GENRES = [
  { id: 'mystery', label: 'Mystery', icon: '🔍', sub: 'Clues & suspense' },
  { id: 'sci-fi', label: 'Sci-fi', icon: '🚀', sub: 'Future worlds' },
  { id: 'horror', label: 'Horror', icon: '🌑', sub: 'Dark & eerie' },
  { id: 'adventure', label: 'Adventure', icon: '🗺️', sub: 'Epic quests' },
]
const MAX_CHAPTERS = 3

function PlayInner() {
  const router = useRouter()
  const [genre, setGenre] = useState('mystery')
  const [phase, setPhase] = useState('setup')
  const [chapter, setChapter] = useState(1)
  const [storyText, setStoryText] = useState('')
  const [choices, setChoices] = useState(null)
  const [selected, setSelected] = useState(null)
  const [consequence, setConsequence] = useState('')
  const [ending, setEnding] = useState(null)
  const [loading, setLoading] = useState(false)
  const [loadingMsg, setLoadingMsg] = useState('')
  const [score, setScore] = useState(0)
  const [error, setError] = useState('')
  const storyContext = useRef('')
  const choiceMade = useRef('')

  async function callAPI(body) {
    const res = await fetch('/api/generate-story', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    })
    const data = await res.json()
    if (data.error) throw new Error(data.error)
    return data.text
  }

  async function startGame() {
    setPhase('playing'); setChapter(1); setScore(0); setError('')
    storyContext.current = ''; choiceMade.current = ''
    await loadChapter(1)
  }

  async function loadChapter(ch) {
    setLoading(true); setLoadingMsg(`Claude is writing chapter ${ch}...`)
    setStoryText(''); setChoices(null); setSelected(null); setConsequence('')
    try {
      const raw = await callAPI({ type: 'chapter', genre, storyContext: storyContext.current, choiceMade: choiceMade.current, chapter: ch })
      const storyMatch = raw.match(/STORY:\s*([\s\S]*?)(?=CHOICES:)/i)
      const choicesMatch = raw.match(/CHOICES:\s*(\{[\s\S]*?\})/i)
      if (!storyMatch || !choicesMatch) throw new Error('parse_error')
      const story = storyMatch[1].trim()
      const parsedChoices = JSON.parse(choicesMatch[1])
      storyContext.current += (storyContext.current ? ' ' : '') + story
      setStoryText(story); setChoices(parsedChoices)
    } catch (e) { setError('Something went wrong. Try again.') }
    setLoading(false)
  }

  async function choose(key, text) {
    setSelected(key); choiceMade.current = text; setScore(s => s + chapter * 15)
    setLoading(true); setLoadingMsg('Writing the consequence...')
    try {
      const result = await callAPI({ type: 'consequence', genre, storyContext: storyContext.current, choiceMade: text, chapter })
      storyContext.current += ' ' + result; setConsequence(result)
    } catch (e) { setConsequence('Your choice echoes through the story...') }
    setLoading(false)
  }

  async function nextChapter() {
    if (chapter >= MAX_CHAPTERS) { await finishStory(); return }
    const next = chapter + 1; setChapter(next); await loadChapter(next)
  }

  async function finishStory() {
    setLoading(true); setLoadingMsg('Writing your ending...')
    try {
      const raw = await callAPI({ type: 'ending', genre, storyContext: storyContext.current, chapter })
      const titleMatch = raw.match(/TITLE:\s*(.+)/i)
      const endingMatch = raw.match(/ENDING:\s*([\s\S]+)/i)
      setEnding({ title: titleMatch ? titleMatch[1].trim() : 'Your story ends', text: endingMatch ? endingMatch[1].trim() : raw.trim() })
      setPhase('end')
    } catch (e) { setError('Could not generate ending. Try again.') }
    setLoading(false)
  }

  function restart() { setPhase('setup'); setEnding(null); setError(''); storyContext.current = '' }

  const S = {
    page: { minHeight: '100vh', background: '#0A0A0F', color: '#fff', fontFamily: 'system-ui, sans-serif', padding: '24px 20px' },
    topbar: { display: 'flex', alignItems: 'center', gap: 10, maxWidth: 600, margin: '0 auto 28px', paddingBottom: 16, borderBottom: '0.5px solid rgba(255,255,255,0.08)' },
    card: { background: 'rgba(255,255,255,0.04)', border: '0.5px solid rgba(255,255,255,0.1)', borderRadius: 16, overflow: 'hidden', maxWidth: 600, margin: '0 auto' },
    cardBody: { padding: 28 },
    storyTxt: { fontSize: 16, lineHeight: 1.85, color: 'rgba(255,255,255,0.85)', marginBottom: 24 },
    choiceBtn: (picked) => ({ width: '100%', background: picked ? 'rgba(83,74,183,0.25)' : 'rgba(255,255,255,0.04)', border: picked ? '1px solid #534AB7' : '0.5px solid rgba(255,255,255,0.12)', borderRadius: 12, padding: '14px 16px', cursor: picked ? 'default' : 'pointer', display: 'flex', alignItems: 'center', gap: 12, textAlign: 'left', fontSize: 14, color: picked ? '#AFA9EC' : 'rgba(255,255,255,0.7)', marginBottom: 10 }),
    letter: (picked) => ({ width: 26, height: 26, borderRadius: '50%', background: picked ? '#534AB7' : 'rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 500, color: picked ? '#fff' : 'rgba(255,255,255,0.5)', flexShrink: 0 }),
    nextBtn: { width: '100%', background: '#534AB7', color: '#fff', border: 'none', borderRadius: 12, padding: 14, fontSize: 15, fontWeight: 500, cursor: 'pointer', marginTop: 16 },
    loadRow: { display: 'flex', alignItems: 'center', gap: 10, color: 'rgba(255,255,255,0.4)', fontSize: 14, padding: '12px 0' },
  }

  return (
    <div style={S.page}>
      <div style={S.topbar}>
        <div style={{ width: 32, height: 32, background: '#534AB7', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>📖</div>
        <span style={{ fontSize: 16, fontWeight: 500 }}>StoryDrop</span>
        <div style={{ marginLeft: 'auto' }}>
          <button onClick={() => router.push('/pricing')} style={{ background: 'none', border: '0.5px solid rgba(255,255,255,0.2)', borderRadius: 8, padding: '6px 12px', fontSize: 12, color: 'rgba(255,255,255,0.6)', cursor: 'pointer' }}>Go Pro · $4.99/mo</button>
        </div>
      </div>

      {phase === 'setup' && (
        <div style={{ maxWidth: 600, margin: '0 auto' }}>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)', marginBottom: 16 }}>Choose your genre:</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 24 }}>
            {GENRES.map(g => (
              <div key={g.id} onClick={() => setGenre(g.id)} style={{ background: genre === g.id ? 'rgba(83,74,183,0.2)' : 'rgba(255,255,255,0.04)', border: genre === g.id ? '1.5px solid #534AB7' : '0.5px solid rgba(255,255,255,0.1)', borderRadius: 14, padding: '18px 20px', cursor: 'pointer' }}>
                <div style={{ fontSize: 22, marginBottom: 8 }}>{g.icon}</div>
                <div style={{ fontSize: 15, fontWeight: 500, color: '#fff', marginBottom: 3 }}>{g.label}</div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)' }}>{g.sub}</div>
              </div>
            ))}
          </div>
          <button onClick={startGame} style={{ width: '100%', background: '#534AB7', color: '#fff', border: 'none', borderRadius: 12, padding: 16, fontSize: 16, fontWeight: 500, cursor: 'pointer' }}>Generate my story →</button>
        </div>
      )}

      {phase === 'playing' && (
        <>
          <div style={{ height: 3, background: 'rgba(255,255,255,0.08)', borderRadius: 2, maxWidth: 600, margin: '0 auto 24px' }}>
            <div style={{ height: '100%', background: '#534AB7', borderRadius: 2, width: `${Math.round((chapter / MAX_CHAPTERS) * 100)}%`, transition: 'width .5s' }} />
          </div>
          <div style={S.card}>
            <div style={{ height: 4, background: '#534AB7' }} />
            <div style={S.cardBody}>
              <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '.08em', color: 'rgba(255,255,255,0.3)', marginBottom: 12 }}>Chapter {chapter} of {MAX_CHAPTERS}</div>
              {loading && <div style={S.loadRow}><div style={{ width: 18, height: 18, border: '2px solid rgba(255,255,255,0.1)', borderTopColor: '#534AB7', borderRadius: '50%', animation: 'spin .7s linear infinite', flexShrink: 0 }} />{loadingMsg}</div>}
              {storyText && <p style={S.storyTxt}>{storyText}</p>}
              {choices && !selected && (
                <div>
                  {[['a', choices.a], ['b', choices.b]].map(([key, text]) => (
                    <button key={key} style={S.choiceBtn(false)} onClick={() => choose(key, text)}>
                      <div style={S.letter(false)}>{key.toUpperCase()}</div>
                      <div style={{ flex: 1, lineHeight: 1.5 }}>{text}</div>
                    </button>
                  ))}
                </div>
              )}
              {selected && choices && (
                <div>
                  {[['a', choices.a], ['b', choices.b]].map(([key, text]) => (
                    <div key={key} style={{ ...S.choiceBtn(selected === key), cursor: 'default' }}>
                      <div style={S.letter(selected === key)}>{key.toUpperCase()}</div>
                      <div style={{ flex: 1, lineHeight: 1.5 }}>{text}</div>
                    </div>
                  ))}
                </div>
              )}
              {consequence && <div style={{ background: 'rgba(83,74,183,0.15)', border: '0.5px solid rgba(83,74,183,0.4)', borderRadius: 12, padding: '16px 18px', marginTop: 20 }}><div style={{ fontSize: 11, color: '#7F77DD', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '.08em' }}>Consequence</div><div style={{ fontSize: 14, color: '#AFA9EC', lineHeight: 1.7 }}>{consequence}</div></div>}
              {consequence && !loading && <button style={S.nextBtn} onClick={nextChapter}>{chapter >= MAX_CHAPTERS ? 'See my ending →' : 'Continue story →'}</button>}
              {error && <p style={{ color: '#F09595', fontSize: 14, marginTop: 12 }}>{error}</p>}
            </div>
          </div>
        </>
      )}

      {phase === 'end' && ending && (
        <div style={{ maxWidth: 600, margin: '0 auto', textAlign: 'center' }}>
          <div style={{ fontSize: 40, marginBottom: 20 }}>🏆</div>
          <h2 style={{ fontSize: 28, fontWeight: 400, letterSpacing: '-1px', marginBottom: 12 }}>{ending.title}</h2>
          <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.6)', lineHeight: 1.8, marginBottom: 32 }}>{ending.text}</p>
          <div style={{ display: 'inline-flex', background: 'rgba(83,74,183,0.2)', border: '0.5px solid #534AB7', borderRadius: 12, padding: '12px 28px', marginBottom: 32 }}>
            <div><div style={{ fontSize: 32, fontWeight: 500, color: '#AFA9EC' }}>{score}</div><div style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)' }}>story points</div></div>
          </div>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={restart} style={{ background: 'rgba(255,255,255,0.08)', color: '#fff', border: '0.5px solid rgba(255,255,255,0.15)', borderRadius: 10, padding: '12px 24px', fontSize: 14, cursor: 'pointer' }}>Play again</button>
            <button onClick={() => router.push('/pricing')} style={{ background: '#534AB7', color: '#fff', border: 'none', borderRadius: 10, padding: '12px 24px', fontSize: 14, fontWeight: 500, cursor: 'pointer' }}>Unlock Pro · $4.99/mo →</button>
          </div>
        </div>
      )}
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}

export default function Play() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', background: '#0A0A0A', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontFamily: 'system-ui' }}>Loading...</div>}>
      <PlayInner />
    </Suspense>
  )
}
