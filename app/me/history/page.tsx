import { TradesHistoryList } from '@/components/me/TradesHistoryList'

export default function HistoryPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, paddingTop: 8 }}>
      <TradesHistoryList />
    </div>
  )
}
