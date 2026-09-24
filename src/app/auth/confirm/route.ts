import { completeAuthLink } from '@/lib/auth/completeAuthLink'

// The target of every link in PrepNest's auth emails. See completeAuthLink.
export async function GET(request: Request) {
  return completeAuthLink(request)
}
