import {uuid} from '@sanity/uuid'
import {deburr} from 'lodash'

import {DraftId, PublishedId, VariantVersionId, VersionId} from './brands'
import {DRAFTS_PREFIX, PATH_SEPARATOR, VERSION_PREFIX} from './constants'
import {getVariantBundleId} from './converters'

const UNSAFE_CHARS = /[^a-zA-Z0-9_-]+/g
const LEADING = /^[_-]+/
const TRAILING = /[_-]+$/

// Note: Document IDs have a max limit of 128 characters, but we need to leave some breathing room
// for the prefix and separator characters.
//  - the version prefix is (9 chars)
//  - version name is typically 9 chars
//  - the path separator is one char
const GENERATED_IDS_MAX_LENGTH = 96

/**
 * Create a new document id
 *
 * @param input Optional input string to create the id from.
 * The input string will be converted to a string safe to use as a sanity document id, i.e.
 * - stripped for any special characters
 * - capped at max 100 chars
 * If no input is provided, a random uuid will be used instead
 */
export function createPublishedId(input?: string): PublishedId {
  return PublishedId(generateId(input))
}

/**
 * Create a new draft id
 *
 * @param input Optional input string to create the id from.
 * The input string will be converted to a string safe to use as a sanity document id, i.e.
 * - stripped for any special characters
 * - capped at max 100 chars
 * If no input is provided, a random uuid will be used instead
 */
export function createDraftId(input?: string): DraftId {
  return DraftId(DRAFTS_PREFIX + generateId(input))
}

/**
 * Create a new version id
 *
 * @param versionName - The name of the version to create
 * @param input Optional input string to create the id from.
 * The input string will be converted to a string safe to use as a sanity document id, i.e.
 * - stripped for any special characters
 * - capped at max 100 chars
 * If no input is provided, a random uuid will be used instead
 */
export function createVersionId(
  versionName: string,
  input?: string,
): VersionId {
  return VersionId(
    VERSION_PREFIX + versionName + PATH_SEPARATOR + generateId(input),
  )
}

/**
 * Create a new variant version id
 *
 * @public
 * @param variantName - The variant name, e.g. `french`
 * @param secondaryBundle - Optional secondary source-layer bundle. Omit to
 *   target the published source. Pass `'drafts'` to target the draft source,
 *   or a release name to target that release.
 * @param input - Optional input string to create the id from. See
 *   {@link createPublishedId} for how the input is sanitized.
 */
export function createVariantVersionId(
  variantName: string,
  secondaryBundle?: string,
  input?: string,
): VariantVersionId {
  const bundle = getVariantBundleId(variantName, secondaryBundle)
  return VariantVersionId(
    VERSION_PREFIX + bundle + PATH_SEPARATOR + generateId(input),
  )
}

function generateId(input?: string) {
  return input ? makeSafe(input) : uuid()
}

function makeSafe(input: string) {
  return deburr(input)
    .replace(UNSAFE_CHARS, '')
    .replace(TRAILING, '')
    .replace(LEADING, '')
    .slice(0, GENERATED_IDS_MAX_LENGTH)
}
