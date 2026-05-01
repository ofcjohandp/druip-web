const TOKEN_URL = 'https://secure.stitch.money/connect/token'
const API_URL = 'https://api.stitch.money/graphql'

async function getToken(): Promise<string> {
  const res = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: process.env.STITCH_CLIENT_ID!,
      client_secret: process.env.STITCH_CLIENT_SECRET!,
      scope: 'client_paymentrequest',
    }),
  })
  const data = await res.json()
  if (!data.access_token) throw new Error(`Stitch token error: ${JSON.stringify(data)}`)
  return data.access_token
}

export async function createPaymentRequest({
  amountRands,
  externalReference,
  redirectUri,
}: {
  amountRands: number
  externalReference: string
  redirectUri: string
}): Promise<{ id: string; url: string }> {
  const token = await getToken()
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({
      query: `
        mutation CreatePaymentRequest($input: ClientPaymentInitiationRequestInput!) {
          clientPaymentInitiationRequestCreate(input: $input) {
            paymentInitiationRequest { id url }
          }
        }
      `,
      variables: {
        input: {
          amount: { quantity: amountRands.toFixed(2), currency: 'ZAR' },
          payerReference: 'Druip notes',
          beneficiaryReference: 'Druip',
          externalReference,
          redirectUri,
        },
      },
    }),
  })
  const data = await res.json()
  const req = data.data?.clientPaymentInitiationRequestCreate?.paymentInitiationRequest
  if (!req) throw new Error(`Stitch payment request error: ${JSON.stringify(data)}`)
  return req
}

export async function getPaymentStatus(paymentRequestId: string): Promise<string | null> {
  const token = await getToken()
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({
      query: `
        query GetPaymentRequest($id: ID!) {
          node(id: $id) {
            ... on ClientPaymentInitiationRequest {
              status { __typename }
            }
          }
        }
      `,
      variables: { id: paymentRequestId },
    }),
  })
  const data = await res.json()
  return data.data?.node?.status?.__typename ?? null
}
