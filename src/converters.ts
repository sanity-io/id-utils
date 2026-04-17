import {
  type DocumentId,
  DraftId,
  parseVariantBundle,
  PublishedId,
  VariantVersionId,
  VersionId,
} from './brands'
import {
  DRAFTS_PREFIX,
  PATH_SEPARATOR,
  VARIANT_BUNDLE_SEPARATOR,
  VARIANT_PREFIX,
  VERSION_PREFIX,
} from './constants'
import {
  isDraftId,
  isPublishedId,
  isVariantVersionId,
  isVersionId,
} from './predicates'

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

/**
 * Parse a (potentially composite) variant bundle id.
 *
 * Examples:
 *  - `var-french` → `{variantName: 'french', secondaryBundle: null}`
 *  - `var-french~drafts` → `{variantName: 'french', secondaryBundle: 'drafts'}`
 *  - `var-french~summer` → `{variantName: 'french', secondaryBundle: 'summer'}`
 *
 * Throws if the bundle is not a variant bundle or is malformed.
 * @public
 * @param bundleId - the bundle id to parse
 */
export function parseVariantBundleId(bundleId: string): {
  variantName: string
  secondaryBundle: string | null
} {
  return parseVariantBundle(bundleId, `Invalid variant bundle id "${bundleId}"`)
}

/**
 * Build a (potentially composite) variant bundle id from a variant name and an
 * optional secondary source-layer bundle.
 *
 * Examples:
 *  - `getVariantBundleId('french')` → `var-french`
 *  - `getVariantBundleId('french', 'drafts')` → `var-french~drafts`
 *  - `getVariantBundleId('french', 'summer')` → `var-french~summer`
 * @public
 * @param variantName - the variant name, e.g. `french`
 * @param secondaryBundle - optional secondary bundle (e.g. `drafts`, or a release name)
 */
export function getVariantBundleId(
  variantName: string,
  secondaryBundle?: string,
): string {
  if (variantName.startsWith(VARIANT_PREFIX)) {
    throw new Error(
      `Invalid variant name "${variantName}": pass the bare variant name without the "${VARIANT_PREFIX}" prefix`,
    )
  }
  if (variantName.includes(VARIANT_BUNDLE_SEPARATOR)) {
    throw new Error(
      `Invalid variant name "${variantName}": must not contain "${VARIANT_BUNDLE_SEPARATOR}"`,
    )
  }
  const bundle =
    secondaryBundle === undefined
      ? `${VARIANT_PREFIX}${variantName}`
      : `${VARIANT_PREFIX}${variantName}${VARIANT_BUNDLE_SEPARATOR}${secondaryBundle}`
  // Round-trip through the canonical parser so all remaining rule checks live
  // in one place and error messages stay consistent.
  parseVariantBundle(bundle, `Invalid variant bundle id "${bundle}"`)
  return bundle
}

/**
 * Returns a variant version id for the given document id, variant name and
 * optional secondary source-layer bundle.
 *
 * When `id` unambiguously identifies a source layer (a draft id or a
 * non-variant version id), the secondary bundle is inferred from it and must
 * either be omitted or agree with the inferred value. When `id` is a published
 * or variant id, the secondary bundle is whatever is passed (omitted → target
 * the published source).
 * @public
 */
export function getVariantVersionId(
  id: DocumentId,
  variantName: string,
  secondaryBundle?: string,
): VariantVersionId {
  const inferred = inferSecondaryBundle(id)
  if (
    inferred !== undefined &&
    secondaryBundle !== undefined &&
    secondaryBundle !== inferred
  ) {
    throw new Error(
      `Cannot build variant version id from "${id}": secondary bundle must be "${inferred}" or omitted (got "${secondaryBundle}")`,
    )
  }
  const bundle = getVariantBundleId(variantName, inferred ?? secondaryBundle)
  return VariantVersionId(
    VERSION_PREFIX + bundle + PATH_SEPARATOR + getPublishedId(id),
  )
}

/**
 * Extract the variant name from a variant version id.
 *
 * e.g. `getVariantName(VariantVersionId('versions.var-french~drafts.page-1'))` → `french`
 * @public
 */
export function getVariantName(id: VariantVersionId): string {
  return parseVariantBundleId(getVersionNameFromId(id)).variantName
}

/**
 * Extract the secondary source-layer bundle from a variant version id, or
 * `null` if the variant targets the published source.
 *
 * e.g.
 *  - `getVariantSecondaryBundle('versions.var-french.page-1')` → `null`
 *  - `getVariantSecondaryBundle('versions.var-french~drafts.page-1')` → `'drafts'`
 *  - `getVariantSecondaryBundle('versions.var-french~summer.page-1')` → `'summer'`
 * @public
 */
export function getVariantSecondaryBundle(id: VariantVersionId): string | null {
  return parseVariantBundleId(getVersionNameFromId(id)).secondaryBundle
}

function inferSecondaryBundle(id: DocumentId): string | undefined {
  if (isVariantVersionId(id) || isPublishedId(id)) return undefined
  if (isDraftId(id)) return 'drafts'
  if (isVersionId(id)) return getVersionNameFromId(id)
  return undefined
}
