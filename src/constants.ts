export const VALID_ID = /^[a-z-A-Z0-9._-]+$/

export const DRAFTS_DIR = 'drafts'
export const VERSION_DIR = 'versions'
export const SYSTEM_DIR = '_'
export const VARIANT_DEFINITIONS_DIR = '_.variants'

export const PATH_SEPARATOR = '.'
export const DRAFTS_PREFIX = `${DRAFTS_DIR}${PATH_SEPARATOR}`
export const VERSION_PREFIX = `${VERSION_DIR}${PATH_SEPARATOR}`
export const VARIANT_DEFINITION_PREFIX = `${VARIANT_DEFINITIONS_DIR}${PATH_SEPARATOR}`

// A single element of a document path. Variant ids and bundle ids are both
// validated against this, which guarantees the scope id separators below can
// never occur inside them.
export const VALID_PATH_ELEMENT = /^[a-zA-Z0-9_][a-zA-Z0-9_-]*$/

export const SCOPE_ID_LENGTH = 16

// The number of leading SHA-256 digest bytes a scope id is encoded from. 128
// bits comfortably exceed the ~95 bits that `SCOPE_ID_LENGTH` base62
// characters can hold.
export const SCOPE_ID_DIGEST_BYTES = 16

export const BASE62_ALPHABET =
  '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'

export const VALID_SCOPE_ID = new RegExp(`^[0-9a-zA-Z]{${SCOPE_ID_LENGTH}}$`)

// The two separators must differ, or a set of variants would be
// indistinguishable from a smaller set of variants in a bundle.
export const VARIANT_SEPARATOR = '\x01'
export const BUNDLE_SEPARATOR = '\x00'
