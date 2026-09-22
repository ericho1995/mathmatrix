import Link from 'next/link'
import type { Route } from 'next'
import CheckoutButton from '@/components/practice/CheckoutButton'
import { PLANS, perMonth, savingPercent, type PlanId } from '@/lib/pricing'
import { isPlanSellable } from '@/lib/stripe'
import type { ActivePlan } from '@/lib/auth/access'

/**
 * The three plan cards, side by side — the layout streaming services use,
 * because it answers "how much, and what if I commit longer?" in one glance.
 *
 * The month is the full price; each longer plan shows its per-month price and
 * the saving against paying monthly, worked out from the prices rather than
 * typed in, so the maths on the card cannot be wrong.
 */
export default function PlanCards({ current }: { current: ActivePlan | null }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-stretch">
      {PLANS.map(plan => {
        const featured = plan.id === 'quarter'
        const saving = savingPercent(plan)
        const isCurrent = current?.plan?.id === plan.id
        return (
          <div
            key={plan.id}
            className={`card relative flex flex-col text-left ${
              featured ? 'border-brand-500 ring-2 ring-brand-500 md:-my-2 md:py-8' : ''
            }`}
          >
            {plan.badge && (
              <span
                className={`absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full px-3 py-0.5 text-xs font-medium ${
                  featured ? 'bg-brand-600 text-white' : 'bg-teal-600 text-white'
                }`}
              >
                {plan.badge}
              </span>
            )}
            <p className="text-sm font-medium text-gray-500">{plan.name}</p>
            <p className="mt-2 flex items-baseline gap-1">
              <span className="text-4xl font-medium tracking-tight">${plan.priceAud}</span>
              <span className="text-sm text-gray-400">{plan.months === 1 ? '/ month' : `/ ${plan.months} months`}</span>
            </p>
            <p className="text-xs text-gray-400 mt-1">{plan.billing}</p>
            <p className={`text-sm mt-4 mb-6 flex-1 ${saving > 0 ? 'text-teal-700 font-medium' : 'text-gray-500'}`}>
              {saving > 0 ? `${perMonth(plan)} a month — save ${saving}%` : 'Full flexibility, cancel anytime'}
            </p>
            {isCurrent ? (
              <p className="text-sm text-teal-600 text-center py-2">✓ Your current plan</p>
            ) : current ? (
              <Link href={'/account' as Route} className="btn-secondary w-full block text-center text-sm">
                Switch plan in your account
              </Link>
            ) : (
              <CheckoutButton
                purchase={{ plan: plan.id as PlanId }}
                label={`Choose ${plan.name}`}
                sellable={isPlanSellable(plan.id)}
                variant={featured ? 'primary' : 'secondary'}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}
