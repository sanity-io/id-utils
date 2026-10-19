import {type Brand, make} from 'ts-brand'

import {
  DRAFTS_PREFIX,
  PATH_SEPARATOR,
  SCOPE_ID_LENGTH,
  VALID_ID,
  VALID_SCOPE_ID,
  VARIANT_DEFINITION_PREFIX,
  VERSION_PREFIX,
} from './constants'
import {partition, safe} from './helpers'
import {isVariantVersionIdLike} from './predicates'

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
 * The id of a variant version document: `versions.{scopeId}.{publishedId}`.
 *
 * A variant version id is a version id, so it can be used anywhere a
 * `VersionId` or `DocumentId` is expected. Note that `scopeId` is a one-way
 * hash, so `getVersionNameFromId` returns the hash rather than a bundle name.
 *
 * @public
 */
export type VariantVersionId = Brand<
  VersionId,
  'variantVersionId',
  '__variantVersionType__'
>

/**
 * Brand a string as a `VariantVersionId`.
 *
 * Only the shape of the id is validated. The scope id is a one-way hash, so
 * a version id in a bundle whose name happens to be 16 base62 characters
 * cannot be told apart from a variant version id. Prefer
 * `createVariantVersionId` when the variant set and bundle are known.
 *
 * @public
 */
export const VariantVersionId = (id: string): VariantVersionId => {
  validateAnyId(id)
  validateVersionId(id)
  validateVariantVersionId(id)
  return id as VariantVersionId
}

/**
 * @public
 */
export type VariantDefinitionId = Brand<string, 'variantDefinitionId'>
/**
 * @public
 */
export const VariantDefinitionId = make<VariantDefinitionId>(id => {
  validateAnyId(id)
  validateVariantDefinitionId(id)
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
  return id
}

function validateVariantVersionId(id: string) {
  if (isVariantVersionIdLike(id as DocumentId)) {
    return id
  }

  // The id is a valid version id, so it is rejected either for its scope id or
  // for addressing a system document. Report which.
  const [, scopeId = ''] = id.split(PATH_SEPARATOR)
  if (!VALID_SCOPE_ID.test(scopeId)) {
    throw new Error(
      `Not a valid variant version ID: "${id}" – SCOPE must be ${SCOPE_ID_LENGTH} base62 characters in versions.[SCOPE].id`,
    )
  }
  throw new Error(
    `Not a valid variant version ID: "${id}" – variants of system documents are not permitted`,
  )
}

function validateVariantDefinitionId(id: string) {
  if (!id.startsWith(VARIANT_DEFINITION_PREFIX)) {
    throw new Error(
      `Not a valid variant definition ID: "${id}" – must start with "${VARIANT_DEFINITION_PREFIX}"`,
    )
  }
  if (id.length === VARIANT_DEFINITION_PREFIX.length) {
    throw new Error(
      `Not a valid variant definition ID: "${id}" – must have at least one character followed by "${VARIANT_DEFINITION_PREFIX}"`,
    )
  }
  return id
}

function validatePublishedId(id: string) {
  if (id.startsWith(DRAFTS_PREFIX) || id.startsWith(VERSION_PREFIX)) {
    throw new Error(
      `Not a valid published ID: "${id}" – cannot start with "${DRAFTS_PREFIX}" or "${VERSION_PREFIX}"`,
    )
  }
  return id
}
