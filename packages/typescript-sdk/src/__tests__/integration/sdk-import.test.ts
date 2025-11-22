/**
 * Integration test to ensure SDK can be imported and instantiated
 * This prevents regression of the circular dependency and module export issues
 */

import { JanuaClient, createClient } from '../../index';

describe('SDK Import and Instantiation', () => {
  test('SDK exports are available', () => {
    expect(JanuaClient).toBeDefined();
    expect(createClient).toBeDefined();
    expect(typeof JanuaClient).toBe('function');
    expect(typeof createClient).toBe('function');
  });

  test('Can instantiate JanuaClient directly', () => {
    const client = new JanuaClient({
      baseURL: 'https://api.janua.dev'
    });

    expect(client).toBeInstanceOf(JanuaClient);
    expect(client.auth).toBeDefined();
    expect(client.users).toBeDefined();
    expect(client.sessions).toBeDefined();
    expect(client.organizations).toBeDefined();
    expect(client.webhooks).toBeDefined();
    expect(client.admin).toBeDefined();
  });

  test('Can create client using factory function', () => {
    const client = createClient({
      baseURL: 'https://api.janua.dev'
    });

    expect(client).toBeInstanceOf(JanuaClient);
  });

  test('All convenience methods are present', () => {
    const client = new JanuaClient({
      baseURL: 'https://api.janua.dev'
    });

    expect(typeof client.signIn).toBe('function');
    expect(typeof client.signUp).toBe('function');
    expect(typeof client.signOut).toBe('function');
    expect(typeof client.getCurrentUser).toBe('function');
    expect(typeof client.isAuthenticated).toBe('function');
    expect(typeof client.getAccessToken).toBe('function');
    expect(typeof client.getRefreshToken).toBe('function');
  });

  test('Enterprise features are accessible', () => {
    const client = new JanuaClient({
      baseURL: 'https://api.janua.dev'
    });

    expect(typeof client.validateLicense).toBe('function');
    expect(typeof client.hasFeature).toBe('function');
    expect(typeof client.setLicenseKey).toBe('function');
    expect(typeof client.enableSSO).toBe('function');
    expect(typeof client.getAuditLogs).toBe('function');
  });

  test('No circular dependency errors on import', () => {
    // This test passes if the import statement at the top doesn't throw
    // The circular dependency issue manifested as "Cannot access 'PLANS' before initialization"
    expect(true).toBe(true);
  });
});