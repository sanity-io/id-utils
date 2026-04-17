// `~` is accepted by the overall id regex but only valid inside a composite
// variant bundle segment (e.g. `versions.var-french~drafts.page-1`). Individual
// id-shape validators reject it outside that context.
export const VALID_ID = /^[a-z-A-Z0-9._~-]+$/

export const DRAFTS_DIR = 'drafts'
export const VERSION_DIR = 'versions'

export const PATH_SEPARATOR = '.'
export const DRAFTS_PREFIX = `${DRAFTS_DIR}${PATH_SEPARATOR}`
export const VERSION_PREFIX = `${VERSION_DIR}${PATH_SEPARATOR}`

// Variants are persisted as version documents whose bundle id starts with `var-`.
// Composite bundle ids compose a primary variant bundle with an optional secondary
// source-layer bundle using the `~` separator, e.g. `var-french~drafts`.
export const VARIANT_PREFIX = 'var-'
export const VARIANT_BUNDLE_SEPARATOR = '~'
