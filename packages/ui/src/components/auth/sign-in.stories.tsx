import type { Meta, StoryObj } from '@storybook/react';
import { SignIn } from './sign-in';

const meta: Meta<typeof SignIn> = {
  title: 'Authentication/SignIn',
  component: SignIn,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Sign-in form with email/password, SSO, and passkey authentication options.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    onSubmit: {
      action: 'submit',
      description: 'Callback when form is submitted',
    },
    onSSOClick: {
      action: 'sso-click',
      description: 'Callback when SSO provider is clicked',
    },
    onPasskeyClick: {
      action: 'passkey-click',
      description: 'Callback when passkey sign-in is clicked',
    },
  },
};

export default meta;
type Story = StoryObj<typeof SignIn>;

export const Default: Story = {
  args: {},
};

export const WithSSO: Story = {
  args: {
    ssoProviders: [
      { id: 'google', name: 'Google', icon: 'google' },
      { id: 'microsoft', name: 'Microsoft', icon: 'microsoft' },
      { id: 'github', name: 'GitHub', icon: 'github' },
    ],
  },
};

export const WithPasskey: Story = {
  args: {
    passkeyEnabled: true,
  },
};

export const WithRememberMe: Story = {
  args: {
    showRememberMe: true,
  },
};

export const WithError: Story = {
  args: {
    error: 'Invalid email or password. Please try again.',
  },
};

export const Loading: Story = {
  args: {
    isLoading: true,
  },
};

export const MFARequired: Story = {
  args: {
    requiresMFA: true,
    mfaMethods: ['totp', 'sms', 'email'],
  },
};

export const CompleteSuite: Story = {
  args: {
    ssoProviders: [
      { id: 'google', name: 'Google', icon: 'google' },
      { id: 'microsoft', name: 'Microsoft', icon: 'microsoft' },
    ],
    passkeyEnabled: true,
    showRememberMe: true,
    showForgotPassword: true,
  },
};

export const Mobile: Story = {
  args: {
    ssoProviders: [
      { id: 'google', name: 'Google', icon: 'google' },
      { id: 'microsoft', name: 'Microsoft', icon: 'microsoft' },
    ],
    passkeyEnabled: true,
  },
  parameters: {
    viewport: {
      defaultViewport: 'mobile',
    },
  },
};

export const DarkMode: Story = {
  args: {
    ssoProviders: [
      { id: 'google', name: 'Google', icon: 'google' },
      { id: 'microsoft', name: 'Microsoft', icon: 'microsoft' },
    ],
    passkeyEnabled: true,
  },
  parameters: {
    backgrounds: { default: 'dark' },
  },
};
