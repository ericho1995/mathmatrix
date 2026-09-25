import { completeAuthLink } from '@/lib/auth/completeAuthLink'

// Kept for links in emails sent before /auth/confirm existed. Both routes run
// the same handler; see completeAuthLink.
export async function GET(request: Request) {
  return completeAuthLink(request)
}
