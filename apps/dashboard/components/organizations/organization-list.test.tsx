import React from 'react'
import { render, screen } from '@testing-library/react'
import { OrganizationList } from './organization-list'

describe('OrganizationList', () => {
  it('should render without crashing', () => {
    render(<OrganizationList />)
    expect(screen.getByTestId('organization-list')).toBeInTheDocument()
  })
})
