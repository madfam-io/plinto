import type { Meta, StoryObj } from '@storybook/react';
import { DataRightsRequest } from './data-rights-request';

const meta: Meta<typeof DataRightsRequest> = {
  title: 'Compliance/DataRightsRequest',
  component: DataRightsRequest,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'GDPR Data Subject Rights request form supporting Articles 15-22.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    onSubmit: {
      action: 'submit',
      description: 'Callback when request is submitted',
    },
  },
};

export default meta;
type Story = StoryObj<typeof DataRightsRequest>;

export const Default: Story = {
  args: {},
};

export const WithExistingRequests: Story = {
  args: {
    existingRequests: [
      {
        id: 'dsr_123abc',
        requestType: 'access',
        status: 'completed',
        gdprArticle: 'Article 15',
        createdAt: '2025-10-16T15:30:00Z',
        completedAt: '2025-10-20T10:00:00Z',
        responseDeadline: '2025-11-15T15:30:00Z',
      },
      {
        id: 'dsr_456def',
        requestType: 'portability',
        status: 'processing',
        gdprArticle: 'Article 20',
        createdAt: '2025-11-10T12:00:00Z',
        responseDeadline: '2025-12-10T12:00:00Z',
      },
      {
        id: 'dsr_789ghi',
        requestType: 'erasure',
        status: 'pending',
        gdprArticle: 'Article 17',
        createdAt: '2025-11-16T09:00:00Z',
        responseDeadline: '2025-12-16T09:00:00Z',
      },
    ],
  },
};

export const ArticleExplanations: Story = {
  args: {
    showArticleDetails: true,
  },
};

export const WithCustomLabels: Story = {
  args: {
    labels: {
      title: 'Exercise Your Privacy Rights',
      description: 'Submit a request to access, delete, or export your personal data.',
      submitButton: 'Submit Privacy Request',
      successMessage: 'Your request has been received and will be processed within 30 days.',
    },
  },
};

export const CompactView: Story = {
  args: {
    variant: 'compact',
  },
};

export const WithLoadingState: Story = {
  args: {
    isSubmitting: true,
  },
};

export const WithErrorState: Story = {
  args: {
    error: 'Failed to submit request. Please try again.',
  },
};

export const Mobile: Story = {
  args: {
    existingRequests: [
      {
        id: 'dsr_123abc',
        requestType: 'access',
        status: 'completed',
        gdprArticle: 'Article 15',
        createdAt: '2025-10-16T15:30:00Z',
        completedAt: '2025-10-20T10:00:00Z',
        responseDeadline: '2025-11-15T15:30:00Z',
      },
    ],
  },
  parameters: {
    viewport: {
      defaultViewport: 'mobile',
    },
  },
};
