import type { ReactNode } from 'react'
import type { DiamondId } from '../../data/ringOptions'

const facetClass = 'opacity-50'

const shapes: Record<DiamondId, ReactNode> = {
	round: (
		<>
			<circle cx="32" cy="32" r="21" />
			<circle cx="32" cy="32" r="14" className={facetClass} />
			<path d="M32 11 43 22 43 42 32 53 21 42 21 22Z" className={facetClass} />
		</>
	),
	oval: (
		<>
			<ellipse cx="32" cy="32" rx="15" ry="23" />
			<ellipse cx="32" cy="32" rx="9" ry="16" className={facetClass} />
		</>
	),
	cushion: (
		<>
			<rect x="12" y="12" width="40" height="40" rx="10" />
			<rect
				x="19"
				y="19"
				width="26"
				height="26"
				rx="6"
				className={facetClass}
			/>
		</>
	),
	emerald: (
		<>
			<path d="M22 7H42L52 17V47L42 57H22L12 47V17Z" />
			<path d="M24 15H40L46 21V43L40 49H24L18 43V21Z" className={facetClass} />
			<path d="M32 7V57M12 32H52" className={facetClass} />
		</>
	),
	pear: (
		<>
			<path d="M32 5C41 16 51 27 51 37A19 19 0 1 1 13 37C13 27 23 16 32 5Z" />
			<path d="M32 16C38 24 43 31 43 37A11 11 0 1 1 21 37C21 31 26 24 32 16Z" className={facetClass} />
		</>
	),
	marquise: (
		<>
			<path d="M32 4C43 18 51 28 51 32C51 36 43 46 32 60C21 46 13 36 13 32C13 28 21 18 32 4Z" />
			<path d="M32 14C39 24 43 30 43 32C43 34 39 40 32 50C25 40 21 34 21 32C21 30 25 24 32 14Z" className={facetClass} />
		</>
	),
	princess: (
		<>
			<rect x="12" y="12" width="40" height="40" />
			<path d="M12 12 32 32 52 52M52 12 32 32 12 52" className={facetClass} />
			<rect x="19" y="19" width="26" height="26" className={facetClass} />
		</>
	),
	radiant: (
		<>
			<path d="M20 8H44L56 20V44L44 56H20L8 44V20Z" />
			<path d="M23 16H41L48 23V41L41 48H23L16 41V23Z" className={facetClass} />
			<path d="M32 8V56M8 32H56" className={facetClass} />
		</>
	),
}

type DiamondSilhouetteProps = {
	diamond: DiamondId
	className?: string
}

const DiamondSilhouette = ({
	diamond,
	className = 'size-14',
}: DiamondSilhouetteProps) => (
	<svg
		viewBox="0 0 64 64"
		className={className}
		fill="currentColor"
		fillOpacity={0.035}
		stroke="currentColor"
		strokeWidth={1.2}
		strokeLinejoin="round"
		aria-hidden="true"
		focusable="false"
	>
		{shapes[diamond]}
	</svg>
)

export default DiamondSilhouette
