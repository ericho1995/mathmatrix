import { notFound } from 'next/navigation'
import Bird, { BirdMark, type BirdPose } from '@/components/brand/Bird'
import Logo from '@/components/ui/Logo'
import { BlockSticker, BookSticker, CheckSticker, Cloud, MedalSticker, PencilSticker, Sparkle, Star } from '@/components/brand/Decor'

/** Development only: every pose of the bird, the mark at small sizes, and the logo. */
export default function DevBrandPage() {
  if (process.env.NODE_ENV === 'production') notFound()
  const poses: BirdPose[] = ['nest', 'cheer', 'think', 'read', 'search', 'trophy']
  return (
    <main className="max-w-5xl mx-auto px-4 py-10 space-y-10">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {poses.map(p => (
          <div key={p} className="card text-center">
            <Bird pose={p} className="w-40 h-40 mx-auto" />
            <p className="font-bold mt-2">{p}</p>
          </div>
        ))}
      </div>
      <div className="card flex items-end gap-6">
        {[16, 24, 32, 40, 64, 120].map(s => (
          <div key={s} className="text-center">
            <style>{`.m${s}{width:${s}px;height:${s}px}`}</style>
            <span className={`m${s} inline-block`}><BirdMark className="w-full h-full" /></span>
            <p className="text-xs text-gray-500">{s}px</p>
          </div>
        ))}
      </div>
      <div className="card flex flex-wrap items-center gap-6 bg-sky">
        <Star className="w-12 h-12" />
        <Sparkle className="w-10 h-10" />
        <Cloud className="w-24 h-12" />
        <PencilSticker className="w-16 h-16" />
        <BlockSticker className="w-14 h-14" />
        <BlockSticker className="w-14 h-14" letter="B" fill="#CE82FF" />
        <BookSticker className="w-16 h-12" />
        <MedalSticker className="w-12 h-16" />
        <CheckSticker className="w-12 h-12" />
      </div>
      <div className="card flex flex-wrap items-center gap-10">
        <Logo />
        <Logo size="sm" />
        <button className="btn-primary">Start the free test</button>
        <button className="btn-secondary">I already have an account</button>
      </div>
    </main>
  )
}
