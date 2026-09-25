// Writes PrepNest's branded auth emails to supabase/email-templates/.
//
//   node scripts/build-email-templates.mjs
//
// Supabase sends these (sign-up confirmation, password reset and so on) once
// they are pasted into Authentication → Emails → Templates. Setup, including
// the SMTP sender that makes them come from PrepNest rather than Supabase, is
// in docs/AUTH-EMAILS.md.
//
// Every link points at https://prepnest.com.au/auth/confirm with a token hash,
// which the app verifies itself (src/lib/auth/completeAuthLink.ts). The domain
// is written out rather than taken from {{ .SiteURL }}, so a wrong Site URL in
// the Supabase dashboard can never again send a customer to localhost.
//
// Email HTML is its own dialect: tables for layout, inline styles, no web
// fonts, no SVG, no images the mail client might block. The logo is the same
// blue "P" square as the site header, built from a table cell.
import { mkdirSync, writeFileSync } from 'node:fs'

const SITE = 'https://prepnest.com.au'
const OUT = 'supabase/email-templates'

const C = {
  page: '#F3F6FA',
  card: '#FFFFFF',
  ink: '#111827',
  body: '#374151',
  muted: '#6B7280',
  faint: '#9CA3AF',
  rule: '#E5E7EB',
  brand: '#185FA5',
  brandLight: '#378ADD',
  brandTint: '#E6F1FB',
}
const FONT = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"

const button = (href, label) => `
<table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: 28px 0 8px;">
  <tr>
    <td style="border-radius: 10px; background: ${C.brand};">
      <a href="${href}" style="display: inline-block; padding: 14px 28px; font-family: ${FONT}; font-size: 15px; font-weight: 600; color: #FFFFFF; text-decoration: none; border-radius: 10px;">${label}</a>
    </td>
  </tr>
</table>`

const fallbackLink = href => `
<p style="margin: 24px 0 0; font-family: ${FONT}; font-size: 13px; line-height: 20px; color: ${C.muted};">
  Button not working? Copy this link into your browser:<br>
  <a href="${href}" style="color: ${C.brand}; word-break: break-all;">${href}</a>
</p>`

const p = text =>
  `<p style="margin: 0 0 16px; font-family: ${FONT}; font-size: 15px; line-height: 24px; color: ${C.body};">${text}</p>`

function layout({ preheader, heading, body, note }) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="light">
<title>${heading}</title>
</head>
<body style="margin: 0; padding: 0; background: ${C.page};">
<div style="display: none; max-height: 0; overflow: hidden; opacity: 0; color: transparent;">${preheader}</div>
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background: ${C.page};">
  <tr>
    <td align="center" style="padding: 32px 16px;">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width: 560px;">
        <tr>
          <td style="padding: 0 4px 20px;">
            <table role="presentation" cellspacing="0" cellpadding="0" border="0">
              <tr>
                <td width="34" height="34" align="center" valign="middle" style="width: 34px; height: 34px; background: ${C.brand}; border-radius: 9px; font-family: ${FONT}; font-size: 17px; font-weight: 700; color: #FFFFFF;">P</td>
                <td style="padding-left: 10px; font-family: ${FONT}; font-size: 20px; font-weight: 600; letter-spacing: -0.3px; color: ${C.ink};">Prep<span style="color: ${C.brandLight};">Nest</span></td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td style="background: ${C.card}; border: 1px solid ${C.rule}; border-radius: 16px; padding: 36px 36px 32px;">
            <h1 style="margin: 0 0 16px; font-family: ${FONT}; font-size: 22px; line-height: 30px; font-weight: 600; color: ${C.ink};">${heading}</h1>
            ${body}
          </td>
        </tr>
        <tr>
          <td style="padding: 20px 8px 0;">
            ${note ? `<p style="margin: 0 0 12px; font-family: ${FONT}; font-size: 13px; line-height: 20px; color: ${C.muted};">${note}</p>` : ''}
            <p style="margin: 0; font-family: ${FONT}; font-size: 12px; line-height: 18px; color: ${C.faint};">
              PrepNest · Practice exams for NAPLAN and VCE<br>
              <a href="${SITE}" style="color: ${C.faint}; text-decoration: underline;">prepnest.com.au</a>
            </p>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
