import {uuid} from '@sanity/uuid'

import {
  type DocumentId,
  DraftId,
  PublishedId,
  VariantDefinitionId,
  VariantVersionId,
  VersionId,
} from './brands'
import {
  DRAFTS_PREFIX,
  PATH_SEPARATOR,
  VARIANT_DEFINITION_PREFIX,
  VERSION_PREFIX,
} from './constants'
import {getPublishedId} from './converters'
import {assertString, describeType} from './helpers'
import {isSystemDocumentId} from './predicates'
import {createScopeId} from './scopeId'

const UNSAFE_CHARS = /[^a-zA-Z0-9_-]+/g
const LEADING = /^[_-]+/
const TRAILING = /[_-]+$/
const LATIN_LETTERS = /[\u00c0-\u00d6\u00d8-\u00f6\u00f8-\u017f]/g
const COMBINING_MARKS = /[\u0300-\u036f\ufe20-\ufe2f\u20d0-\u20ff]/g

// These Latin letters do not decompose into basic Latin letters when normalized.
const DEBURRED_LETTERS: Record<string, string> = {
  Æ: 'Ae',
  Ð: 'D',
  Ø: 'O',
  Þ: 'Th',
  ß: 'ss',
  æ: 'ae',
  ð: 'd',
  ø: 'o',
  þ: 'th',
  Đ: 'D',
  đ: 'd',
  Ħ: 'H',
  ħ: 'h',
  ı: 'i',
  Ĳ: 'IJ',
  ĳ: 'ij',
  ĸ: 'k',
  Ŀ: 'L',
  ŀ: 'l',
  Ł: 'L',
  ł: 'l',
  ŉ: "'n",
  Ŋ: 'N',
  ŋ: 'n',
  Œ: 'Oe',
  œ: 'oe',
  Ŧ: 'T',
  ŧ: 't',
  ſ: 's',
}

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
 * Create a new variant definition document id
 *
 * @param input Optional input string to create the id from.
 * The input string will be converted to a string safe to use as a sanity document id, i.e.
 * - stripped for any special characters
 * - capped at max 100 chars
 * If no input is provided, a random uuid will be used instead
 */
export function createVariantDefinitionId(input?: string): VariantDefinitionId {
  return VariantDefinitionId(VARIANT_DEFINITION_PREFIX + generateId(input))
}

/**
 * Create the id of a variant version document: `versions.{scopeId}.{publishedId}`.
 *
 * `scopeId` is a hash of the variant set and bundle, computed with the Web
 * Crypto API, which is why this function is async. Where Web Crypto is
 * unavailable, a JavaScript implementation is used instead.
 *
 * @public
 *
 * @param options - The document, variants and bundle to create the id for.
 *
 * @example
 * ```
 * // Prints "versions.DSLmihOUubL6ePkL.foo":
 * console.log(
 *   await createVariantVersionId({
 *     documentId: PublishedId('foo'),
 *     variantIds: ['french'],
 *   }),
 * )
 * ```
 */
export async function createVariantVersionId(options: {
  /**
   * The document to create a variant version id for. Draft and version ids
   * are reduced to their group id.
   */
  documentId: DocumentId
  /**
   * The variants the document belongs to, as variant ids (`french`) or variant
   * definition ids (`_.variants.french`). Variant membership is treated as a
   * set: order and duplicates do not affect the result.
   */
  variantIds: string | readonly string[]
  /**
   * The bundle the document belongs to, e.g. `drafts` or a release name.
   * Omit for the published bundle.
   */
  bundleId?: string
}): Promise<VariantVersionId> {
  const {documentId, variantIds, bundleId} = options

  assertString(documentId, 'document ID')

  const publishedId = getPublishedId(documentId)

  // Checked before hashing, as the variant version id cannot be valid.
  if (isSystemDocumentId(publishedId)) {
    throw new Error(
      `Cannot create a variant version ID for "${documentId}" – variants of system documents are not permitted`,
    )
  }

  const scopeId = await createScopeId(toVariantIdList(variantIds), bundleId)

  return VariantVersionId(
    VERSION_PREFIX + scopeId + PATH_SEPARATOR + publishedId,
  )
}

function toVariantIdList(
  variantIds: string | readonly string[],
): readonly string[] {
  if (typeof variantIds === 'string') {
    return [variantIds]
  }
  if (!Array.isArray(variantIds)) {
    throw new Error(
      `Not a valid list of variant IDs – must be a string or an array of strings, received ${describeType(variantIds)}.`,
    )
  }
  return variantIds
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

function deburr(input: string) {
  return input
    .replace(
      LATIN_LETTERS,
      letter =>
        DEBURRED_LETTERS[letter] ??
        letter.normalize('NFD').replace(COMBINING_MARKS, ''),
    )
    .replace(COMBINING_MARKS, '')
}
