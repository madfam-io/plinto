# Janua Documentation

> **Developer documentation portal** for the Janua platform

**Status:** In Development · **Domain:** `docs.janua.dev` · **Port:** 3003 ⚠️

## ⚠️ Port Conflict Notice

**Important:** This app is configured to use port 3003, which conflicts with the marketing app. Please update one of the following:
- Change this app to port 3005: `"dev": "next dev -p 3005"`
- Or change marketing app to a different port

## 📋 Overview

The Janua Documentation site provides comprehensive guides, API references, SDK documentation, and tutorials for developers integrating with the Janua platform. Built with Next.js and MDX for a superior documentation experience.

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Yarn workspace management
- MDX support

### Installation

```bash
# From monorepo root
yarn install

# Navigate to docs app
cd apps/docs

# Start development server (after fixing port conflict)
yarn dev
```

Documentation will be available at [http://localhost:3003](http://localhost:3003)

### Environment Setup

Create a `.env.local` file:

```env
# Search
NEXT_PUBLIC_ALGOLIA_APP_ID=your-algolia-app-id
NEXT_PUBLIC_ALGOLIA_API_KEY=your-search-api-key
NEXT_PUBLIC_ALGOLIA_INDEX=janua-docs

# API
NEXT_PUBLIC_API_URL=https://api.janua.dev
NEXT_PUBLIC_GITHUB_REPO=janua/janua

# Features
NEXT_PUBLIC_ENABLE_SEARCH=true
NEXT_PUBLIC_ENABLE_DARK_MODE=true
NEXT_PUBLIC_ENABLE_VERSIONING=true
NEXT_PUBLIC_ENABLE_API_PLAYGROUND=true

# Analytics
NEXT_PUBLIC_GA_ID=your-ga-id
```

## 🏗️ Architecture

### Project Structure

```
apps/docs/
├── app/                      # Next.js 14 App Router
│   ├── page.tsx             # Documentation home
│   ├── docs/                # Documentation pages
│   │   ├── getting-started/ # Getting started guides
│   │   ├── authentication/  # Auth documentation
│   │   ├── api-reference/   # API documentation
│   │   ├── sdks/           # SDK guides
│   │   ├── webhooks/       # Webhook docs
│   │   ├── security/       # Security guides
│   │   └── troubleshooting/ # Help & support
│   ├── api-playground/     # Interactive API explorer
│   ├── search/             # Search functionality
│   └── layout.tsx         # Documentation layout
├── components/            # React components
│   ├── docs/             # Documentation components
│   ├── navigation/       # Nav components
│   ├── search/          # Search interface
│   ├── code/            # Code blocks
│   ├── api/             # API components
│   └── mdx/             # MDX components
├── content/             # Documentation content
│   ├── docs/           # MDX documentation files
│   ├── api/            # OpenAPI specs
│   ├── examples/       # Code examples
│   └── changelog/      # Version changes
├── lib/                # Utilities
│   ├── mdx/           # MDX processing
│   ├── search/        # Search indexing
│   ├── navigation/    # Nav generation
│   └── api-spec/      # API spec parsing
├── public/            # Static assets
│   ├── images/       # Documentation images
│   └── downloads/    # Downloadable resources
└── styles/           # Styles
```

### Documentation Architecture

```
┌─────────────────────────────────────┐
│      Documentation Platform         │
├─────────────────────────────────────┤
│  1. MDX Content Management          │
│  2. API Reference Generation        │
│  3. Interactive Code Examples       │
│  4. Version Management              │
│  5. Search Integration              │
│  6. Multi-language Support          │
└─────────────────────────────────────┘
```

## 📚 Content Structure

### Documentation Categories

#### 🚀 Getting Started
- Quick start guide
- Installation
- First application
- Basic concepts

#### 🔐 Authentication
- Email/password auth
- Social login
- Passkeys/WebAuthn
- Multi-factor auth
- Session management

#### 📡 API Reference
- REST API endpoints
- Authentication
- Error handling
- Rate limiting
- Pagination

#### 📦 SDKs
- JavaScript/TypeScript
- React
- Node.js
- Python (coming soon)
- Go (coming soon)

#### 🔔 Webhooks
- Event types
- Payload structure
- Security
- Retry logic
- Testing

#### 🛡️ Security
- Best practices
- Compliance
- Threat model
- Security headers
- Vulnerability disclosure

## 🎨 Features

### Search Functionality

```tsx
// Algolia DocSearch integration
<DocSearch
  appId={process.env.NEXT_PUBLIC_ALGOLIA_APP_ID}
  apiKey={process.env.NEXT_PUBLIC_ALGOLIA_API_KEY}
  indexName={process.env.NEXT_PUBLIC_ALGOLIA_INDEX}
/>
```

### Code Examples

```tsx
// Interactive code examples with live preview
<CodeExample
  title="Authentication Example"
  language="typescript"
  runnable
>
  {`
    import { JanuaClient } from '@janua/sdk';
    
    const client = new JanuaClient({
      apiKey: 'your-api-key'
    });
    
    const user = await client.auth.signIn({
      email: 'user@example.com',
      password: 'password'
    });
  `}
</CodeExample>
```

### API Playground

```tsx
// Interactive API testing
<APIPlayground
  spec="/api-spec/openapi.json"
  defaultAuth="bearer"
  tryItOut
/>
```

### Version Switcher

```tsx
// Documentation versioning
<VersionSelector>
  <option value="v2">v2.0 (latest)</option>
  <option value="v1">v1.0</option>
  <option value="beta">Beta</option>
</VersionSelector>
```

## 📝 Writing Documentation

### MDX Format

```mdx
---
title: "Authentication Guide"
description: "Learn how to implement authentication"
category: "Guides"
order: 2
---

import { Callout, CodeBlock } from '@/components/mdx';

# Authentication Guide

<Callout type="info">
  This guide covers authentication basics.
</Callout>

## Getting Started

<CodeBlock language="typescript">
{`// Your code here`}
</CodeBlock>
```

### Content Guidelines

1. **Clear Structure**: Use hierarchical headings
2. **Code Examples**: Provide runnable examples
3. **Visual Aids**: Include diagrams and screenshots
4. **Cross-references**: Link related content
5. **Versioning**: Mark version-specific content

## 🔍 Search Integration

### Algolia Configuration

```javascript
// lib/search/config.js
export const searchConfig = {
  appId: process.env.NEXT_PUBLIC_ALGOLIA_APP_ID,
  apiKey: process.env.NEXT_PUBLIC_ALGOLIA_API_KEY,
  indexName: 'janua-docs',
  facets: ['category', 'tags', 'version'],
};
```

### Search Indexing

```bash
# Index documentation content
yarn index:search

# Update search index
yarn update:search
```

## 🎯 Navigation

### Sidebar Generation

```typescript
// Automatic navigation from file structure
const navigation = generateNavigation({
  contentDir: './content/docs',
  order: ['getting-started', 'authentication', 'api-reference'],
});
```

### Breadcrumbs

```tsx
<Breadcrumbs>
  <Link href="/docs">Docs</Link>
  <Link href="/docs/authentication">Authentication</Link>
  <span>Email Login</span>
</Breadcrumbs>
```

## 🌐 Internationalization

### Supported Languages

- English (en) - Default
- Spanish (es) - Coming soon
- French (fr) - Coming soon
- German (de) - Coming soon
- Japanese (ja) - Coming soon

### Translation Workflow

```tsx
// Using next-i18next
import { useTranslation } from 'next-i18next';

export function DocPage() {
  const { t } = useTranslation('docs');
  return <h1>{t('title')}</h1>;
}
```

## 📊 Analytics

### Documentation Metrics

- Page views by section
- Search queries
- 404 errors
- Time on page
- Feedback ratings

### User Feedback

```tsx
<FeedbackWidget>
  <Question>Was this page helpful?</Question>
  <ThumbsUp />
  <ThumbsDown />
  <CommentBox />
</FeedbackWidget>
```

## 🧪 Testing

### Documentation Tests

```bash
# Lint markdown/MDX
yarn lint:docs

# Check broken links
yarn check:links

# Validate code examples
yarn test:examples

# Test search indexing
yarn test:search
```

## 🚢 Deployment

### Build Process

```bash
# Build documentation site
yarn build

# Export static site
yarn export

# Serve locally
yarn serve
```

### Deployment Configuration

```javascript
// next.config.js
module.exports = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  basePath: process.env.NODE_ENV === 'production' ? '' : '',
};
```

## 🎨 Theming

### Dark Mode Support

```tsx
// Automatic dark mode with system preference
<ThemeProvider
  attribute="class"
  defaultTheme="system"
  enableSystem
