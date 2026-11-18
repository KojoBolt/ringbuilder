import { useNavigate } from 'react-router-dom'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import RingViewer from '../components/ring/RingViewer'
import PrimaryButton from '../components/ui/PrimaryButton'
import useRingStore from '../store/useRingStore'
import {
	engravingLimit,
	formatPrice,
	getRingPrice,
	sizes,
} from '../data/ringOptions'

const Personalise = () => {
	const navigate = useNavigate()
	const selection = useRingStore()
	const price = getRingPrice(selection)
	const remaining = engravingLimit - selection.engraving.length

	return (
		<div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-12">
			<section className="order-2 space-y-10 lg:order-1">
				<header>
					<p className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground">
						Step 03
					</p>
					<h1 className="mt-2 font-display text-3xl leading-tight sm:text-4xl">
						Personalise
					</h1>
					<p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
						Add a private message and confirm the fit. Engravings are set inside
						the band, where only the wearer will see them.
					</p>
				</header>

				<div>
					<div className="flex items-baseline justify-between">
						<label
							htmlFor="engraving"
							className="text-sm font-medium uppercase tracking-[0.14em]"
						>
							Engraving
						</label>
						<span className="text-xs tabular-nums text-muted-foreground">
							{remaining} characters left
						</span>
					</div>
					<input
						id="engraving"
						type="text"
						value={selection.engraving}
						onChange={(event) =>
							selection.setEngraving(
								event.target.value.slice(0, engravingLimit),
							)
						}
						maxLength={engravingLimit}
						placeholder="Forever, always"
						className="mt-4 w-full rounded-xl border border-border bg-card px-4 py-3 text-sm outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-gold focus:ring-2 focus:ring-gold/20"
					/>
					<p className="mt-2 text-xs text-muted-foreground">
						Optional · up to {engravingLimit} characters, included with every
						ring.
					</p>
					{selection.engraving && (
						<p className="mt-4 rounded-lg border border-gold/30 bg-gold/5 px-3 py-2 text-xs text-muted-foreground">
							Inside the band:{' '}
							<span className="font-serif italic text-foreground">
								“{selection.engraving}”
							</span>
						</p>
					)}
				</div>

				<div>
					<div className="flex items-baseline justify-between">
						<h2 className="text-sm font-medium uppercase tracking-[0.14em]">
							Ring size
						</h2>
						<span className="text-xs text-muted-foreground">
							US size {selection.size}
						</span>
					</div>
					<div className="mt-4 flex flex-wrap gap-2">
						{sizes.map((size) => (
							<button
								key={size}
								type="button"
								onClick={() => selection.select('size', size)}
								aria-pressed={selection.size === size}
								className={`grid size-11 place-items-center rounded-full border text-sm tabular-nums transition-colors ${
									selection.size === size
										? 'border-foreground bg-foreground text-background'
										: 'border-border bg-card text-muted-foreground hover:border-foreground/30 hover:text-foreground'
								}`}
							>
								{size}
							</button>
						))}
					</div>
					<p className="mt-3 text-xs text-muted-foreground">
						Unsure of your size? We send a complimentary sizer with every order.
					</p>
				</div>

				<div className="flex flex-wrap items-center justify-between gap-4 border-t border-border pt-6">
					<button
						type="button"
						onClick={() => navigate('/make-it-yours')}
						className="inline-flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
					>
						<ArrowLeft className="size-3.5" />
						Back
					</button>

					<div className="flex items-center gap-6">
						<div className="text-right">
							<p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
								Running total
							</p>
							<p className="font-display text-2xl">{formatPrice(price)}</p>
						</div>
						<PrimaryButton
							onClick={() => navigate('/your-ring')}
							icon={ArrowRight}
						>
							See your ring
						</PrimaryButton>
					</div>
				</div>
			</section>

			<aside className="order-1 lg:order-2">
				<RingViewer className="h-[380px] sm:h-[460px] lg:sticky lg:top-24 lg:h-[min(640px,calc(100vh-8rem))]" />
			</aside>
		</div>
	)
}

export default Personalise
