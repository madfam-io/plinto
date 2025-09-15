import React from 'react'
import { render, screen } from '@testing-library/react'
import { RecentActivity } from './recent-activity'

describe('RecentActivity', () => {
  it('should render without crashing', () => {
    render(<RecentActivity />)
    expect(screen.getByTestId('recent-activity')).toBeInTheDocument()
  })
})
