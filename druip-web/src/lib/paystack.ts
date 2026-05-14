const PAYSTACK_API = 'https://api.paystack.co'

function authHeader(): string {
  return `Bearer ${process.env.PAYSTACK_SECRET_KEY}`
}

export async function initializeTransaction({
  amountRands,
  email,
  reference,
  metadata,
  callbackUrl,
}: {
  amountRands: number
  email: string
  reference: string
  metadata: Record<string, string>
  callbackUrl: string
}): Promise<{ authorization_url: string; reference: string }> {
  const res = await fetch(`${PAYSTACK_API}/transaction/initialize`, {
    method: 'POST',
    headers: {
      Authorization: authHeader(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      amount: Math.round(amountRands * 100),
      email,
      currency: 'ZAR',
      reference,
      metadata,
      callback_url: callbackUrl,
    }),
  })
  const json = await res.json()
  if (!json.status) throw new Error(`Paystack initialize error: ${JSON.stringify(json)}`)
  return { authorization_url: json.data.authorization_url, reference: json.data.reference }
}

export async function verifyTransaction(reference: string): Promise<{
  status: string
  amount: number
  metadata: Record<string, string>
}> {
  const res = await fetch(`${PAYSTACK_API}/transaction/verify/${encodeURIComponent(reference)}`, {
    headers: { Authorization: authHeader() },
  })
  const json = await res.json()
  if (!json.status) throw new Error(`Paystack verify error: ${JSON.stringify(json)}`)
  return json.data
}
