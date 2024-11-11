import {
  type DocumentId,
  type DraftId,
  type PublishedId,
  type VersionId,
} from './brands'
import {DRAFTS_PREFIX, VERSION_PREFIX} from './constants'
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
