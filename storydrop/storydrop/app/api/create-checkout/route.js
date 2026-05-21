import { stripe } from '../../../lib/stripe'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const { userId, email } = req.body

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{
        price: process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID,
        quantity: 1
      }],
      customer_email: email,
      metadata: { userId },
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/play?upgrade=success`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing`
    })

    return res.status(200).json({ url: session.url })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'checkout_failed' })
  }
}
