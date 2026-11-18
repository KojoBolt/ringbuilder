
import { useNavigate } from 'react-router-dom'
import { ArrowRight, Check } from 'lucide-react'

import RingViewer from '../components/ring/RingViewer'
import DiamondSilhouette from '../components/ui/DiamondSilhouette'
import OptionCard from '../components/ui/OptionCard'
import PrimaryButton from '../components/ui/PrimaryButton'

import useRingStore from '../store/useRingStore'

import {
  diamonds,
  findDiamond,
  findSetting,
  settings,
  type DiamondId,
  type SettingId,
} from '../data/ringOptions'

const CreateYourRing = () => {
  const navigate = useNavigate()

  const selectedDiamondId = useRingStore(
    (state) => state.diamond
  )
  const selectedSettingId = useRingStore(
    (state) => state.setting
  )
  const select = useRingStore((state) => state.select)

  const diamond = findDiamond(selectedDiamondId)
  const setting = findSetting(selectedSettingId)

  const handleDiamondSelect = (value: string) => {
    select('diamond', value as DiamondId)
  }

  const handleSettingSelect = (value: string) => {
    select('setting', value as SettingId)
  }

  return (
    <main className="grid min-w-0 gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-12">

      {/* LEFT: CONFIGURATION */}
      <section className="order-2 min-w-0 space-y-10 lg:order-1">

        {/* Introduction */}
        <header>
          <p className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground">
            Step 01 / 04
          </p>

          <h1 className="mt-2 font-display text-3xl leading-tight sm:text-4xl">
            Create your ring
          </h1>

          <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
            Begin with the shape of your centre stone and the
            setting that holds it. Every choice updates the
            preview as you go.
          </p>
        </header>

        {/* DIAMOND SHAPE */}
        <section aria-labelledby="diamond-shape-heading">

          <div className="flex flex-wrap items-center justify-between gap-3">

            <h2
              id="diamond-shape-heading"
              className="text-sm font-medium uppercase tracking-[0.14em]"
            >
              Diamond shape
            </h2>

            <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
              <Check
                size={13}
                className="text-[#b58e46]"
                aria-hidden="true"
              />
              {diamond.label}
            </span>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {diamonds.map((option) => (
              <OptionCard
                key={option.id}
                value={option.id}
                label={option.label}
                description={option.description}
                icon={
                  <DiamondSilhouette
                    diamond={option.id}
                    className="size-16"
                  />
                }
                variant="diamond"
                selected={selectedDiamondId === option.id}
                onSelect={handleDiamondSelect}
              />
            ))}
          </div>
        </section>

        {/* SETTING */}
        <section aria-labelledby="ring-setting-heading">

          <div className="flex flex-wrap items-center justify-between gap-3">

            <h2
              id="ring-setting-heading"
              className="text-sm font-medium uppercase tracking-[0.14em]"
            >
              Setting
            </h2>

            <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
              <Check
                size={13}
                className="text-[#b58e46]"
                aria-hidden="true"
              />
              {setting.label}
            </span>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {settings.map((option) => (
              <OptionCard
                key={option.id}
                value={option.id}
                label={option.label}
                description={option.description}
                variant="setting"
                selected={selectedSettingId === option.id}
                onSelect={handleSettingSelect}
              />
            ))}
          </div>
        </section>

        {/* CURRENT SELECTION */}
        <div className="border-y border-border py-5">

          <p className="mb-3 text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
            Your selection
          </p>

          <div className="flex flex-wrap items-center gap-2 text-sm">
            <span className="font-medium">{diamond.label}</span>

            <span
              className="text-muted-foreground"
              aria-hidden="true"
            >
              /
            </span>

            <span className="font-medium">{setting.label}</span>
          </div>
        </div>

        {/* FOOTER */}
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

          <p className="max-w-xs text-xs leading-relaxed text-muted-foreground">
            Setting proportions are illustrative and will be
            confirmed with you before production.
          </p>

          <PrimaryButton
            onClick={() => navigate('/make-it-yours')}
            icon={ArrowRight}
          >
            Continue
          </PrimaryButton>
        </div>

      </section>

      {/* RIGHT: LIVE 3D PREVIEW */}
      <aside
        aria-label="Interactive 3D ring preview"
        className="order-1 min-w-0 lg:order-2"
      >
        <div className="lg:sticky lg:top-24">
          <RingViewer
            className="
              h-[300px]
              w-full
              sm:h-[420px]
              lg:h-[min(640px,calc(100vh-8rem))]
            "
          />

          <p className="mt-3 text-center text-[11px] text-muted-foreground">
            Drag to rotate · Explore every angle
          </p>
        </div>
      </aside>

    </main>
  )
}

export default CreateYourRing
