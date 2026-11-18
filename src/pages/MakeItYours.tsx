import { useNavigate } from 'react-router-dom'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import RingViewer from '../components/ring/RingViewer'
import OptionCard from '../components/ui/OptionCard'
import PrimaryButton from '../components/ui/PrimaryButton'
import useRingStore from '../store/useRingStore'
import {
	bands,
	findOption,
	formatPrice,
	getRingPrice,
	metals,
	type BandId,
	type MetalId,
} from '../data/ringOptions'

const MakeItYours = () => {
	const navigate = useNavigate()
	const selection = useRingStore()
	const price = getRingPrice(selection)

	const metal = findOption(metals, selection.metal)
	const band = findOption(bands, selection.band)

	return (
		<div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-12">
			<section className="order-2 space-y-10 lg:order-1">
				<header>
					<p className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground">
						Step 02
					</p>
					<h1 className="mt-2 font-display text-3xl leading-tight sm:text-4xl">
						Make it yours
					</h1>
					<p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
						Choose the precious metal and diamond coverage of the band. Both are
						finished by hand in our atelier.
					</p>
				</header>

				<div>
					<div className="flex items-baseline justify-between">
						<h2 className="text-sm font-medium uppercase tracking-[0.14em]">
							Metal
						</h2>
						<span className="text-xs text-muted-foreground">{metal.label}</span>
					</div>
					<div className="mt-4 grid gap-3 sm:grid-cols-2">
						{metals.map((option) => (
							<OptionCard
								key={option.id}
								value={option.id}
								label={option.label}
								description={option.description}
								priceLabel={
									option.price > 0 ? `+${formatPrice(option.price)}` : 'Included'
								}
								variant="metal"
								icon={
									<span
										className="size-10 rounded-full ring-1 ring-black/10"
										style={{ backgroundColor: option.hex }}
									/>
								}
								selected={selection.metal === option.id}
								onSelect={(value) =>
									selection.select('metal', value as MetalId)
								}
							/>
						))}
					</div>
				</div>

				<div>
					<div className="flex items-baseline justify-between">
						<h2 className="text-sm font-medium uppercase tracking-[0.14em]">
							Band
						</h2>
						<span className="text-xs text-muted-foreground">{band.label}</span>
					</div>
					<div className="mt-4 grid gap-3 sm:grid-cols-2">
						{bands.map((option) => (
							<OptionCard
								key={option.id}
								value={option.id}
								label={option.label}
								description={option.description}
								priceLabel={
									option.price > 0 ? `+${formatPrice(option.price)}` : 'Included'
								}
								selected={selection.band === option.id}
								onSelect={(value) =>
									selection.select('band', value as BandId)
								}
							/>
						))}
					</div>
				</div>

				<div className="flex flex-wrap items-center justify-between gap-4 border-t border-border pt-6">
					<button
						type="button"
						onClick={() => navigate('/')}
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
							onClick={() => navigate('/personalise')}
							icon={ArrowRight}
						>
							Continue
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

export default MakeItYours
