import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import AIResearchAssistant from '../../components/AIResearchAssistant'

// Mock fetch
global.fetch = jest.fn()

describe('AIResearchAssistant', () => {
  beforeEach(() => {
    (fetch as jest.Mock).mockClear()
  })

  it('renders floating button when closed', () => {
    render(<AIResearchAssistant />)
    
    const floatingButton = screen.getByTitle('Open AI Research Assistant')
    expect(floatingButton).toBeInTheDocument()
  })

  it('opens modal when floating button is clicked', () => {
    render(<AIResearchAssistant />)
    
    const floatingButton = screen.getByTitle('Open AI Research Assistant')
    fireEvent.click(floatingButton)
    
    expect(screen.getByText('AI Research Assistant')).toBeInTheDocument()
    expect(screen.getByText('Powered by Perplexity MCP')).toBeInTheDocument()
  })

  it('closes modal when close button is clicked', () => {
    render(<AIResearchAssistant />)
    
    // Open modal
    const floatingButton = screen.getByTitle('Open AI Research Assistant')
    fireEvent.click(floatingButton)
    
    // Close modal
    const closeButton = screen.getByRole('button', { name: /close/i })
    fireEvent.click(closeButton)
    
    // Should show floating button again
    expect(screen.getByTitle('Open AI Research Assistant')).toBeInTheDocument()
  })

  it('switches between tabs', () => {
    render(<AIResearchAssistant />)
    
    // Open modal
    const floatingButton = screen.getByTitle('Open AI Research Assistant')
    fireEvent.click(floatingButton)
    
    // Click on different tab
    const reasonTab = screen.getByText('Reason')
    fireEvent.click(reasonTab)
    
    expect(reasonTab).toHaveClass('border-blue-500')
  })

  it('performs search when search button is clicked', async () => {
    const mockResponse = {
      success: true,
      data: {
        query: 'test query',
        answer: 'Mock AI response',
        sources: ['Mock Source'],
        model: 'sonar-pro-mock'
      },
      message: 'Search completed successfully'
    }

    ;(fetch as jest.Mock).mockResolvedValueOnce({
      json: async () => mockResponse,
    })

    render(<AIResearchAssistant />)
    
    // Open modal
    const floatingButton = screen.getByTitle('Open AI Research Assistant')
    fireEvent.click(floatingButton)
    
    // Enter query
    const input = screen.getByPlaceholderText('Ask any question...')
    fireEvent.change(input, { target: { value: 'test query' } })
    
    // Click search
    const searchButton = screen.getByText('Search')
    fireEvent.click(searchButton)
    
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/perplexity/search',
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ query: 'test query' }),
        })
      )
    })
  })

  it('shows loading state during search', async () => {
    ;(fetch as jest.Mock).mockImplementationOnce(
      () => new Promise(resolve => setTimeout(resolve, 100))
    )

    render(<AIResearchAssistant />)
    
    // Open modal
    const floatingButton = screen.getByTitle('Open AI Research Assistant')
    fireEvent.click(floatingButton)
    
    // Enter query and search
    const input = screen.getByPlaceholderText('Ask any question...')
    fireEvent.change(input, { target: { value: 'test query' } })
    
    const searchButton = screen.getByText('Search')
    fireEvent.click(searchButton)
    
    // Should show loading state
    expect(screen.getByText('Searching...')).toBeInTheDocument()
  })

  it('displays search results', async () => {
    const mockResponse = {
      success: true,
      data: {
        query: 'test query',
        answer: 'Mock AI response for test query',
        sources: ['VeriGrade Mock Service'],
        model: 'sonar-pro-mock'
      },
      message: 'Search completed successfully (Mock mode)'
    }

    ;(fetch as jest.Mock).mockResolvedValueOnce({
      json: async () => mockResponse,
    })

    render(<AIResearchAssistant />)
    
    // Open modal
    const floatingButton = screen.getByTitle('Open AI Research Assistant')
    fireEvent.click(floatingButton)
    
    // Enter query and search
    const input = screen.getByPlaceholderText('Ask any question...')
    fireEvent.change(input, { target: { value: 'test query' } })
    
    const searchButton = screen.getByText('Search')
    fireEvent.click(searchButton)
    
    await waitFor(() => {
      expect(screen.getByText('Mock AI response for test query')).toBeInTheDocument()
      expect(screen.getByText('VeriGrade Mock Service')).toBeInTheDocument()
    })
  })
})
