import React from 'react'
import { render, screen } from '@testing-library/react'
import { SessionList } from './session-list'

describe('SessionList', () => {
  it('should render without crashing', () => {
    render(<SessionList />)
    expect(screen.getByTestId('session-list')).toBeInTheDocument()
  })
})
