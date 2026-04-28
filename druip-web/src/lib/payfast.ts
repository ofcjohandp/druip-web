import crypto from 'crypto'

export const PAYFAST_URL = process.env.NODE_ENV === 'production'
  ? 'https://www.payfast.co.za/eng/process'
  : 'https://sandbox.payfast.co.za/eng/process'

export function generateSignature(data: Record<string, string>): string {
  const passPhrase = process.env.PAYFAST_PASSPHRASE!
  const queryString = Object.entries(data)
    .map(([k, v]) => `${k}=${encodeURIComponent(v.trim()).replace(/%20/g, '+')}`)
    .join('&')
  const stringToHash = `${queryString}&passphrase=${encodeURIComponent(passPhrase.trim()).replace(/%20/g, '+')}`
  return crypto.createHash('md5').update(stringToHash).digest('hex')
}

export function verifySignature(data: Record<string, string>, receivedSignature: string): boolean {
  const { signature: _sig, ...rest } = data
  const expected = generateSignature(rest)
  return expected === receivedSignature
}
