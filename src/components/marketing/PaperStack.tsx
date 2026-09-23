import Image from 'next/image'
import { BarChartHorizontal, FileCheck } from 'lucide-react'
import { SAMPLES, type SamplePage } from '@/lib/samples'

/**
 * The homepage hero picture: three real pages from the free sample papers — the
 * colour Reading Magazine, a Numeracy page and its answer key — fanned out.
 *
 * It replaced a stock photo of a student. The papers are the product, and a
 * parent deciding whether $119 is worth it learns more from the pages than from
 * a stranger at a desk.
 */
export default function PaperStack() {
  return (
    <div className="relative w-full max-w-md mx-auto lg:max-w-none aspect-[10/9]">
      {/* Backdrop: the brand grid used in the ads, fading out at the edges. */}
      <div
        aria-hidden
        className="absolute inset-[6%] rounded-[2rem] bg-gradient-to-br from-brand-50 via-white to-brand-50 border border-brand-100/70"
        style={{
          backgroundImage:
            'linear-gradient(rgba(24,95,165,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(24,95,165,0.06) 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }}
      />

      <Sheet sample={SAMPLES.readingCover} className="left-[3%] top-[12%] w-[44%] -rotate-[9deg]" />
      <Sheet sample={SAMPLES.answerKey} className="right-[2%] top-[14%] w-[44%] rotate-[8deg]" />
      <Sheet sample={SAMPLES.numeracy} className="left-[26%] top-[4%] w-[48%] -rotate-[1.5deg] z-10" priority />

      <div className="absolute z-20 left-[2%] bottom-[9%] flex items-center gap-2 rounded-full bg-white/95 px-3.5 py-2 text-xs sm:text-sm font-medium text-gray-800 shadow-lg ring-1 ring-black/5">
        <span className="w-6 h-6 rounded-full bg-teal-50 text-teal-600 flex items-center justify-center">
          <FileCheck className="w-3.5 h-3.5" />
        </span>
        Every answer explained
      </div>
      <div className="absolute z-20 right-[3%] bottom-[3%] flex items-center gap-2 rounded-full bg-white/95 px-3.5 py-2 text-xs sm:text-sm font-medium text-gray-800 shadow-lg ring-1 ring-black/5">
        <span className="w-6 h-6 rounded-full bg-brand-50 text-brand-600 flex items-center justify-center">
          <BarChartHorizontal className="w-3.5 h-3.5" />
        </span>
        Topic report in minutes
      </div>
    </div>
  )
}

function Sheet({ sample, className, priority }: { sample: SamplePage; className: string; priority?: boolean }) {
  return (
    <div
      className={`absolute overflow-hidden rounded-md bg-white ring-1 ring-black/5 shadow-[0_28px_50px_-18px_rgba(4,44,83,0.45)] ${className}`}
    >
      <Image
        src={sample.image}
        alt={sample.alt}
        sizes="(min-width: 1024px) 240px, 45vw"
        placeholder="blur"
        priority={priority}
        className="w-full h-auto"
      />
    </div>
  )
}
