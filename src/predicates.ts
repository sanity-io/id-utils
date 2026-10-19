import {
  type DocumentId,
  type DraftId,
  type PublishedId,
  type VariantDefinitionId,
  type VariantVersionId,
  type VersionId,
} from './brands'
import {
  DRAFTS_PREFIX,
  PATH_SEPARATOR,
  SYSTEM_DIR,
  VALID_SCOPE_ID,
  VARIANT_DEFINITION_PREFIX,
  VERSION_PREFIX,
} from './constants'
import {getPublishedId} from './converters'

/**
 *
 * Checks if two document ids resolves to the same published ID, ignoring any draft or version prefix.
 *
 * @public
 *
 * @param id - The document ID to check
 * @param otherId - The other document ID to check
 *
 * @example
 * Draft vs published document ID, but representing the same document:
 * ```
 * // Prints "true":
 * console.log(isPublishedIdEqual('drafts.foo', 'foo'));
 * ```
 * @example
 * Version vs published document ID, but representing the same document:
 * ```
 * // Prints "true":
 * console.log(isPublishedIdEqual('versions.xyz.foo', 'foo'));
 * ```
 * @example
 * Different documents:
 * ```
 * // Prints "false":
 * console.log(isPublishedIdEqual('foo', 'bar'));
 * ```
 *
 * @returns `true` if the document IDs represents the same document, `false` otherwise
 */
export function isPublishedIdEqual(
  id: DocumentId,
  otherId: DocumentId,
): boolean {
  return getPublishedId(id) === getPublishedId(otherId)
}

/**
 * Check whether a given document ID is a draft ID
 * @public
 * @param id - The document ID to check
 */
export function isDraftId(id: DocumentId): id is DraftId {
  return id.startsWith(DRAFTS_PREFIX)
}

/**
 * Check whether a given document ID is a published ID
 * @public
 * @param id - The document ID to check
 */
export function isPublishedId(id: DocumentId): id is PublishedId {
  return !isDraftId(id) && !isVersionId(id)
}

/**
 * Check whether a given document ID is a version ID
 * @public
 * @param id - The document ID to check
 */
export function isVersionId(id: DocumentId): id is VersionId {
  return id.startsWith(VERSION_PREFIX)
}

/**
 * Check whether a given document ID has the shape of a variant version ID:
 * `versions.{scopeId}.{publishedId}`, where `scopeId` is 16 base62 characters.
 *
 * The scope id is a one-way hash, so this check can only inspect the shape of
 * the id. A version id in a release whose name happens to be 16 base62
 * characters (e.g. `versions.a1b2c3d4e5f6g7h8.foo`) is indistinguishable from
 * a variant version id, and this function returns `true` for it.
 *
 * To establish variant definition membership with certainty, read the variants
 * from the document's `_system` attributes.
 *
 * @public
 * @param id - The document ID to check
 */
export function isVariantVersionIdLike(id: DocumentId): id is VariantVersionId {
  if (!isVersionId(id)) {
    return false
  }

  const [, scopeId, ...publishedId] = id.split(PATH_SEPARATOR)

  return (
    scopeId !== undefined &&
    VALID_SCOPE_ID.test(scopeId) &&
    !isSystemDocumentId(publishedId.join(PATH_SEPARATOR))
  )
}

/**
 * Check whether a given document ID is a variant definition ID
 * @public
 * @param id - The document ID to check
 */
export function isVariantDefinitionId(id: string): id is VariantDefinitionId {
  return id.startsWith(VARIANT_DEFINITION_PREFIX)
}

/**
 * Check whether a particular document ID is the draft ID of another document ID
 * @public
 * @param id - The document ID to check if the candidate is a draft of
 * @param candidate - The candidate document ID to check
 * Note: returns true for identical draft ids, i.e. isDraftOf(DraftId('drafts.foo'), DraftId('drafts.foo')) will be true.
 */
export function isDraftOf(
  id: DocumentId,
  candidate: DocumentId,
): candidate is DraftId {
  return isDraftId(candidate) && isPublishedIdEqual(id, candidate)
}

/**
 * Check whether a particular document ID is the published ID of another document ID
 * @public
 * @param id - The document ID to check if the candidate is a draft of
 * @param candidate - The candidate document ID to check
 *
 * Note: returns true for identical ids, i.e. isPublishedOf(PublishedId('foo'), PublishedId('foo')) will be true.
 */
export function isPublishedOf(
  id: DocumentId,
  candidate: DocumentId,
): candidate is VersionId {
  return isPublishedId(candidate) && isPublishedIdEqual(id, candidate)
}

/**
 * Check whether a particular document ID is a version ID of another document ID
 * @public
 * @param id - The document ID to check if the candidate is a draft of
 * @param candidate - The candidate document ID to check
 *
 * Note: returns true for identical versions, i.e. isVersionOf(VersionId('versions.xyz.foo'), VersionId('versions.xyz.foo')) will be true.
 */
export function isVersionOf(
  id: DocumentId,
  candidate: DocumentId,
): candidate is VersionId {
  return isVersionId(candidate) && isPublishedIdEqual(id, candidate)
}

/**
 * Check whether a published document ID is the ID of a system document, i.e.
 * its first path element is `_`.
 *
 * @internal
 */
export function isSystemDocumentId(publishedId: string): boolean {
  return publishedId.split(PATH_SEPARATOR)[0] === SYSTEM_DIR
}
