import { render, screen } from '@testing-library/react'

function Badge({
  children,
  variant = 'default',
}: {
  children: React.ReactNode
  variant?: 'default' | 'success' | 'danger'
}) {
  return (
    <span data-testid="badge" data-variant={variant}>
      {children}
    </span>
  )
}

describe('Badge', () => {
  it('renders children', () => {
    render(<Badge>Test Label</Badge>)
    expect(screen.getByTestId('badge')).toHaveTextContent('Test Label')
  })

  it('applies default variant', () => {
    render(<Badge>Default</Badge>)
    expect(screen.getByTestId('badge')).toHaveAttribute('data-variant', 'default')
  })

  it('applies success variant', () => {
    render(<Badge variant="success">Win</Badge>)
    expect(screen.getByTestId('badge')).toHaveAttribute('data-variant', 'success')
  })

  it('applies danger variant', () => {
    render(<Badge variant="danger">Loss</Badge>)
    expect(screen.getByTestId('badge')).toHaveAttribute('data-variant', 'danger')
  })
})
