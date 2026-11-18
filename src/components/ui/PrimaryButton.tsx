import type { ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'

type ButtonVariant = 'primary' | 'secondary' | 'ghost'

const variants: Record<ButtonVariant, string> = {
	primary:
		'bg-foreground text-background hover:bg-foreground/85 focus-visible:outline-foreground',
	secondary:
		'border border-border bg-transparent text-foreground hover:border-foreground/40 hover:bg-secondary/60 focus-visible:outline-foreground',
	ghost:
		'bg-transparent text-muted-foreground hover:text-foreground focus-visible:outline-foreground',
}

type PrimaryButtonProps = {
	children: ReactNode
	onClick?: () => void
	type?: 'button' | 'submit' | 'reset'
	variant?: ButtonVariant
	disabled?: boolean
	icon?: LucideIcon
	className?: string
}

const PrimaryButton = ({
	children,
	onClick,
	type = 'button',
	variant = 'primary',
	disabled = false,
	icon: Icon,
	className = '',
}: PrimaryButtonProps) => (
	<button
		type={type}
		onClick={onClick}
		disabled={disabled}
		className={`inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-medium tracking-wide transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-40 ${variants[variant]} ${className}`}
	>
		{children}
		{Icon && <Icon className="size-4" />}
	</button>
)

export default PrimaryButton
