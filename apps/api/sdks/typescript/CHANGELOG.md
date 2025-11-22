# Changelog

All notable changes to the Janua TypeScript SDK will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2025-01-19

### Added
- Initial release of Janua TypeScript SDK
- Complete authentication system (login, registration, password reset, email verification)
- User profile management and account settings
- Multi-factor authentication (TOTP, backup codes)
- Passkey authentication support (WebAuthn)
- Organization management with role-based access control
- OAuth integration for Google, GitHub, Microsoft, and custom providers
- Session management with device tracking and revocation
- Comprehensive error handling with typed error classes
- Automatic token refresh and secure storage options
- TypeScript-first design with full type safety
- Automatic retry logic with exponential backoff
- Cross-platform support (Browser, Node.js, React Native)
- Comprehensive test suite with >90% coverage
- Complete documentation with usage examples
- Admin operations for user management
- Rate limiting handling
- Network error recovery
- Custom token storage interface
- Debug logging capabilities

### Features
- **Authentication**: JWT tokens, API keys, OAuth flows, magic links
- **Security**: MFA, passkeys, session management, secure token storage
- **Organizations**: Multi-tenant support, team management, RBAC
- **TypeScript**: Full type definitions, IntelliSense support
- **Error Handling**: Structured error hierarchy, validation errors
- **Performance**: Automatic retries, token refresh, request optimization
- **Testing**: Comprehensive test coverage, mock implementations
- **Documentation**: Detailed API docs, usage examples, integration guides

### Technical Details
- Built with TypeScript 5.2+
- Uses Axios for HTTP requests
- Supports Node.js 16+ and modern browsers
- Zero dependencies beyond HTTP client
- Tree-shakeable ES modules
- Source maps for debugging
- Comprehensive TypeScript definitions

### Breaking Changes
- N/A (initial release)

### Migration Guide
- N/A (initial release)

### Known Issues
- WebAuthn passkey support requires HTTPS in production
- Some browser compatibility limitations for older browsers (IE11)
- Rate limiting retry logic may need tuning for high-volume applications

### Roadmap
- v0.2.0: WebSocket support for real-time notifications
- v0.3.0: Offline support and request queuing
- v0.4.0: React hooks and component library
- v0.5.0: Vue.js composition functions
- v1.0.0: Stable API release with backward compatibility guarantees