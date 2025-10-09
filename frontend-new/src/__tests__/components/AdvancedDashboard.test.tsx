import { render, screen, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import AdvancedDashboard from '@/components/AdvancedDashboard'

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
  },
  AnimatePresence: ({ children }: any) => children,
}))

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
  }),
  usePathname: () => '/advanced',
}))

describe('AdvancedDashboard', () => {
  beforeEach(() => {
    // Mock window.matchMedia
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: jest.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      })),
    })
  })

  it('renders loading state initially', () => {
    render(<AdvancedDashboard />)
    expect(screen.getByText('Loading Advanced Dashboard')).toBeInTheDocument()
  })

  it('renders dashboard after loading', async () => {
    render(<AdvancedDashboard />)
    
    await waitFor(() => {
      expect(screen.getByText('Advanced Dashboard')).toBeInTheDocument()
    }, { timeout: 3000 })
  })

  it('displays metrics cards', async () => {
    render(<AdvancedDashboard />)
    
    await waitFor(() => {
      expect(screen.getByText('Total Revenue')).toBeInTheDocument()
      expect(screen.getByText('Total Expenses')).toBeInTheDocument()
      expect(screen.getByText('Net Profit')).toBeInTheDocument()
      expect(screen.getByText('Active Customers')).toBeInTheDocument()
    }, { timeout: 3000 })
  })

  it('switches between tabs', async () => {
    render(<AdvancedDashboard />)
    
    await waitFor(() => {
      const analyticsTab = screen.getByText('Analytics')
      analyticsTab.click()
      expect(screen.getByText('AI-Powered Insights')).toBeInTheDocument()
    }, { timeout: 3000 })
  })

  it('toggles real-time data', async () => {
    render(<AdvancedDashboard />)
    
    await waitFor(() => {
      const toggleButton = screen.getByText('Pause Live')
      expect(toggleButton).toBeInTheDocument()
      toggleButton.click()
      expect(screen.getByText('Enable Live')).toBeInTheDocument()
    }, { timeout: 3000 })
  })
})


