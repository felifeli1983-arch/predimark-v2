import { PositionsList } from '@/components/me/PositionsList'

export default function PositionsPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, paddingTop: 8 }}>
      <PositionsList />
    </div>
  )
}
