import { PositionsList } from '@/components/me/PositionsList'
import { RedeemSection } from '@/components/me/RedeemSection'

export default function PositionsPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, paddingTop: 8 }}>
      <RedeemSection />
      <PositionsList />
    </div>
  )
}
