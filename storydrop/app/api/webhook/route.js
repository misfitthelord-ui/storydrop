import { stripe } from '../../../lib/stripe'
import { supabaseAdmin } from '../../../lib/supabase'
import { NextResponse } from 'next/server'

export async function POST(req) {
  const buf = await req.arrayBuffer()
  const rawBody = Buffer.from(buf)
  const sig = req.headers.get('stripe-signature')

  let event
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET)
  } catch (err) {
    return NextResponse.json({ error: `Webhook error: ${err.message}` }, { status: 400 })
  }

  const session = event.data.object

  if (event.type === 'checkout.session.completed') {
    const userId = session.metadata?.userId
    if (userId) {
      await supabaseAdmin
        .from('profiles')
        .update({
          is_pro: true,
          stripe_customer_id: session.customer,
          stripe_subscription_id: session.subscription
        })
        .eq('id', userId)
    }
  }

  if (event.type === 'customer.subscription.deleted') {
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('stripe_subscription_id', session.id)
      .single()

    if (profile) {
      await supabaseAdmin
        .from('profiles')
        .update({ is_pro: false })
        .eq('id', profile.id)
    }
  }

  return NextResponse.json({ received: true })
}
