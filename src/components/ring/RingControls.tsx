import { Rotate3d, RotateCcw } from 'lucide-react'

type RingControlsProps = {
	autoRotate: boolean
	onToggleAutoRotate: () => void
	onReset: () => void
}

const RingControls = ({
	autoRotate,
	onToggleAutoRotate,
	onReset,
}: RingControlsProps) => (
	<div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-center justify-between gap-3 p-4 print:hidden">
		<p className="min-w-0 flex-1 text-[11px] leading-relaxed tracking-[0.04em] text-[#6b6254]">
			Drag to rotate · Explore every angle
		</p>

		<div className="pointer-events-auto flex shrink-0 items-center gap-1.5 rounded-full border border-[#d9d2c5] bg-white/75 p-1 backdrop-blur">
			<button
				type="button"
				onClick={onToggleAutoRotate}
				aria-pressed={autoRotate}
				aria-label={autoRotate ? 'Pause rotation' : 'Start rotation'}
				title={autoRotate ? 'Pause rotation' : 'Start rotation'}
				className={`grid size-8 place-items-center rounded-full transition-colors ${
					autoRotate
						? 'bg-[#231f1a] text-white'
						: 'text-[#5f574a] hover:text-[#231f1a]'
				}`}
			>
				<Rotate3d className="size-4" />
			</button>
			<button
				type="button"
				onClick={onReset}
				aria-label="Reset view"
				title="Reset view"
				className="grid size-8 place-items-center rounded-full text-[#5f574a] transition-colors hover:text-[#231f1a]"
			>
				<RotateCcw className="size-4" />
			</button>
		</div>
	</div>
)

export default RingControls
