import { create } from 'zustand'
import type { RingSelection } from '../data/ringOptions'

type RingState = RingSelection & {
	select: <K extends keyof RingSelection>(
		key: K,
		value: RingSelection[K],
	) => void
	setEngraving: (engraving: string) => void
	reset: () => void
}

const initialSelection: RingSelection = {
	diamond: 'round',
	setting: '4-prong',
	metal: 'yellow-gold',
	band: 'plain',
	carat: 1,
	size: '6',
	engraving: '',
}

const useRingStore = create<RingState>((set) => ({
	...initialSelection,
	select: (key, value) =>
		set((state) => ({ ...state, [key]: value }) as RingState),
	setEngraving: (engraving) => set({ engraving }),
	reset: () => set(initialSelection),
}))

export default useRingStore
