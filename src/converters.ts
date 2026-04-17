import {
  type DocumentId,
  DraftId,
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
  if (!bundleId.startsWith(VARIANT_PREFIX)) {
    throw new Error(
      `Not a variant bundle id: "${bundleId}" – must start with "${VARIANT_PREFIX}"`,
    )
  }
  const hasSeparator = bundleId.includes(VARIANT_BUNDLE_SEPARATOR)
  const parts = bundleId.split(VARIANT_BUNDLE_SEPARATOR)
  if (parts.length > 2) {
    throw new Error(
      `Not a valid variant bundle id: "${bundleId}" – at most one "${VARIANT_BUNDLE_SEPARATOR}" separator is allowed`,
    )
  }
  const [primary, secondary] = parts as [string, string | undefined]
  const variantName = primary.slice(VARIANT_PREFIX.length)
  if (!variantName) {
    throw new Error(
      `Not a valid variant bundle id: "${bundleId}" – variant name must be non-empty`,
    )
  }
  if (hasSeparator) {
    if (!secondary) {
      throw new Error(
        `Not a valid variant bundle id: "${bundleId}" – secondary bundle must be non-empty`,
      )
    }
    if (secondary.startsWith(VARIANT_PREFIX)) {
      throw new Error(
        `Not a valid variant bundle id: "${bundleId}" – secondary bundle cannot be a variant bundle`,
      )
    }
    if (secondary === 'published') {
      throw new Error(
        `Not a valid variant bundle id: "${bundleId}" – omit the secondary bundle to target the published source`,
      )
    }
  }
  return {
    variantName,
    secondaryBundle: hasSeparator ? (secondary as string) : null,
  }
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
  secondaryBundle?: string | null,
): string {
  if (!variantName) {
    throw new Error('variantName must be non-empty')
  }
  if (variantName.startsWith(VARIANT_PREFIX)) {
    throw new Error(
      `variantName must not include the "${VARIANT_PREFIX}" prefix (got "${variantName}")`,
    )
  }
  if (variantName.includes(VARIANT_BUNDLE_SEPARATOR)) {
    throw new Error(
      `variantName must not contain "${VARIANT_BUNDLE_SEPARATOR}" (got "${variantName}")`,
    )
  }
  const primary = `${VARIANT_PREFIX}${variantName}`
  if (secondaryBundle === undefined || secondaryBundle === null) {
    return primary
  }
  if (!secondaryBundle) {
    throw new Error('secondaryBundle must be non-empty when provided')
  }
  if (secondaryBundle.startsWith(VARIANT_PREFIX)) {
    throw new Error(
      `secondaryBundle cannot be a variant bundle (got "${secondaryBundle}")`,
    )
  }
  if (secondaryBundle === 'published') {
    throw new Error(
      'secondaryBundle cannot be "published" – omit it to target the published source',
    )
  }
  if (secondaryBundle.includes(VARIANT_BUNDLE_SEPARATOR)) {
    throw new Error(
      `secondaryBundle must not contain "${VARIANT_BUNDLE_SEPARATOR}" (got "${secondaryBundle}")`,
    )
  }
  return `${primary}${VARIANT_BUNDLE_SEPARATOR}${secondaryBundle}`
}

/**
 * Returns a variant version id for the given document id, variant name and
 * optional secondary source-layer bundle.
 *
 * If `id` is a draft id, the resulting variant version targets the draft source
 * layer and `secondaryBundle` must be omitted or `'drafts'`. If `id` is a
 * non-variant version id, the resulting variant version targets that version's
 * bundle as the secondary source layer and `secondaryBundle` must be omitted or
 * equal to that bundle.
 * @public
 */
export function getVariantVersionId(
  id: DocumentId,
  variantName: string,
  secondaryBundle?: string | null,
): VariantVersionId {
  if (isVariantVersionId(id)) {
    return getVariantVersionId(getPublishedId(id), variantName, secondaryBundle)
  }
  let resolvedSecondary: string | null | undefined = secondaryBundle
  if (isDraftId(id)) {
    if (resolvedSecondary !== undefined && resolvedSecondary !== 'drafts') {
      throw new Error(
        `Cannot build variant version id: secondary bundle must be "drafts" or omitted when deriving from a draft id (got "${resolvedSecondary}")`,
      )
    }
    resolvedSecondary = 'drafts'
  } else if (isVersionId(id)) {
    const sourceBundle = id.split(PATH_SEPARATOR)[1]!
    if (
      resolvedSecondary !== undefined &&
      resolvedSecondary !== null &&
      resolvedSecondary !== sourceBundle
    ) {
      throw new Error(
        `Cannot build variant version id: secondary bundle must be "${sourceBundle}" or omitted when deriving from a version id in bundle "${sourceBundle}" (got "${resolvedSecondary}")`,
      )
    }
    resolvedSecondary = sourceBundle
  }
  const bundle = getVariantBundleId(variantName, resolvedSecondary ?? null)
  return VariantVersionId(
    VERSION_PREFIX + bundle + PATH_SEPARATOR + getPublishedId(id),
  )
}

/**
 * Extract the variant name from a variant version id.
 *
 * e.g. `getVariantName(VariantVersionId('versions.var-french~drafts.page-1'))` → `french`
 * @public
 * @param id - the variant version id
 */
export function getVariantName(id: VariantVersionId): string {
  const bundle = id.split(PATH_SEPARATOR)[1]!
  const {variantName} = parseVariantBundleId(bundle)
  return variantName
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
 * @param id - the variant version id
 */
export function getVariantSecondaryBundle(id: VariantVersionId): string | null {
  const bundle = id.split(PATH_SEPARATOR)[1]!
  const {secondaryBundle} = parseVariantBundleId(bundle)
  return secondaryBundle
}
