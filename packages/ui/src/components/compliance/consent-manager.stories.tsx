import type { Meta, StoryObj } from '@storybook/react';
import { ConsentManager } from './consent-manager';
import { useState } from 'react';

const meta: Meta<typeof ConsentManager> = {
  title: 'Compliance/ConsentManager',
  component: ConsentManager,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'GDPR-compliant consent management component with purpose-based consent tracking.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    position: {
      control: 'select',
      options: ['top', 'bottom'],
      description: 'Position of the consent banner',
    },
    showBanner: {
      control: 'boolean',
      description: 'Whether to show the consent banner',
    },
    onConsentChange: {
      action: 'consent-changed',
      description: 'Callback when consent is granted or withdrawn',
    },
  },
};

export default meta;
type Story = StoryObj<typeof ConsentManager>;

const defaultPurposes = [
  {
    id: 'essential',
    name: 'Essential Services',
    description: 'Core platform functionality and security',
    legalBasis: 'contract' as const,
    required: true,
    gdprArticle: 'Article 6(1)(b)',
  },
  {
    id: 'analytics',
    name: 'Analytics and Performance',
    description: 'Track usage patterns to improve the product',
    legalBasis: 'consent' as const,
    required: false,
    gdprArticle: 'Article 6(1)(a)',
  },
  {
    id: 'marketing',
    name: 'Marketing Communications',
    description: 'Send promotional emails and product updates',
    legalBasis: 'consent' as const,
    required: false,
    gdprArticle: 'Article 6(1)(a)',
  },
  {
    id: 'personalization',
    name: 'Personalization',
    description: 'Customize your experience based on your preferences',
    legalBasis: 'legitimate_interest' as const,
    required: false,
    gdprArticle: 'Article 6(1)(f)',
  },
];

export const Default: Story = {
  args: {
    purposes: defaultPurposes,
    showBanner: true,
    position: 'bottom',
  },
};

export const BannerTop: Story = {
  args: {
    purposes: defaultPurposes,
    showBanner: true,
    position: 'top',
  },
};

export const WithCustomization: Story = {
  args: {
    purposes: defaultPurposes,
    showBanner: true,
    position: 'bottom',
    customText: {
      title: 'Cookie Preferences',
      description: 'We use cookies to enhance your experience. Choose your preferences below.',
      acceptAll: 'Accept All Cookies',
      rejectAll: 'Reject Optional',
      customize: 'Customize Settings',
    },
  },
};

export const Interactive: Story = {
  render: () => {
    const [consents, setConsents] = useState<Record<string, boolean>>({
      essential: true,
      analytics: false,
      marketing: false,
      personalization: false,
    });

    return (
      <div>
        <ConsentManager
          purposes={defaultPurposes}
          showBanner={true}
          position="bottom"
          initialConsents={consents}
          onConsentChange={(purpose, granted) => {
            setConsents(prev => ({ ...prev, [purpose]: granted }));
            console.log(`${purpose}: ${granted}`);
          }}
        />
        <div style={{ padding: '2rem' }}>
          <h2>Current Consent State</h2>
          <pre>{JSON.stringify(consents, null, 2)}</pre>
        </div>
      </div>
    );
  },
};

export const MinimalPurposes: Story = {
  args: {
    purposes: [
      {
        id: 'essential',
        name: 'Essential',
        description: 'Required for the site to work',
        legalBasis: 'contract' as const,
        required: true,
        gdprArticle: 'Article 6(1)(b)',
      },
      {
        id: 'analytics',
        name: 'Analytics',
        description: 'Help us improve',
        legalBasis: 'consent' as const,
        required: false,
        gdprArticle: 'Article 6(1)(a)',
      },
    ],
    showBanner: true,
    position: 'bottom',
  },
};

export const ManyPurposes: Story = {
  args: {
    purposes: [
      ...defaultPurposes,
      {
        id: 'advertising',
        name: 'Advertising',
        description: 'Show relevant ads based on your interests',
        legalBasis: 'consent' as const,
        required: false,
        gdprArticle: 'Article 6(1)(a)',
      },
      {
        id: 'social_media',
        name: 'Social Media',
        description: 'Enable social media sharing features',
        legalBasis: 'consent' as const,
        required: false,
        gdprArticle: 'Article 6(1)(a)',
      },
      {
        id: 'third_party',
        name: 'Third-Party Services',
        description: 'Integrate with external services',
        legalBasis: 'consent' as const,
        required: false,
        gdprArticle: 'Article 6(1)(a)',
      },
    ],
    showBanner: true,
    position: 'bottom',
  },
};

export const DarkMode: Story = {
  args: {
    purposes: defaultPurposes,
    showBanner: true,
    position: 'bottom',
    theme: 'dark',
  },
  parameters: {
    backgrounds: { default: 'dark' },
  },
};

export const Mobile: Story = {
  args: {
    purposes: defaultPurposes,
    showBanner: true,
    position: 'bottom',
  },
  parameters: {
    viewport: {
      defaultViewport: 'mobile',
    },
  },
};
