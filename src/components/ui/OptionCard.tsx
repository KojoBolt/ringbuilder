
import type { ReactNode } from 'react'
import { Check } from 'lucide-react'

export type OptionCardProps = {
  /** Unique value represented by this option */
  value: string

  /** Visible option name */
  label: string

  /** Whether the option is currently selected */
  selected: boolean

  /** Called when the user selects the option */
  onSelect: (value: string) => void

  /** Optional image, such as a diamond PNG */
  image?: string

  /** Accessible description for the image */
  imageAlt?: string

  /** Optional icon or custom illustration */
  icon?: ReactNode

  /** Optional supporting text */
  description?: string

  /** Optional price adjustment */
  priceLabel?: string

  /** Controls the visual proportions */
  variant?: 'diamond' | 'setting' | 'metal' | 'default'

  /** Disables interaction */
  disabled?: boolean

  /** Additional Tailwind classes */
  className?: string
}

export default function OptionCard({
  value,
  label,
  selected,
  onSelect,
  image,
  imageAlt,
  icon,
  description,
  priceLabel,
  variant = 'default',
  disabled = false,
  className = '',
}: OptionCardProps) {
  const isDiamond = variant === 'diamond'
  const isMetal = variant === 'metal'

  return (
    <button
      type="button"
      aria-pressed={selected}
      aria-label={label}
      disabled={disabled}
      onClick={() => onSelect(value)}
      className={[
        'group relative flex w-full min-w-0 flex-col items-center',
        'border bg-background text-center',
        'transition-all duration-200 ease-out',
        'focus-visible:outline-2 focus-visible:outline-offset-2',
        'focus-visible:outline-[#b58e46]',
        'disabled:cursor-not-allowed disabled:opacity-40',
        selected
          ? 'border-[#b58e46] bg-[#b58e46]/[0.045] shadow-[inset_0_0_0_1px_#b58e46]'
          : 'border-border hover:border-[#b58e46]/60 hover:bg-secondary/40',
        'rounded-lg',
        isDiamond ? 'px-3 pb-4 pt-5' : 'px-3 py-4',
        className,
      ].join(' ')}
    >
      {/* Selected indicator */}
      {selected && (
        <span
          aria-hidden="true"
          className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-[#b58e46] text-white"
        >
          <Check size={12} strokeWidth={2.2} />
        </span>
      )}

      {/* Image or icon */}
      {(image || icon) && (
        <div
          className={[
            'flex w-full items-center justify-center',
            isDiamond
              ? 'mb-3 aspect-square max-h-[112px]'
              : isMetal
                ? 'mb-3 h-12'
                : 'mb-3 h-[88px]',
          ].join(' ')}
        >
          {image ? (
            <img
              src={image}
              alt={imageAlt ?? label}
              loading="lazy"
              draggable={false}
              className={[
                'block max-h-full max-w-full object-contain',
                'transition-transform duration-300',
                'group-hover:scale-[1.05]',
                isDiamond ? 'h-[90%] w-[90%]' : 'h-full w-full',
              ].join(' ')}
            />
          ) : (
            <span
              aria-hidden="true"
              className="flex h-full w-full items-center justify-center"
            >
              {icon}
            </span>
          )}
        </div>
      )}

      {/* Option label */}
      <span
        className={[
          'block text-[11px] font-semibold uppercase',
          'tracking-[0.1em] leading-5',
          selected ? 'text-foreground' : 'text-foreground/80',
        ].join(' ')}
      >
        {label}
      </span>

      {/* Optional description */}
      {description && (
        <span className="mt-1 block text-[10px] leading-relaxed text-muted-foreground">
          {description}
        </span>
      )}

      {/* Optional price adjustment */}
      {priceLabel && (
        <span
          className={[
            'mt-2 block text-[11px] font-medium',
            selected ? 'text-[#b58e46]' : 'text-muted-foreground',
          ].join(' ')}
        >
          {priceLabel}
        </span>
      )}
    </button>
  )
}