>
  <Documentation />
</ThemeProvider>
```

### Custom Themes

```css
/* Custom documentation theme */
:root {
  --docs-primary: #6366f1;
  --docs-background: #ffffff;
  --docs-foreground: #1e293b;
  --docs-muted: #64748b;
  --docs-border: #e2e8f0;
}
```

## 🔧 Configuration

### MDX Plugins

```javascript
// mdx.config.js
import remarkGfm from 'remark-gfm';
import rehypePrism from 'rehype-prism-plus';
import rehypeSlug from 'rehype-slug';

export const mdxConfig = {
  remarkPlugins: [remarkGfm],
  rehypePlugins: [rehypeSlug, rehypePrism],
};
```

## 🛠️ Development

### Local Development

```bash
# Start dev server
yarn dev

# Build and preview
yarn build && yarn preview

# Update dependencies
yarn update:deps
```

### Content Workflow

1. Write documentation in MDX
2. Add to navigation structure
3. Test locally
4. Submit PR for review
5. Auto-deploy on merge

## 📚 Resources

### Documentation Tools
- [MDX](https://mdxjs.com)
- [Algolia DocSearch](https://docsearch.algolia.com)
- [Prism.js](https://prismjs.com)
- [Mermaid](https://mermaid-js.github.io)

### Style Guides
- [Microsoft Style Guide](https://docs.microsoft.com/style-guide)
- [Google Developer Documentation Style Guide](https://developers.google.com/style)

## 🎯 Roadmap

### Current Sprint
- [ ] Fix port conflict with marketing app
- [ ] Complete API reference documentation
- [ ] Add interactive tutorials
- [ ] Implement version switcher

### Next Quarter
- [ ] Multi-language support
- [ ] Video tutorials
- [ ] API playground enhancements
- [ ] Community contributions

## 🤝 Contributing

See [Documentation Contributing Guide](../../docs/contributing/documentation.md).

## 📄 License

Part of the Janua platform. See [LICENSE](../../LICENSE) in the root directory.