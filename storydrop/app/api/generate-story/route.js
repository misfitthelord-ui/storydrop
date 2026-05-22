import Anthropic from '@anthropic-ai/sdk'
import { NextResponse } from 'next/server'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(req) {
  const { type, genre, storyContext, choiceMade, chapter } = await req.json()

  try {
    let prompt = ''
    if (type === 'chapter') {
      const chapterNames = ['The Opening', 'The Twist', 'The Climax']
      const chapterHint = chapterNames[chapter - 1] || 'The Next Chapter'
      const contextPart = storyContext
        ? `The story so far: ${storyContext}${choiceMade ? ` The protagonist chose to: ${choiceMade}.` : ''} Now write chapter ${chapter}`
        : 'Write chapter 1'
      prompt = `You are a master storyteller for an interactive story game called StoryDrop.
Genre: ${genre}. Chapter ${chapter} of 3 — "${chapterHint}".
${contextPart}.
Write an immersive, gripping 3–4 sentence scene that puts the player in a tense, pivotal moment. End on a cliffhanger.

Respond in this exact format:

STORY:
[your 3-4 sentence story here]

CHOICES:
{"a":"[choice A text 8-14 words]","b":"[choice B text 8-14 words]"}`
    } else if (type === 'consequence') {
      prompt = `Interactive ${genre} story. The player chose: "${choiceMade}".
Story so far: ${storyContext}
Write 2 gripping sentences showing the immediate consequence. Be vivid and specific.`
    } else if (type === 'ending') {
      prompt = `Write the final ending for this interactive ${genre} story.
Full story: ${storyContext}
Write a satisfying 2-sentence ending. Give it a title (5 words max).
Format exactly:
TITLE: [title]
ENDING: [2 sentences]`
    }

    const message = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 600,
      messages: [{ role: 'user', content: prompt }]
    })

    return NextResponse.json({ text: message.content[0].text })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'generation_failed' }, { status: 500 })
  }
}
