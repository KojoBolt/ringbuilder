
import type {
  BandId,
  DiamondId,
  SettingId,
} from '../../data/ringOptions'

import RingBand from './RingBand'

import { DiamondWithSuspense } from './DiamondModel'

import SettingHead from './SettingHead'
import { getGemDimensions, HEAD_ROTATION } from './gemAssembly'

type RingModelProps = {
  metalColor?: string
  diamond?: DiamondId
  setting?: SettingId
  band?: BandId
  carat?: number
}

const RingModel = ({
  metalColor = '#d8a94a',
  diamond = 'round',
  setting = '4-prong',
  band = 'plain',
  carat = 1,
}: RingModelProps) => {
  const gem = getGemDimensions(diamond, carat)
  return (
    <group
      scale={0.75}
      rotation={[0.12, 0.3, 0]}
    >
      <RingBand
        color={metalColor}
        band={band}
      />

      <group position={[0, gem.stoneY, 0]} rotation={HEAD_ROTATION}>
        <DiamondWithSuspense
          diamond={diamond}
          carat={carat}
          position={[0, 0, 0]}
        />
      </group>

      <SettingHead
        color={metalColor}
        diamond={diamond}
        carat={carat}
        setting={setting}
      />
    </group>
  )
}

export default RingModel
