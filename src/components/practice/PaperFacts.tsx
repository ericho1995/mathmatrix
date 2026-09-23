import type { PaperSummary } from '@/lib/catalogue'

/**
 * What a paper contains — sections, questions, time — drawn from metadata only.
 *
 * Shown on the lock screen as well as the download screen: telling someone
 * what they are about to pay for is the cheapest trust there is, and it is
 * the question a parent asks first ("is this a real, full-length paper?").
 */
export default function PaperFacts({ summary }: { summary: PaperSummary }) {
  const totalMinutes = summary.minutes + (summary.readingMinutes ?? 0)
  // A Reading paper is one sitting; its sections are the texts in the magazine.
  const timedSections = summary.sections.some(s => s.minutes > 0)
  return (
    <div className="card text-left mb-6">
      <div className="flex flex-wrap gap-x-6 gap-y-1 mb-3">
        <Fact value={summary.questions} label="questions" />
        <Fact value={`${summary.minutes} min`} label={summary.readingMinutes ? 'writing time' : 'allowed'} />
        {summary.readingMinutes ? <Fact value={`${summary.readingMinutes} min`} label="reading time" /> : null}
      </div>
      {!timedSections && summary.sections.length > 1 && (
        <p className="text-xs font-medium uppercase tracking-wide text-gray-400 mb-2">
          {summary.magazine ? 'Texts in the magazine' : 'Texts in this paper'}
        </p>
      )}
      <ul className="flex flex-col gap-1.5">
        {summary.sections.map(s => {
          // Numeracy section titles already say which kind they are.
          const titleSaysIt = /calculator|technology/i.test(s.title)
          return (
          <li key={s.title} className="flex items-baseline justify-between gap-3 text-sm">
            <span className="text-gray-700">
              {s.title}
              {!titleSaysIt && s.calculator === true && <span className="text-xs text-gray-400"> · calculator</span>}
              {!titleSaysIt && s.calculator === false && <span className="text-xs text-gray-400"> · no calculator</span>}
            </span>
            <span className="text-xs text-gray-400 whitespace-nowrap">
              {s.questions} Q{s.minutes > 0 ? ` · ${s.minutes} min` : ''}
            </span>
          </li>
          )
        })}
      </ul>
      <p className="text-xs text-gray-400 mt-3">
        {summary.sections.length > 1 && timedSections ? `About ${Math.round(totalMinutes / 5) * 5} minutes in total. ` : ''}
        {summary.magazine ? 'Comes with a colour Reading Magazine and a separate answer key.' : 'Separate answer key included.'}
      </p>
    </div>
  )
}

function Fact({ value, label }: { value: string | number; label: string }) {
  return (
    <p className="text-sm">
      <span className="font-medium text-gray-900">{value}</span> <span className="text-gray-400">{label}</span>
    </p>
  )
}
