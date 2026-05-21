import Anthropic from '@anthropic-ai/sdk'
import { supabaseAdmin } from '../../../lib/supabase'

const client = new Anthropic()

const FREE_STORIES_PER_MONTH = 3

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const { type, genre, storyContext, choiceMade, chapter, userId } = req.body

  // Check usage limits for free users
  if (userId) {
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('is_pro, stories_this_month')
      .eq('id', userId)
      .single()

    if (profile && !profile.is_pro && profile.stories_this_month >= FREE_STORIES_PER_MONTH && chapter === 1) {
      return res.status(403).json({ error: 'free_limit_reached' })
    }

    // Increment story count on chapter 1
    if (chapter === 1) {
      await supabaseAdmin
        .from('profiles')
        .update({ stories_this_month: (profile?.stories_this_month || 0) + 1 })
        .eq('id', userId)
    }
  }

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

Write an immersive, gripping 3–4 sentence scene that puts the player in a tense, pivotal moment. End on a cliffhanger that demands a choice.

Then provide EXACTLY 2 choices the player can make, each 8–14 words.

Respond in this exact format (nothing else):

STORY:
[your 3-4 sentence story here]

CHOICES:
{"a":"[choice A text]","b":"[choice B text]"}`

    } else if (type === 'consequence') {
      prompt = `Interactive ${genre} story. The player chose: "${choiceMade}".
Story so far: ${storyContext}
Write 2 gripping sentences showing the immediate consequence of this choice. Be vivid and specific. Just action and atmosphere, no "you".`

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

    const text = message.content[0].text
    return res.status(200).json({ text })

  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'generation_failed' })
  }
}
