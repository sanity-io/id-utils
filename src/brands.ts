import {type Brand, make} from 'ts-brand'

import {
  DRAFTS_PREFIX,
  VALID_ID,
  VARIANT_BUNDLE_SEPARATOR,
  VARIANT_PREFIX,
  VERSION_PREFIX,
} from './constants'
import {partition, safe} from './helpers'

/**
 * @public
 */
export type DraftId = Brand<string, 'draftId'>
/**
 * @public
 */
export type PublishedId = Brand<string, 'publishedId'>
/**
 * @public
 */
export type VersionId = Brand<string, 'versionId'>
/**
 * A variant version id is a version id whose bundle is a variant bundle,
 * optionally composed with a secondary source-layer bundle via `~`.
 *
 * Examples:
 *  - `versions.var-french.page-1`
 *  - `versions.var-french~drafts.page-1`
 *  - `versions.var-french~summer.page-1`
 *
 * @public
 */
export type VariantVersionId = VersionId &
  Brand<string, 'variantVersionId', '__variant__'>
/**
 * @public
 */
export type DocumentId = DraftId | PublishedId | VersionId

/**
 * @public
 */
export const DocumentId = make<DocumentId>((id: string) => {
  validateAnyId(id)
  const results = [validatePublishedId, validateDraftId, validateVersionId].map(
    validator => safe(() => validator(id)),
  )
  const [successes, errors] = partition(results, res => res.success)

  if (successes.length > 0) {
    return id
  }

  if (errors.length > 0) {
    throw new AggregateError(
      errors.map(res => res.error),
      `Invalid Document ID\n - ${errors.map(res => res.error.message).join('\n - ')}`,
    )
  }
  /* istanbul ignore */
  /* v8 ignore next 3 */
  return id
})

/**
 * @public
 */

export const DraftId = make<DraftId>(id => {
  validateAnyId(id)
  validateDraftId(id)
})
/**
 * @public
 */
export const PublishedId = make<PublishedId>(id => {
  validateAnyId(id)
  validatePublishedId(id)
})

/**
 * @public
 */
export const VersionId = make<VersionId>(id => {
  validateAnyId(id)
  validateVersionId(id)
})

/**
 * @public
 */
export const VariantVersionId = make<VariantVersionId>(id => {
  validateAnyId(id)
  validateVersionId(id)
  validateVariantVersionId(id)
})

function validateAnyId(id: string) {
  if (id.length === 0) {
    throw new Error(`Must be a non-empty string`)
  }
  if (!VALID_ID.test(id)) {
    throw new Error(
      `Not a valid document ID: "${id}" – Must match the ${VALID_ID} RegExp`,
    )
  }

  return id
}

function validateDraftId(id: string) {
  if (!id.startsWith(DRAFTS_PREFIX)) {
    throw new Error(
      `Not a valid draft ID: "${id}" – must start with "${DRAFTS_PREFIX}"`,
    )
  }
  if (id.length === DRAFTS_PREFIX.length) {
    throw new Error(
      `Not a valid draft ID: "${id}" – must have at least one character followed by "${DRAFTS_PREFIX}"`,
    )
  }
  if (id.includes(VARIANT_BUNDLE_SEPARATOR)) {
    throw new Error(
      `Not a valid draft ID: "${id}" – "${VARIANT_BUNDLE_SEPARATOR}" is only valid inside a variant bundle segment of a version ID`,
    )
  }
  return id
}

