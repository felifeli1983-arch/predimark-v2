import { OpenOrdersList } from '@/components/me/OpenOrdersList'

export default function OrdersPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, paddingTop: 8 }}>
      <OpenOrdersList />
    </div>
  )
}
