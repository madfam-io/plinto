import type { Meta, StoryObj } from '@storybook/react';
import { SCIMWizard } from './scim-wizard';
import { useState } from 'react';

const meta: Meta<typeof SCIMWizard> = {
  title: 'SCIM/SCIMWizard',
  component: SCIMWizard,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'Multi-step wizard for configuring SCIM 2.0 provisioning with various identity providers.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    onComplete: {
      action: 'complete',
      description: 'Callback when configuration is complete',
    },
    onCancel: {
      action: 'cancel',
      description: 'Callback when wizard is cancelled',
    },
  },
};

export default meta;
type Story = StoryObj<typeof SCIMWizard>;

export const Default: Story = {
  args: {},
};

export const Step1ProviderSelection: Story = {
  args: {
    initialStep: 1,
  },
};

export const Step2EndpointConfiguration: Story = {
  args: {
    initialStep: 2,
    selectedProvider: 'okta',
  },
};

export const Step3SyncSettings: Story = {
  args: {
    initialStep: 3,
    selectedProvider: 'okta',
    scimEndpoint: 'https://api.plinto.dev/scim/v2',
    bearerToken: 'generated-token-abc123def456',
  },
};

export const InteractiveWizard: Story = {
  render: () => {
    const [step, setStep] = useState(1);
    const [config, setConfig] = useState({});

    return (
      <div>
        <SCIMWizard
          initialStep={step}
          onStepChange={setStep}
          onComplete={(configuration) => {
            setConfig(configuration);
            console.log('Configuration complete:', configuration);
          }}
        />
        <div style={{ marginTop: '2rem', padding: '1rem', background: '#f5f5f5', borderRadius: '8px' }}>
          <h3>Current Step: {step}</h3>
          <pre>{JSON.stringify(config, null, 2)}</pre>
        </div>
      </div>
    );
  },
};

export const WithOktaProvider: Story = {
  args: {
    selectedProvider: 'okta',
    providerDetails: {
      name: 'Okta',
      logo: 'https://www.okta.com/sites/default/files/Okta_Logo_BrightBlue_Medium.png',
      docsUrl: 'https://developer.okta.com/docs/guides/scim-provisioning-integration-overview/',
    },
  },
};

export const WithAzureAD: Story = {
  args: {
    selectedProvider: 'azure',
    providerDetails: {
      name: 'Azure AD',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/a/a8/Microsoft_Azure_Logo.svg',
      docsUrl: 'https://learn.microsoft.com/en-us/azure/active-directory/app-provisioning/use-scim-to-provision-users-and-groups',
    },
  },
};

export const WithGoogle: Story = {
  args: {
    selectedProvider: 'google',
    providerDetails: {
      name: 'Google Workspace',
      logo: 'https://www.google.com/images/branding/googlelogo/2x/googlelogo_color_92x30dp.png',
      docsUrl: 'https://support.google.com/a/answer/7365001',
    },
  },
};

export const WithOneLogin: Story = {
  args: {
    selectedProvider: 'onelogin',
    providerDetails: {
      name: 'OneLogin',
      logo: 'https://www.onelogin.com/assets/img/logo-onelogin.svg',
      docsUrl: 'https://developers.onelogin.com/scim/overview',
    },
  },
};

export const WithGeneratedToken: Story = {
  args: {
    initialStep: 2,
    scimEndpoint: 'https://api.plinto.dev/scim/v2',
    bearerToken: 'plinto_scim_abc123def456ghi789jkl012mno345pqr678',
    showCopySuccess: true,
  },
};

export const WithSyncSettings: Story = {
  args: {
    initialStep: 3,
    syncSettings: {
      userSync: true,
      groupSync: true,
      syncOnCreate: true,
      syncOnUpdate: true,
      syncOnDelete: true,
      syncInterval: '15min',
    },
  },
};

export const CompletedState: Story = {
  args: {
    isComplete: true,
    configuration: {
      provider: 'okta',
      endpoint: 'https://api.plinto.dev/scim/v2',
      token: 'plinto_scim_***',
      syncSettings: {
        userSync: true,
        groupSync: true,
      },
      status: 'active',
    },
  },
};

export const WithError: Story = {
  args: {
    initialStep: 2,
    error: 'Failed to generate bearer token. Please try again.',
  },
};

export const Mobile: Story = {
  args: {},
  parameters: {
    viewport: {
      defaultViewport: 'mobile',
    },
  },
};

export const DarkMode: Story = {
  args: {},
  parameters: {
    backgrounds: { default: 'dark' },
  },
};
