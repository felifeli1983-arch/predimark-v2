'use client'

import { ShoppingCart } from 'lucide-react'
import { useBetSlip } from '@/lib/stores/useBetSlip'

/**
 * Floating Action Button mobile per riaprire il drawer dopo che è stato chiuso.
 * Visibile solo su mobile + tablet portrait (<lg), solo se ci sono leg e drawer chiuso.
 */
export function BetSlipFAB() {
  const legCount = useBetSlip((s) => s.legs.length)
  const drawerOpen = useBetSlip((s) => s.drawerOpen)
  const openDrawer = useBetSlip((s) => s.openDrawer)

  if (drawerOpen || legCount === 0) return null

  return (
    <button
      type="button"
      aria-label={`Apri Bet Slip — ${legCount} leg`}
      onClick={openDrawer}
      className="lg:hidden"
      style={{
        position: 'fixed',
        right: 16,
        // 70px lascia spazio sopra al BottomNav (~64px)
        bottom: 80,
        width: 56,
        height: 56,
        borderRadius: '50%',
        background: 'var(--color-cta)',
        border: 'none',
        boxShadow: '0 6px 16px rgba(0, 0, 0, 0.3)',
        cursor: 'pointer',
        color: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 70,
      }}
    >
      <ShoppingCart size={20} />
      <span
        aria-hidden
        style={{
          position: 'absolute',
          top: -4,
          right: -4,
          minWidth: 22,
          height: 22,
          padding: '0 6px',
          borderRadius: 999,
          background: 'var(--color-danger)',
          color: '#fff',
          fontSize: 11,
          fontWeight: 700,
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontVariantNumeric: 'tabular-nums',
          border: '2px solid var(--color-bg-primary)',
        }}
      >
        {legCount}
      </span>
    </button>
  )
}
