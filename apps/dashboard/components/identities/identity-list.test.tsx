import React from 'react'
import { render, screen } from '@testing-library/react'
import { IdentityList } from './identity-list'

describe('IdentityList', () => {
  it('should render without crashing', () => {
    render(<IdentityList />)
    expect(screen.getByTestId('identity-list')).toBeInTheDocument()
  })
})
