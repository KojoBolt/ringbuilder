export type RingOption = {
	id: string
	label: string
	description: string
	price: number
	hex?: string
}

export type DiamondOption = RingOption & {
	/** Public path to the centre-stone GLB. */
	model: string
	/** Optional card artwork. Falls back to a cut silhouette when omitted. */
	image?: string
	/** Length divided by width, measured from the supplied GLB. */
	lengthToWidth: number
}

export type SettingOption = RingOption & {
	head: 'prong' | 'halo' | 'hidden-halo' | 'cathedral'
	prongs: 4 | 6
}

/**
 * Illustrative placeholder pricing used by the running estimates.
 * Confirm production pricing with DR Gold before these values are shown
 * as anything other than an estimate.
 */
export const PRICE_DISCLAIMER =
	'Illustrative estimate only. Final pricing is confirmed by DR Gold before production.'

export const diamonds = [
	{
		id: 'oval',
		label: 'Oval',
		description: 'A refined elongation that lengthens the hand.',
		price: 2750,
		model: '/assets/models/diamond/oval.glb',
		lengthToWidth: 1.51,
	},
	{
		id: 'radiant',
		label: 'Radiant',
		description: 'Cropped corners with brilliant-cut fire.',
		price: 2900,
		model: '/assets/models/diamond/radiant.glb',
		lengthToWidth: 1,
	},
	{
		id: 'emerald',
		label: 'Emerald',
		description: 'Step facets with architectural calm.',
		price: 3100,
		model: '/assets/models/diamond/emerald.glb',
		lengthToWidth: 1.56,
	},
	{
		id: 'pear',
		label: 'Pear',
		description: 'A soft teardrop silhouette with a single point.',
		price: 2950,
		model: '/assets/models/diamond/pear.glb',
		lengthToWidth: 1.3,
	},
	{
		id: 'round',
		label: 'Round',
		description: 'The classic brilliant, cut for maximum sparkle.',
		price: 2400,
		model: '/assets/models/diamond/round.glb',
		lengthToWidth: 1,
	},
	{
		id: 'marquise',
		label: 'Marquise',
		description: 'A pointed navette that draws the eye.',
		price: 3050,
		model: '/assets/models/diamond/marquise.glb',
		lengthToWidth: 1.79,
	},
	{
		id: 'cushion',
		label: 'Cushion',
		description: 'Rounded corners with vintage warmth.',
		price: 2600,
		model: '/assets/models/diamond/cushion.glb',
		lengthToWidth: 1,
	},
	{
		id: 'princess',
		label: 'Princess',
		description: 'A square silhouette with brilliant facets.',
		price: 2850,
		model: '/assets/models/diamond/princess.glb',
		lengthToWidth: 1,
	},
] as const satisfies readonly DiamondOption[]

export const settings = [
	{
		id: '4-prong',
		label: '4 Prong',
		description: 'Four slender claws, minimal and unobstructed.',
		price: 850,
		head: 'prong',
		prongs: 4,
	},
	{
		id: '6-prong',
		label: '6 Prong',
		description: 'Six claws for added security and a rounder profile.',
		price: 980,
		head: 'prong',
		prongs: 6,
	},
	{
		id: 'hidden-halo',
		label: 'Hidden Halo',
		description: 'A delicate halo set beneath the centre stone.',
		price: 1350,
		head: 'hidden-halo',
		prongs: 4,
	},
	{
		id: 'halo',
		label: 'Halo',
		description: 'A circle of pavé framing the centre stone.',
		price: 1450,
		head: 'halo',
		prongs: 4,
	},
	{
		id: 'cathedral',
		label: 'Cathedral',
		description: 'Arched shoulders rising to meet the head.',
		price: 1250,
		head: 'cathedral',
		prongs: 4,
	},
] as const satisfies readonly SettingOption[]

export const metals = [
	{
		id: 'yellow-gold',
		label: '18k yellow gold',
		description: 'Warm, classic and unmistakable.',
		price: 0,
		hex: '#d8a94a',
	},
	{
		id: 'white-gold',
		label: '18k white gold',
		description: 'Bright, crisp and contemporary.',
		price: 120,
		hex: '#d9d9d6',
	},
	{
		id: 'rose-gold',
		label: '18k rose gold',
		description: 'A soft blush with romantic warmth.',
		price: 140,
		hex: '#d8a092',
	},
	{
		id: 'platinum',
		label: 'Platinum 950',
		description: 'Dense, enduring and naturally white.',
		price: 480,
		hex: '#c8cacc',
	},
] as const satisfies readonly (RingOption & { hex: string })[]

// Provisional increments: retain the old 620 pavé estimate for half coverage
// and scale by coverage until DR Gold supplies its band pricing.
export const bands = [
	{
		id: 'plain',
		label: 'Plain',
		description: 'A smooth, high-polish band.',
		price: 0,
		coverage: 0,
	},
	{
		id: 'half-set',
		label: '50% Set',
		description: 'Diamonds set around half of the band.',
		price: 620,
		coverage: 0.5,
	},
	{
		id: 'three-quarter-set',
		label: '75% Set',
		description: 'Diamonds set around three quarters of the band.',
		price: 930,
		coverage: 0.75,
	},
	{
		id: 'full-set',
		label: 'Full Set',
		description: 'Diamonds set all the way around the band.',
		price: 1240,
		coverage: 1,
	},
] as const satisfies readonly (RingOption & { coverage: number })[]

export const sizes = ['4', '5', '6', '7', '8', '9', '10'] as const

export const carats = [0.75, 1, 1.5, 2] as const

export const engravingLimit = 20

export type DiamondId = (typeof diamonds)[number]['id']
export type SettingId = (typeof settings)[number]['id']
export type MetalId = (typeof metals)[number]['id']
export type BandId = (typeof bands)[number]['id']
export type RingSize = (typeof sizes)[number]

export type RingSelection = {
	diamond: DiamondId
	setting: SettingId
	metal: MetalId
	band: BandId
	carat: number
	size: RingSize
	engraving: string
}

export const findOption = <T extends { id: string }>(
	options: readonly T[],
	id: string,
): T => options.find((option) => option.id === id) ?? options[0]

export const findDiamond = (id: DiamondId): DiamondOption =>
	diamonds.find((diamond) => diamond.id === id) ?? diamonds[0]

export const findSetting = (id: SettingId): SettingOption =>
	settings.find((setting) => setting.id === id) ?? settings[0]

export const formatPrice = (value: number): string =>
	new Intl.NumberFormat('en-US', {
		style: 'currency',
		currency: 'USD',
		maximumFractionDigits: 0,
	}).format(value)

export const getRingPrice = (selection: RingSelection): number => {
	const diamond = findDiamond(selection.diamond)
	const setting = findSetting(selection.setting)
	const metal = findOption(metals, selection.metal)
	const band = findOption(bands, selection.band)

	return Math.round(
		diamond.price * (selection.carat ?? 1) +
			setting.price +
			metal.price +
			band.price,
	)
}
