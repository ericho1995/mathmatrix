/**
 * Shown when a page's data could not be read, so a failure is never rendered as
 * a legitimate-looking empty state.
 *
 * Deliberately says nothing about the cause. The detail is in the server logs;
 * putting a Postgres message on the page tells an attacker about the schema and
 * tells a parent nothing useful.
 */
export default function DataLoadError({
  title,
  what,
}: {
  title: string
  /** What failed to load, in the reader's words — "your child's progress". */
  what: string
}) {
  return (
    <main className="max-w-md mx-auto px-4 py-10 flex-1 w-full">
      <h1 className="text-2xl font-medium tracking-tight mb-2">{title}</h1>
      <div className="card">
        <p className="text-sm text-gray-700 mb-2">We couldn&apos;t load {what} just now.</p>
        <p className="text-sm text-gray-500">
          This is a problem on our side, not with your account — nothing has been lost. Please
          refresh in a moment, and contact us if it keeps happening.
        </p>
      </div>
    </main>
  )
}
