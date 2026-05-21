import { stripe } from '../../../lib/stripe'
import { supabaseAdmin } from '../../../lib/supabase'
import { buffer } from 'micro'

export const config = { api: { bodyParser: false } }

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const buf = await buffer(req)
  const sig = req.headers['stripe-signature']

  let event
  try {
    event = stripe.webhooks.constructEvent(buf, sig, process.env.STRIPE_WEBHOOK_SECRET)
  } catch (err) {
    return res.status(400).send(`Webhook error: ${err.message}`)
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

  res.status(200).json({ received: true })
}