</body>
</html>
`
}

const confirm = (query) => `${SITE}/auth/confirm?token_hash={{ .TokenHash }}&${query}`

const TEMPLATES = [
  {
    file: 'confirm-signup.html',
    dashboard: 'Confirm signup',
    subject: 'Confirm your PrepNest account',
    html: (() => {
      const href = confirm('type=email&redirect_to={{ .RedirectTo }}')
      return layout({
        preheader: 'One click and your PrepNest account is ready.',
        heading: 'Confirm your email',
        body:
          p('Thanks for joining PrepNest. Confirm your email address to finish setting up your account, then download your free practice papers.') +
          button(href, 'Confirm my email') +
          fallbackLink(href),
        note: 'If you didn’t create a PrepNest account, you can ignore this email.',
      })
    })(),
  },
  {
    file: 'reset-password.html',
    dashboard: 'Reset password',
    subject: 'Reset your PrepNest password',
    html: (() => {
      const href = confirm('type=recovery&next=/auth/reset-password')
      return layout({
        preheader: 'Choose a new password for your PrepNest account.',
        heading: 'Reset your password',
        body:
          p('We received a request to reset the password for the PrepNest account {{ .Email }}.') +
          p('Use the button below to choose a new one. For your security, the link works once and expires after a short time.') +
          button(href, 'Choose a new password') +
          fallbackLink(href),
        note: 'If you didn’t ask to reset your password, you can ignore this email. Your password won’t change.',
      })
    })(),
  },
  {
    file: 'magic-link.html',
    dashboard: 'Magic link',
    subject: 'Your PrepNest sign-in link',
    html: (() => {
      const href = confirm('type=email&redirect_to={{ .RedirectTo }}')
      return layout({
        preheader: 'Sign in to PrepNest with one click.',
        heading: 'Sign in to PrepNest',
        body: p('Use the button below to sign in. The link works once and expires after a short time.') + button(href, 'Sign in') + fallbackLink(href),
        note: 'If you didn’t try to sign in, you can ignore this email.',
      })
    })(),
  },
  {
    file: 'change-email.html',
    dashboard: 'Change email address',
    subject: 'Confirm your new PrepNest email address',
    html: (() => {
      const href = confirm('type=email_change&next=/account')
      return layout({
        preheader: 'Confirm the new email address for your PrepNest account.',
        heading: 'Confirm your new email address',
        body:
          p('You asked to change the email address on your PrepNest account from {{ .Email }} to {{ .NewEmail }}.') +
          p('Confirm the change using the button below.') +
          button(href, 'Confirm new email') +
          fallbackLink(href),
        note: 'If you didn’t ask for this change, sign in and change your password straight away.',
      })
    })(),
  },
  {
    file: 'invite.html',
    dashboard: 'Invite user',
    subject: 'You’ve been invited to PrepNest',
    html: (() => {
      const href = confirm('type=invite&next=/auth/reset-password')
      return layout({
        preheader: 'Accept your invitation and choose a password.',
        heading: 'You’re invited to PrepNest',
        body:
          p('You’ve been invited to create a PrepNest account for printable NAPLAN and VCE practice exams, each with a full answer key.') +
          p('Accept the invitation to choose your password.') +
          button(href, 'Accept invitation') +
          fallbackLink(href),
        note: 'If you weren’t expecting this invitation, you can ignore this email.',
      })
    })(),
  },
  {
    file: 'reauthentication.html',
    dashboard: 'Reauthentication',
    subject: 'Your PrepNest verification code',
    html: layout({
      preheader: 'Your PrepNest verification code.',
      heading: 'Confirm it’s you',
      body:
        p('Enter this code in PrepNest to continue:') +
        `<p style="margin: 8px 0 8px; font-family: ${FONT}; font-size: 30px; font-weight: 700; letter-spacing: 6px; color: ${C.ink}; background: ${C.brandTint}; border-radius: 12px; padding: 16px 20px; text-align: center;">{{ .Token }}</p>` +
        p('The code expires after a short time.'),
      note: 'If you didn’t request this code, you can ignore this email.',
    }),
  },
]

mkdirSync(OUT, { recursive: true })
const index = ['# PrepNest auth email templates', '', 'Generated by `node scripts/build-email-templates.mjs`. Setup: docs/AUTH-EMAILS.md.', '', '| Supabase template | Subject | File |', '| --- | --- | --- |']
for (const t of TEMPLATES) {
  writeFileSync(`${OUT}/${t.file}`, t.html)
  index.push(`| ${t.dashboard} | ${t.subject} | \`${t.file}\` |`)
}
writeFileSync(`${OUT}/README.md`, index.join('\n') + '\n')
console.log(`Wrote ${TEMPLATES.length} templates to ${OUT}/`)
