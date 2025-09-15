import React from 'react'
import { render, screen } from '@testing-library/react'
import ErrorComponent from './error'

// Mock window.Sentry
global.window.Sentry = {
  captureException: jest.fn()
}

describe('Error', () => {
  it('should render without crashing', () => {
    const mockError = new Error('Test error')
    const mockReset = jest.fn()

    render(<ErrorComponent error={mockError} reset={mockReset} />)
    expect(screen.getByText('Something went wrong!')).toBeInTheDocument()
  })

  it('should log error to Sentry in production', () => {
    const mockError = new Error('Test error for Sentry')
    const mockReset = jest.fn()

    render(<ErrorComponent error={mockError} reset={mockReset} />)
    expect(window.Sentry.captureException).toHaveBeenCalledWith(mockError)
  })

  it('should call reset when Try Again is clicked', () => {
    const mockError = new Error('Test error')
    const mockReset = jest.fn()

    render(<ErrorComponent error={mockError} reset={mockReset} />)
    const tryAgainButton = screen.getByText('Try Again')
    tryAgainButton.click()
    expect(mockReset).toHaveBeenCalled()
  })

  it('should navigate to home when Go Home is clicked', () => {
    const mockError = new Error('Test error')
    const mockReset = jest.fn()
    const originalLocation = window.location

    delete window.location
    window.location = { href: '' } as any

    render(<ErrorComponent error={mockError} reset={mockReset} />)
    const goHomeButton = screen.getByText('Go Home')
    goHomeButton.click()
    expect(window.location.href).toBe('/')

    window.location = originalLocation
  })

  it('should display error message in development mode', () => {
    const originalEnv = process.env.NODE_ENV
    process.env.NODE_ENV = 'development'
    const mockError = new Error('Development error message')
    const mockReset = jest.fn()

    render(<ErrorComponent error={mockError} reset={mockReset} />)
    expect(screen.getByText('Development error message')).toBeInTheDocument()

    process.env.NODE_ENV = originalEnv
  })
})
