import { Link, useNavigate } from 'react-router-dom'
import { Printer, Sparkles } from 'lucide-react'
import RingViewer from '../components/ring/RingViewer'
import PrimaryButton from '../components/ui/PrimaryButton'
import useRingStore from '../store/useRingStore'
import {
	bands,
	diamonds,
	findOption,
	formatPrice,
	getRingPrice,
	metals,
	settings,
} from '../data/ringOptions'

type SummaryRowProps = {
	label: string
	value: string
	price?: number
	editTo?: string
}

const SummaryRow = ({ label, value, price, editTo }: SummaryRowProps) => (
	<div className="flex items-start justify-between gap-4 py-3.5">
		<div className="min-w-0">
			<p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
				{label}
			</p>
			<p className="mt-0.5 truncate text-sm">{value}</p>
		</div>
		<div className="flex shrink-0 items-baseline gap-3">
			<span className="text-sm tabular-nums text-muted-foreground">
				{price == null || price === 0 ? 'Included' : formatPrice(price)}
			</span>
			{editTo && (
				<Link
					to={editTo}
					className="text-[11px] uppercase tracking-[0.12em] text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
				>
					Edit
				</Link>
			)}
		</div>
	</div>
)

const YourRing = () => {
	const navigate = useNavigate()
	const selection = useRingStore()
	const price = getRingPrice(selection)

	const diamond = findOption(diamonds, selection.diamond)
	const setting = findOption(settings, selection.setting)
	const metal = findOption(metals, selection.metal)
	const band = findOption(bands, selection.band)

	const diamondPrice = Math.round(diamond.price * selection.carat)

	const startOver = () => {
		selection.reset()
		navigate('/')
	}

	return (
		<div className="space-y-8">
			<header className="max-w-2xl">
				<p className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.24em] text-muted-foreground">
					<Sparkles className="size-3.5 text-gold" />
					Step 04 · Complete
				</p>
				<h1 className="mt-2 font-display text-3xl leading-tight sm:text-4xl">
					Your ring
				</h1>
				<p className="mt-3 text-sm leading-relaxed text-muted-foreground">
					A one-of-one piece, made to order. Review every detail below, then save
					or print your specification.
				</p>
			</header>

			<div className="grid gap-8 lg:grid-cols-[1.15fr_1fr] lg:gap-12">
				<RingViewer className="h-[420px] sm:h-[540px] lg:h-[min(680px,calc(100vh-10rem))]" />

				<section className="flex flex-col rounded-2xl border border-border bg-card">
					<div className="border-b border-border px-6 py-5">
						<p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
							Your specification
						</p>
						<p className="mt-1 font-serif text-lg italic">
							{diamond.label.toLowerCase()} · {selection.carat.toFixed(2)} ct ·{' '}
							{metal.label.toLowerCase()}
						</p>
					</div>

					<div className="divide-y divide-border px-6">
						<SummaryRow
							label="Centre stone"
							value={`${diamond.label} · ${selection.carat.toFixed(2)} ct`}
							price={diamondPrice}
							editTo="/"
						/>
						<SummaryRow
							label="Setting"
							value={setting.label}
							price={setting.price}
							editTo="/"
						/>
						<SummaryRow
							label="Metal"
							value={metal.label}
							price={metal.price}
							editTo="/make-it-yours"
						/>
						<SummaryRow
							label="Band"
							value={band.label}
							price={band.price}
							editTo="/make-it-yours"
						/>
						<SummaryRow
							label="Size"
							value={`US ${selection.size}`}
							editTo="/personalise"
						/>
						<SummaryRow
							label="Engraving"
							value={
								selection.engraving ? `“${selection.engraving}”` : 'None'
							}
							editTo="/personalise"
						/>
					</div>

					<div className="px-6 py-5">
						<div className="flex items-baseline justify-between">
							<span className="text-sm font-medium">Total</span>
							<span className="font-display text-3xl">{formatPrice(price)}</span>
						</div>
						<p className="mt-1 text-xs text-muted-foreground">
							Includes VAT and complimentary resizing within the first year.
						</p>
					</div>

					<div className="mt-auto flex flex-wrap items-center gap-3 border-t border-border px-6 py-5 print:hidden">
						<PrimaryButton onClick={() => window.print()} icon={Printer}>
							Print my ring
						</PrimaryButton>
						<PrimaryButton variant="secondary" onClick={startOver}>
							Start over
						</PrimaryButton>
					</div>
				</section>
			</div>
		</div>
	)
}

export default YourRing
