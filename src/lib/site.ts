/**
 * Business details shown across the site.
 *
 * The support address comes from the environment and has no fallback on
 * purpose. Printing a plausible-looking address that nobody reads is worse
 * than printing none: a customer whose purchase did not unlock writes to it,
 * hears nothing, and files a chargeback. Until it is set, contact copy hides.
 *
 * Set NEXT_PUBLIC_SUPPORT_EMAIL in Vercel to turn it on everywhere at once.
 */
export const SUPPORT_EMAIL: string | null = process.env.NEXT_PUBLIC_SUPPORT_EMAIL?.trim() || null

export const SITE_NAME = 'PrepNest'

export const SITE_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://prepnest.com.au'
