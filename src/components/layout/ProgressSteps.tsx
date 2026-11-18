
import { Check } from 'lucide-react'

export const RING_STEPS = [
  {
    id: 1,
    label: 'Create Your Ring',
    shortLabel: 'Create',
    path: '/',
  },
  {
    id: 2,
    label: 'Make It Yours',
    shortLabel: 'Make It Yours',
    path: '/make-it-yours',
  },
  {
    id: 3,
    label: 'Personalise',
    shortLabel: 'Personalise',
    path: '/personalise',
  },
  {
    id: 4,
    label: 'Your DR Gold Ring',
    shortLabel: 'Your Ring',
    path: '/your-ring',
  },
] as const

export type RingStep = 1 | 2 | 3 | 4

type ProgressStepsProps = {
  currentStep: RingStep
  onStepClick?: (step: RingStep) => void
  allowCompletedNavigation?: boolean
  className?: string
}

export default function ProgressSteps({
  currentStep,
  onStepClick,
  allowCompletedNavigation = true,
  className = '',
}: ProgressStepsProps) {
  const current = RING_STEPS[currentStep - 1]

  return (
    <section
      aria-label="Ring builder progress"
      className={`w-full border-b border-border bg-background ${className}`}
    >
      <div className="mx-auto max-w-[1300px] px-5 py-6 md:px-8 md:py-8">

        {/* Mobile heading */}
        <div className="mb-5 flex items-center justify-between md:hidden">
          <div>
            <p className="mb-1 text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
              Your Bespoke Journey
            </p>

            <h2 className="font-serif text-xl text-foreground">
              {current.label}
            </h2>
          </div>

          <span className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
            {String(currentStep).padStart(2, '0')}
            <span className="mx-1 text-border">/</span>
            04
          </span>
        </div>

        {/* Steps */}
        <nav aria-label="Configuration steps">
          <ol className="grid grid-cols-4 gap-2 md:gap-5">
            {RING_STEPS.map((step) => {
              const isCompleted = step.id < currentStep
              const isActive = step.id === currentStep

              const isClickable =
                Boolean(onStepClick) &&
                allowCompletedNavigation &&
                isCompleted

              const content = (
                <>
                  {/* Progress line */}
                  <span
                    className={[
                      'mb-4 block h-[2px] w-full transition-colors duration-300',
                      isActive || isCompleted
                        ? 'bg-[#b58e46]'
                        : 'bg-border',
                    ].join(' ')}
                  />

                  <span className="flex flex-col items-center gap-2 md:flex-row md:gap-3">
                    {/* Step number */}
                    <span
                      className={[
                        'flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-[10px] font-semibold transition-all duration-300',
                        isActive
                          ? 'border-[#b58e46] bg-[#b58e46] text-white'
                          : isCompleted
                            ? 'border-[#b58e46] bg-transparent text-[#b58e46]'
                            : 'border-border bg-transparent text-muted-foreground',
                      ].join(' ')}
                    >
                      {isCompleted ? (
                        <Check size={14} strokeWidth={1.8} />
                      ) : (
                        String(step.id).padStart(2, '0')
                      )}
                    </span>

                    {/* Label */}
                    <span
                      className={[
                        'hidden text-left text-[11px] font-medium uppercase tracking-[0.1em] md:block',
                        isActive
                          ? 'text-foreground'
                          : isCompleted
                            ? 'text-foreground/70'
                            : 'text-muted-foreground',
                      ].join(' ')}
                    >
                      {step.label}
                    </span>

                    {/* Accessible mobile label */}
                    <span className="sr-only md:hidden">
                      {step.label}
                      {isActive
                        ? ', current step'
                        : isCompleted
                          ? ', completed'
                          : ', upcoming'}
                    </span>
                  </span>
                </>
              )

              return (
                <li key={step.id} className="min-w-0">
                  {isClickable ? (
                    <button
                      type="button"
                      onClick={() => onStepClick?.(step.id)}
                      aria-label={`Return to ${step.label}`}
                      className="group block w-full cursor-pointer text-left focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#b58e46]"
                    >
                      {content}
                    </button>
                  ) : (
                    <div
                      aria-current={isActive ? 'step' : undefined}
                      className="block w-full"
                    >
                      {content}
                    </div>
                  )}
                </li>
              )
            })}
          </ol>
        </nav>
      </div>
    </section>
  )
}
