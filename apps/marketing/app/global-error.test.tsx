import React from 'react'
import { render, screen } from '@testing-library/react'
import GlobalErrorComponent from './global-error'

// Mock window.Sentry
global.window.Sentry = {
  captureException: jest.fn()
}

describe('GlobalError', () => {
  it('should render without crashing', () => {
    const mockError = new Error('Test error')
    const mockReset = jest.fn()

    render(<GlobalErrorComponent error={mockError} reset={mockReset} />)
    expect(screen.getByText('Critical Application Error')).toBeInTheDocument()
    expect(screen.getByText('The application encountered a critical error and needs to restart.')).toBeInTheDocument()
  })

  it('should call reset when Reload Application button is clicked', () => {
    const mockError = new Error('Test error')
    const mockReset = jest.fn()

    render(<GlobalErrorComponent error={mockError} reset={mockReset} />)
    const reloadButton = screen.getByText('Reload Application')
    reloadButton.click()
    expect(mockReset).toHaveBeenCalled()
  })

  it('should log error to Sentry with global tag', () => {
    const mockError = new Error('Test error for Sentry')
    const mockReset = jest.fn()

    render(<GlobalErrorComponent error={mockError} reset={mockReset} />)
    expect(window.Sentry.captureException).toHaveBeenCalledWith(mockError, {
      tags: { errorBoundary: 'global' }
    })
  })
})
