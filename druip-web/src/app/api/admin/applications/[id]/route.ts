import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'

const ADMIN_EMAIL = 'ofc.johandp@gmail.com'
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://druip.co.za'

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.email !== ADMIN_EMAIL) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { action, notes } = await req.json() as { action: 'approved' | 'denied'; notes?: string }
  if (!['approved', 'denied'].includes(action)) {
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  }

  const admin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: application, error } = await admin
    .from('seller_applications')
    .update({
      status: action,
      reviewer_notes: notes || null,
      reviewed_at: new Date().toISOString(),
    })
    .eq('id', params.id)
    .select('user_id')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Send email notification — fire and forget, don't fail the response
  sendApprovalEmail(admin, application.user_id, action, notes || null).catch(console.error)

  return NextResponse.json({ ok: true })
}

async function sendApprovalEmail(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  admin: any,
  userId: string,
  action: 'approved' | 'denied',
  notes: string | null
) {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) return // Email not configured — skip silently

  const { data: { user } } = await admin.auth.admin.getUserById(userId)
  if (!user?.email) return

  const firstName = user.user_metadata?.first_name || user.email.split('@')[0]

  const subject = action === 'approved'
    ? 'You\'re approved to sell on Druip'
    : 'Your Druip seller application'

  const html = action === 'approved'
    ? approvedEmailHtml(firstName, APP_URL)
    : deniedEmailHtml(firstName, notes, APP_URL)

  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'Druip <noreply@druip.co.za>',
      to: [user.email],
      subject,
      html,
    }),
  })
}

function approvedEmailHtml(firstName: string, appUrl: string) {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#FAF7F2;font-family:Nunito,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#FAF7F2;padding:40px 20px;">
    <tr><td align="center">
      <table width="100%" style="max-width:520px;background:#FFFFFF;border-radius:24px;overflow:hidden;box-shadow:0 2px 16px rgba(0,0,0,0.06);">
        <tr>
          <td style="background:linear-gradient(140deg,#7C9B82 0%,#A8C5AE 100%);padding:36px 40px 28px;text-align:center;">
            <div style="font-size:28px;font-weight:800;color:#FFFFFF;letter-spacing:-0.02em;">druip</div>
            <div style="font-size:13px;color:rgba(255,255,255,0.8);margin-top:4px;font-weight:600;">student notes marketplace</div>
          </td>
        </tr>
        <tr>
          <td style="padding:36px 40px 40px;">
            <h1 style="font-size:22px;font-weight:700;color:#2C2C2C;margin:0 0 12px;line-height:1.3;">
              You're in, ${firstName}. Welcome to the seller community.
            </h1>
            <p style="font-size:15px;color:#6B6B6B;line-height:1.7;margin:0 0 24px;">
              Your application has been reviewed and approved. You can now publish your notes and start earning on Druip.
            </p>
            <p style="font-size:15px;color:#6B6B6B;line-height:1.7;margin:0 0 32px;">
              Head over to Sell your notes to create your first listing. It only takes a few minutes, and your notes could be helping students today.
            </p>
            <div style="text-align:center;margin-bottom:32px;">
              <a href="${appUrl}/sell" style="display:inline-block;background:#7C9B82;color:#FFFFFF;text-decoration:none;font-size:15px;font-weight:700;padding:14px 36px;border-radius:50px;letter-spacing:0.01em;">
                Start selling
              </a>
            </div>
            <div style="border-top:1px solid #F0ECE6;padding-top:24px;text-align:center;">
              <p style="font-size:13px;color:#9B9B9B;margin:0;line-height:1.6;">
                You earn 85% of every sale. Druip keeps 15%.<br>
                Good luck out there.
              </p>
            </div>
          </td>
        </tr>
      </table>
      <p style="font-size:12px;color:#B0A99E;margin-top:24px;">druip.co.za &nbsp;&middot;&nbsp; Built for South African students</p>
    </td></tr>
  </table>
</body>
</html>`
}

function deniedEmailHtml(firstName: string, notes: string | null, appUrl: string) {
  const notesBlock = notes
    ? `<div style="background:#FAF7F2;border-radius:14px;padding:16px 20px;margin:0 0 24px;">
        <p style="font-size:13px;color:#6B6B6B;line-height:1.6;margin:0;font-style:italic;">"${notes}"</p>
      </div>`
    : ''

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#FAF7F2;font-family:Nunito,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#FAF7F2;padding:40px 20px;">
    <tr><td align="center">
      <table width="100%" style="max-width:520px;background:#FFFFFF;border-radius:24px;overflow:hidden;box-shadow:0 2px 16px rgba(0,0,0,0.06);">
        <tr>
          <td style="background:linear-gradient(140deg,#C9A84C 0%,#E8D08A 100%);padding:36px 40px 28px;text-align:center;">
            <div style="font-size:28px;font-weight:800;color:#FFFFFF;letter-spacing:-0.02em;">druip</div>
            <div style="font-size:13px;color:rgba(255,255,255,0.8);margin-top:4px;font-weight:600;">student notes marketplace</div>
          </td>
        </tr>
        <tr>
          <td style="padding:36px 40px 40px;">
            <h1 style="font-size:22px;font-weight:700;color:#2C2C2C;margin:0 0 12px;line-height:1.3;">
              Thanks for applying, ${firstName}.
            </h1>
            <p style="font-size:15px;color:#6B6B6B;line-height:1.7;margin:0 0 20px;">
              After reviewing your application, we weren't able to approve it at this time. We review each application carefully to make sure the quality stays high for students.
            </p>
            ${notesBlock}
            <p style="font-size:15px;color:#6B6B6B;line-height:1.7;margin:0 0 32px;">
              You're welcome to reapply once you've addressed any feedback above.
            </p>
            <div style="text-align:center;margin-bottom:32px;">
              <a href="${appUrl}/apply-to-sell" style="display:inline-block;background:#C9A84C;color:#FFFFFF;text-decoration:none;font-size:15px;font-weight:700;padding:14px 36px;border-radius:50px;letter-spacing:0.01em;">
                Reapply
              </a>
            </div>
            <div style="border-top:1px solid #F0ECE6;padding-top:24px;text-align:center;">
              <p style="font-size:13px;color:#9B9B9B;margin:0;line-height:1.6;">
                Keep studying hard. You've got this.
              </p>
            </div>
          </td>
        </tr>
      </table>
      <p style="font-size:12px;color:#B0A99E;margin-top:24px;">druip.co.za &nbsp;&middot;&nbsp; Built for South African students</p>
    </td></tr>
  </table>
</body>
</html>`
}
