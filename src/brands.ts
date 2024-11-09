import {type Brand, make} from 'ts-brand'

import {DRAFTS_PREFIX, VALID_ID, VERSION_PREFIX} from './constants'
import {partition, safe} from './helpers'

export type DraftId = Brand<string, 'draftId'>
export type PublishedId = Brand<string, 'publishedId'>
export type VersionId = Brand<string, 'versionId'>
export type DocumentId = DraftId | PublishedId | VersionId

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

export const DraftId = make<DraftId>(id => {
  validateAnyId(id)
  validateDraftId(id)
})
export const PublishedId = make<PublishedId>(id => {
  validateAnyId(id)
  validatePublishedId(id)
})

export const VersionId = make<VersionId>(id => {
  validateAnyId(id)
  validateVersionId(id)
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

function validatePublishedId(id: string) {
  if (id.startsWith(DRAFTS_PREFIX) || id.startsWith(VERSION_PREFIX)) {
    throw new Error(
      `Not a valid published ID: "${id}" – cannot start with "${DRAFTS_PREFIX}" or "${VERSION_PREFIX}"`,
    )
  }
  return id
}
