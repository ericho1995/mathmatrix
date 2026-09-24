# Auth emails: sent by PrepNest, branded, and never to localhost

Sign-up confirmations and password resets are sent by Supabase. Out of the box
they come from Supabase's shared mail server, carry Supabase's plain template,
and are capped at a few emails an hour. This sets them up to come from
`PrepNest <hello@prepnest.com.au>` with PrepNest's own design.

Do the steps in order. **Step 1 must be live before step 5**, because the new
templates link to `/auth/confirm`, which only exists once this code is deployed.

## 1. Deploy the code

Merge the PR that adds `src/app/auth/confirm/route.ts`. Check it is live:
`https://prepnest.com.au/auth/confirm?token_hash=test&type=email` should
redirect to the sign-in page with "That link has expired or has already been
used".

## 2. Fix the Site URL (this is what sent customers to localhost)

Supabase → **Authentication → URL Configuration**

- **Site URL:** `https://prepnest.com.au`
- **Redirect URLs:** add `https://prepnest.com.au/**`. Keep
  `http://localhost:3000/**` for local development.

Until 2026-09-24 the Site URL was `http://localhost:3000` and no production URL
was allow-listed, so after confirming, every customer was redirected to
localhost. The new templates below do not depend on this setting, but other
Supabase flows do.

## 3. Create the sending service (Resend)

Resend's free plan covers 3,000 emails a month.

1. Create an account at resend.com.
2. **Domains → Add domain** → `prepnest.com.au`, region **Tokyo
   (ap-northeast-1)**, the closest to Australia.
3. Resend lists three or four DNS records. Add each one in **Porkbun → Domain
   Management → prepnest.com.au → DNS**:
   - an **MX** record on host `send`
   - a **TXT** record on host `send` (`v=spf1 include:amazonses.com ~all`)
   - a **TXT** record on host `resend._domainkey` (the DKIM key)
   - optional but recommended: a **TXT** record on host `_dmarc` with
     `v=DMARC1; p=none;`

   In Porkbun, type only the host part (`send`, not `send.prepnest.com.au`).
   **Do not change** the existing MX records (`fwd1`/`fwd2.porkbun.com`) or the
   root SPF record: they run the email forwarding for prepnest.com.au, and
   Resend's records sit on the `send` subdomain so they don't clash.
4. Back in Resend, press **Verify**. DNS can take a few minutes.
5. **API Keys → Create API key**: name it `Supabase SMTP`, permission
   **Sending access**, domain `prepnest.com.au`. Copy it; it is shown once.

So replies reach you, set up forwarding for `hello@prepnest.com.au` in
**Porkbun → Email Forwarding** if it isn't already.

## 4. Point Supabase at Resend

Supabase → **Authentication → Emails → SMTP Settings** → enable custom SMTP:

| Field | Value |
| --- | --- |
| Sender email | `hello@prepnest.com.au` |
| Sender name | `PrepNest` |
| Host | `smtp.resend.com` |
| Port | `465` |
| Username | `resend` |
| Password | the API key from step 3 |

Then **Authentication → Rate Limits**: raise **emails sent per hour** from the
default to about `100`.

## 5. Install the templates

Supabase → **Authentication → Emails → Templates**. For each template in the
table, set the subject and paste the whole file into the message body:

| Template | Subject | File |
| --- | --- | --- |
| Confirm signup | Confirm your PrepNest account | `supabase/email-templates/confirm-signup.html` |
| Reset password | Reset your PrepNest password | `supabase/email-templates/reset-password.html` |
| Magic link | Your PrepNest sign-in link | `supabase/email-templates/magic-link.html` |
| Change email address | Confirm your new PrepNest email address | `supabase/email-templates/change-email.html` |
| Invite user | You’ve been invited to PrepNest | `supabase/email-templates/invite.html` |
| Reauthentication | Your PrepNest verification code | `supabase/email-templates/reauthentication.html` |

To change the design or wording, edit `scripts/build-email-templates.mjs`, run
`node scripts/build-email-templates.mjs`, and paste the regenerated files again.

## 6. Test it

1. Sign up at `https://prepnest.com.au/auth/register` with an address you can
   read. The email should come from **PrepNest <hello@prepnest.com.au>**.
2. Open the link **on a different device** (for example, your phone). You
   should land on `prepnest.com.au/practice`, signed in.
3. Click the same link again. You should see "That link has expired or has
   already been used" on the sign-in page, not an error.
4. Request a password reset and follow it through to choosing a new password.

If a message lands in spam, check the domain shows **Verified** in Resend and
that the DKIM record was copied exactly.
