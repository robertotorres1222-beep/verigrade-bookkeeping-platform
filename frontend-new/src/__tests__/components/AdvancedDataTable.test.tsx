import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import AdvancedDataTable from '@/components/AdvancedDataTable'

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    tr: ({ children, ...props }: any) => <tr {...props}>{children}</tr>,
  },
  AnimatePresence: ({ children }: any) => children,
}))

const sampleData = [
  {
    id: 1,
    name: 'John Doe',
    email: 'john@example.com',
    role: 'Admin',
    status: 'Active',
    lastLogin: '2024-01-15',
    amount: 1500
  },
  {
    id: 2,
    name: 'Jane Smith',
    email: 'jane@example.com',
    role: 'User',
    status: 'Pending',
    lastLogin: '2024-01-14',
    amount: -250
  }
]

const columns = [
  { key: 'name', label: 'Name', sortable: true, filterable: true },
  { key: 'email', label: 'Email', sortable: true, filterable: true },
  { key: 'role', label: 'Role', sortable: true },
  { key: 'status', label: 'Status', sortable: true },
  { key: 'amount', label: 'Amount', sortable: true }
]

describe('AdvancedDataTable', () => {
  it('renders table with data', () => {
    render(
      <AdvancedDataTable
        data={sampleData}
        columns={columns}
        title="Test Table"
      />
    )
    
    expect(screen.getByText('Test Table')).toBeInTheDocument()
    expect(screen.getByText('John Doe')).toBeInTheDocument()
    expect(screen.getByText('Jane Smith')).toBeInTheDocument()
  })

  it('sorts columns when header is clicked', () => {
    render(
      <AdvancedDataTable
        data={sampleData}
        columns={columns}
        title="Test Table"
      />
    )
    
    const nameHeader = screen.getByText('Name')
    fireEvent.click(nameHeader)
    
    // Check if sorting indicator appears
    expect(screen.getByText('↑')).toBeInTheDocument()
  })

  it('filters data when search is performed', () => {
    render(
      <AdvancedDataTable
        data={sampleData}
        columns={columns}
        title="Test Table"
        searchable={true}
      />
    )
    
    const searchInput = screen.getByPlaceholderText('Search...')
    fireEvent.change(searchInput, { target: { value: 'John' } })
    
    expect(screen.getByText('John Doe')).toBeInTheDocument()
    expect(screen.queryByText('Jane Smith')).not.toBeInTheDocument()
  })

  it('handles row selection', () => {
    render(
      <AdvancedDataTable
        data={sampleData}
        columns={columns}
        title="Test Table"
        selectable={true}
      />
    )
    
    const selectAllCheckbox = screen.getByRole('checkbox')
    fireEvent.click(selectAllCheckbox)
    
    // Check if all rows are selected
    const checkboxes = screen.getAllByRole('checkbox')
    checkboxes.forEach(checkbox => {
      expect(checkbox).toBeChecked()
    })
  })

  it('shows export options', () => {
    render(
      <AdvancedDataTable
        data={sampleData}
        columns={columns}
        title="Test Table"
        exportable={true}
      />
    )
    
    const exportButton = screen.getByRole('button', { name: /export/i })
    expect(exportButton).toBeInTheDocument()
  })

  it('displays pagination controls', () => {
    const largeDataSet = Array.from({ length: 25 }, (_, i) => ({
      id: i + 1,
      name: `User ${i + 1}`,
      email: `user${i + 1}@example.com`,
      role: 'User',
      status: 'Active',
      lastLogin: '2024-01-15',
      amount: 100
    }))

    render(
      <AdvancedDataTable
        data={largeDataSet}
        columns={columns}
        title="Test Table"
      />
    )
    
    expect(screen.getByText('Next')).toBeInTheDocument()
    expect(screen.getByText('Previous')).toBeInTheDocument()
  })
})
