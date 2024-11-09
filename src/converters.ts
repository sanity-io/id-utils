import {type DocumentId, DraftId, PublishedId, VersionId} from './brands'
import {DRAFTS_PREFIX, PATH_SEPARATOR, VERSION_PREFIX} from './constants'
import {isDraftId, isPublishedId, isVersionId} from './predicates'

/**
 * Returns the published ID of the provided document ID
 * @public
 * @param id - the DocumentId to return the published ID for
 */
export function getPublishedId(id: DocumentId): PublishedId {
  if (isDraftId(id)) {
    return PublishedId(id.slice(DRAFTS_PREFIX.length))
  }
  if (isVersionId(id)) {
    // ["versions.", versionId, ...publishedIdParts]
    const [, , ...publishedId] = id.split(PATH_SEPARATOR)
    return PublishedId(publishedId.join(PATH_SEPARATOR))
  }
  return id
}

/**
 * Returns the draft ID of the provided document ID
 * @public
 * @param id - the DocumentId to return the draft ID for
 */
export function getDraftId(id: DocumentId): DraftId {
  if (isVersionId(id)) {
    // ["versions.", versionId, ...publishedIdParts]
    const [, , ...publishedId] = id.split(PATH_SEPARATOR)
    return DraftId(DRAFTS_PREFIX + publishedId.join(PATH_SEPARATOR))
  }
  if (isPublishedId(id)) {
    return DraftId(DRAFTS_PREFIX + id)
  }
  return id
}

/**
 * Returns a version ID of the provided document ID
 * @public
 * @param id - the DocumentId to return the version ID for
 * @param versionName - the name of the version to return a version ID for
 */
export function getVersionId(id: DocumentId, versionName: string): VersionId {
  if (isVersionId(id) || isDraftId(id)) {
    return getVersionId(getPublishedId(id), versionName)
  }
  return VersionId(VERSION_PREFIX + versionName + PATH_SEPARATOR + id)
}

/**
 *  @public
 *  Extracts and returns the version name of a version id
 *  e.g. getVersionNameFromId(VersionId(`versions.xyz.foo`)) = `xyz`
 *  @param id - the version id to extract version name from
 */
export function getVersionNameFromId(id: VersionId): string {
  // ["versions.", versionId, ...publishedIdParts]
  const [, versionId] = id.split(PATH_SEPARATOR)

  return versionId!
}
