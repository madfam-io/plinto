import React from 'react';
import { redirect } from 'next/navigation';
import HomePage from './page';

// Mock the redirect function
jest.mock('next/navigation', () => ({
  redirect: jest.fn(),
}));

describe('HomePage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should redirect to sign in page', () => {
    HomePage();
    expect(redirect).toHaveBeenCalledWith('/signin');
  });

  it('should redirect only once', () => {
    HomePage();
    expect(redirect).toHaveBeenCalledTimes(1);
  });

  it('should redirect to correct path', () => {
    HomePage();
    expect(redirect).toHaveBeenCalledWith('/signin');
    expect(redirect).not.toHaveBeenCalledWith('/signup');
    expect(redirect).not.toHaveBeenCalledWith('/dashboard');
  });
});
