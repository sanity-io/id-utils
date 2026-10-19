import {
  BASE62_ALPHABET,
  BUNDLE_SEPARATOR,
  SCOPE_ID_DIGEST_BYTES,
  SCOPE_ID_LENGTH,
  VALID_PATH_ELEMENT,
  VARIANT_DEFINITION_PREFIX,
  VARIANT_SEPARATOR,
} from './constants'
import {getVariantId} from './converters'
import {assertString} from './helpers'

/**
 * Compute the scope id of a variant version document; the second segment found
 * in its id (`versions.{scopeId}.{documentGroupId}`).
 *
 * Content Lake owns the canonical implementation.
 *
 * @param variantIds - The variants the document belongs to, as variant ids or variant definition ids. Treated as a set.
 * @param bundleId - The bundle the document belongs to. Omit for the published bundle.
 */
export async function createScopeId(
  variantIds: readonly string[],
  bundleId?: string,
): Promise<string> {
  if (variantIds.length === 0) {
    throw new Error(`Must provide at least one variant ID`)
  }

  // Ids are restricted to ASCII, so sorting by UTF-16 code unit matches the
  // byte-wise sort Content Lake performs.
  const variantSet = [...new Set(variantIds.map(parseVariantId))].sort()

  if (bundleId !== undefined) {
    validateBundleId(bundleId)
  }

  const input =
    variantSet.join(VARIANT_SEPARATOR) +
    (bundleId === undefined ? '' : BUNDLE_SEPARATOR + bundleId)

  return encodeBase62(await sha256(input), SCOPE_ID_LENGTH)
}

/**
 * Validate a variant id or variant definition id, and return its variant id.
 * Errors report the value as provided, not the extracted variant id.
 */
function parseVariantId(value: string): string {
  assertString(value, 'variant ID')

  const variantId = getVariantId(value)

  if (!VALID_PATH_ELEMENT.test(variantId)) {
    const prefixNote =
      variantId === value
        ? ''
        : ` once the "${VARIANT_DEFINITION_PREFIX}" prefix is removed`
    throw new Error(
      `Not a valid variant ID: "${value}" – must match the ${VALID_PATH_ELEMENT} RegExp${prefixNote}.`,
    )
  }

  return variantId
}

const PUBLISHED_BUNDLE_HINT =
  'Omit the bundle ID to address the published bundle.'

function validateBundleId(bundleId: string) {
  assertString(bundleId, 'bundle ID', PUBLISHED_BUNDLE_HINT)

  if (!VALID_PATH_ELEMENT.test(bundleId)) {
    throw new Error(
      `Not a valid bundle ID: "${bundleId}" – must match the ${VALID_PATH_ELEMENT} RegExp. ${PUBLISHED_BUNDLE_HINT}`,
    )
  }
}

async function sha256(input: string): Promise<Uint8Array> {
  const bytes = new TextEncoder().encode(input)
  const subtle = globalThis.crypto?.subtle

  if (subtle) {
    return new Uint8Array(await subtle.digest('SHA-256', bytes))
  }

  // Web Crypto is unavailable in some environments, e.g. browsers outside a
  // secure context (HTTPS or localhost). The polyfill is only loaded when needed.
  const {sha256: sha256Polyfill} = await import('@noble/hashes/sha2.js')

  return sha256Polyfill(bytes)
}

/**
 * Mirrors Content Lake's base 62 encoder. The leading `SCOPE_ID_DIGEST_BYTES`
 * bytes of the digest are read as a big-endian integer, and its `length` least significant base62
 * digits are written right to left, zero padded.
 *
 * Note that this differs from truncating a full base62 encoding of the digest
 * (which a reading of the algorithm as `base62(sha256(input))[:16]` might
 * suggest), and produces different ids.
 */
function encodeBase62(digest: Uint8Array, length: number): string {
  const base = BigInt(BASE62_ALPHABET.length)

  let value = 0n

  for (const byte of digest.subarray(0, SCOPE_ID_DIGEST_BYTES)) {
    value = (value << 8n) | BigInt(byte)
  }

  let encoded = ''

  for (let index = 0; index < length; index++) {
    encoded = BASE62_ALPHABET.charAt(Number(value % base)) + encoded
    value /= base
  }

  return encoded
}
