import {afterEach, beforeEach, vi} from 'vitest'

/**
 * The SHA-256 implementations `createScopeId` can use. Suites that run under
 * each of them verify the native and polyfilled paths produce identical ids.
 */
export const SHA256_IMPLEMENTATIONS = [
  {name: 'Web Crypto', crypto: 'native'},
  {name: '@noble/hashes, without globalThis.crypto', crypto: undefined},
  // Browsers outside a secure context expose `crypto` without `crypto.subtle`.
  {name: '@noble/hashes, without globalThis.crypto.subtle', crypto: {}},
] as const

/**
 * Make the given implementation the one used for the duration of each test.
 */
export function useSha256Implementation(
  implementation: (typeof SHA256_IMPLEMENTATIONS)[number],
) {
  beforeEach(() => {
    if (implementation.crypto !== 'native') {
      vi.stubGlobal('crypto', implementation.crypto)
    }
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })
}
