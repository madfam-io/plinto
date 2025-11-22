/**
 * Client factory functions for creating configured Janua clients
 */

import { JanuaClient } from '../client/janua-client';
import { AuthenticationMethod } from '../types/base';

// Utility function to create a client with sensible defaults
export function createClient(config: {
  base_url?: string;
  api_key?: string;
  debug?: boolean;
}): JanuaClient {
  return new JanuaClient({
    base_url: config.base_url || 'https://api.janua.dev',
    api_key: config.api_key,
    debug: config.debug || false,
    authentication_method: config.api_key
      ? AuthenticationMethod.API_KEY
      : AuthenticationMethod.JWT_TOKEN
  });
}