function validateVersionId(id: string) {
  if (!id.startsWith(VERSION_PREFIX)) {
    throw new Error(
      `Not a valid version ID: "${id}" – must start with "${VERSION_PREFIX}"`,
    )
  }
  if (id.length === VERSION_PREFIX.length) {
    throw new Error(
      `Not a valid version ID: "${id}" – must have at least one character followed by "${VERSION_PREFIX}"`,
    )
  }
  const [, versionName, ...documentId] = id.split('.')
  if (!versionName || !VALID_ID.test(versionName)) {
    throw new Error(
      `Not a valid version ID: "${id}" – VERSION must match the ${VALID_ID} RegExp in versions.[VERSION].id`,
    )
  }
  if (documentId.length === 0) {
    throw new Error(
      `Not a valid version ID: "${id}" – missing document ID in versions.bundle.[ID]`,
    )
  }
  if (versionName === 'drafts' || versionName === 'versions') {
    throw new Error(
      `Not a valid version ID: "${id}" – invalid VERSION "${versionName}" in versions.[VERSION].id`,
    )
  }
  if (versionName.includes(VARIANT_BUNDLE_SEPARATOR)) {
    // Composite bundle ids (`<primary>~<secondary>`) are only allowed when the
    // primary bundle is a variant bundle. Run the full variant validation, which
    // also covers secondary-bundle constraints.
    validateCompositeBundle(id, versionName)
  }
  if (documentId.some(part => part.includes(VARIANT_BUNDLE_SEPARATOR))) {
    throw new Error(
      `Not a valid version ID: "${id}" – "${VARIANT_BUNDLE_SEPARATOR}" is only valid in the bundle segment`,
    )
  }
  return id
}

function validateVariantVersionId(id: string) {
  // At this point `id` is known to be a valid version id. Just constrain the
  // bundle segment to a variant bundle.
  const [, versionName] = id.split('.')
  if (!versionName || !versionName.startsWith(VARIANT_PREFIX)) {
    throw new Error(
      `Not a valid variant version ID: "${id}" – bundle "${versionName}" must start with "${VARIANT_PREFIX}"`,
    )
  }
  if (versionName.includes(VARIANT_BUNDLE_SEPARATOR)) {
    validateCompositeBundle(id, versionName)
  } else {
    validateVariantBundleName(id, versionName)
  }
  return id
}

function validateVariantBundleName(id: string, bundle: string) {
  const name = bundle.slice(VARIANT_PREFIX.length)
  if (!name) {
    throw new Error(
      `Not a valid variant version ID: "${id}" – variant name in "${bundle}" must be non-empty`,
    )
  }
}

function validateCompositeBundle(id: string, bundle: string) {
  const parts = bundle.split(VARIANT_BUNDLE_SEPARATOR)
  if (parts.length !== 2) {
    throw new Error(
      `Not a valid version ID: "${id}" – composite bundle "${bundle}" must contain exactly one "${VARIANT_BUNDLE_SEPARATOR}" separator`,
    )
  }
  const [primary, secondary] = parts as [string, string]
  if (!primary.startsWith(VARIANT_PREFIX)) {
    throw new Error(
      `Not a valid version ID: "${id}" – "${VARIANT_BUNDLE_SEPARATOR}" is only allowed in variant bundles (expected primary to start with "${VARIANT_PREFIX}", got "${primary}")`,
    )
  }
  validateVariantBundleName(id, primary)
  if (!secondary) {
    throw new Error(
      `Not a valid variant version ID: "${id}" – secondary bundle in "${bundle}" must be non-empty`,
    )
  }
  if (secondary.startsWith(VARIANT_PREFIX)) {
    throw new Error(
      `Not a valid variant version ID: "${id}" – secondary bundle "${secondary}" cannot be a variant bundle`,
    )
  }
  if (secondary === 'published') {
    throw new Error(
      `Not a valid variant version ID: "${id}" – use the plain variant bundle (no "${VARIANT_BUNDLE_SEPARATOR}") to target the published source`,
    )
  }
  if (secondary === 'versions') {
    throw new Error(
      `Not a valid variant version ID: "${id}" – secondary bundle cannot be "versions"`,
    )
  }
}

function validatePublishedId(id: string) {
  if (id.startsWith(DRAFTS_PREFIX) || id.startsWith(VERSION_PREFIX)) {
    throw new Error(
      `Not a valid published ID: "${id}" – cannot start with "${DRAFTS_PREFIX}" or "${VERSION_PREFIX}"`,
    )
  }
  if (id.includes(VARIANT_BUNDLE_SEPARATOR)) {
    throw new Error(
      `Not a valid published ID: "${id}" – "${VARIANT_BUNDLE_SEPARATOR}" is only valid inside a variant bundle segment of a version ID`,
    )
  }
  return id
}
