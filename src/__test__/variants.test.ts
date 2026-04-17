import {describe, expect, it, test} from 'vitest'

import {
  DocumentId,
  DraftId,
  PublishedId,
  VariantVersionId,
  VersionId,
} from '../brands'
import {
  getPublishedId,
  getVariantBundleId,
  getVariantName,
  getVariantSecondaryBundle,
  getVariantVersionId,
  parseVariantBundleId,
} from '../converters'
import {createVariantVersionId} from '../create'
import {
  isPublishedIdEqual,
  isVariantOf,
  isVariantVersionId,
  isVersionOf,
} from '../predicates'

describe('parseVariantBundleId', () => {
  test.each([
    ['var-french', 'french', null],
    ['var-french~drafts', 'french', 'drafts'],
    ['var-french~summer', 'french', 'summer'],
    ['var-french-premium~drafts', 'french-premium', 'drafts'],
  ])('%s', (bundle, variantName, secondaryBundle) => {
    expect(parseVariantBundleId(bundle)).toEqual({variantName, secondaryBundle})
  })

  it('rejects non-variant bundle ids', () => {
    expect(() => parseVariantBundleId('summer')).toThrow(
      /must start with "var-"/,
    )
  })

  it('rejects empty variant name', () => {
    expect(() => parseVariantBundleId('var-')).toThrow(/must be non-empty/)
  })

  it('rejects secondary "published"', () => {
    expect(() => parseVariantBundleId('var-french~published')).toThrow(
      /omit the secondary bundle/,
    )
  })

  it('rejects secondary var- bundles', () => {
    expect(() => parseVariantBundleId('var-french~var-german')).toThrow(
      /cannot be a variant bundle/,
    )
  })

  it('rejects multiple ~ separators', () => {
    expect(() => parseVariantBundleId('var-a~b~c')).toThrow(
      /at most one "~" separator/,
    )
  })
})

describe('getVariantBundleId', () => {
  test.each([
    ['french', undefined, 'var-french'],
    ['french', null, 'var-french'],
    ['french', 'drafts', 'var-french~drafts'],
    ['french', 'summer', 'var-french~summer'],
  ])('(%s, %s) → %s', (name, secondary, expected) => {
    expect(getVariantBundleId(name, secondary)).toEqual(expected)
  })

  it('rejects empty variant name', () => {
    expect(() => getVariantBundleId('')).toThrow(/must be non-empty/)
  })

  it('rejects variant name with var- prefix', () => {
    expect(() => getVariantBundleId('var-french')).toThrow(
      /must not include the "var-" prefix/,
    )
  })

  it('rejects variant name with ~', () => {
    expect(() => getVariantBundleId('fre~nch')).toThrow(/must not contain "~"/)
  })

  it('rejects secondary "published"', () => {
    expect(() => getVariantBundleId('french', 'published')).toThrow(
      /cannot be "published"/,
    )
  })

  it('rejects secondary var- bundle', () => {
    expect(() => getVariantBundleId('french', 'var-german')).toThrow(
      /cannot be a variant bundle/,
    )
  })
})

describe('getVariantVersionId', () => {
  test.each([
    [
      'from published id',
      'page-1',
      'french',
      undefined,
      'versions.var-french.page-1',
    ],
    [
      'from published id, drafts secondary',
      'page-1',
      'french',
      'drafts',
      'versions.var-french~drafts.page-1',
    ],
    [
      'from published id, release secondary',
      'page-1',
      'french',
      'summer',
      'versions.var-french~summer.page-1',
    ],
    [
      'from draft id (no secondary → drafts)',
      'drafts.page-1',
      'french',
      undefined,
      'versions.var-french~drafts.page-1',
    ],
    [
      'from draft id with drafts secondary',
      'drafts.page-1',
      'french',
      'drafts',
      'versions.var-french~drafts.page-1',
    ],
    [
      'from version id (no secondary → release name)',
      'versions.summer.page-1',
      'french',
      undefined,
      'versions.var-french~summer.page-1',
    ],
    [
      'from version id with matching secondary',
      'versions.summer.page-1',
      'french',
      'summer',
      'versions.var-french~summer.page-1',
    ],
    [
      'from variant version id (strips variant)',
      'versions.var-german.page-1',
      'french',
      undefined,
      'versions.var-french.page-1',
    ],
    [
      'from composite variant version id',
      'versions.var-german~drafts.page-1',
      'french',
      'drafts',
      'versions.var-french~drafts.page-1',
    ],
  ])('%s', (_, source, variantName, secondary, expected) => {
    expect(
      getVariantVersionId(DocumentId(source), variantName, secondary),
    ).toEqual(expected)
  })

  it('errors when draft source has conflicting secondary', () => {
    expect(() =>
      getVariantVersionId(DraftId('drafts.page-1'), 'french', 'summer'),
    ).toThrow(/must be "drafts" or omitted/)
  })

  it('errors when version source has conflicting secondary', () => {
    expect(() =>
      getVariantVersionId(
        VersionId('versions.summer.page-1'),
        'french',
        'winter',
      ),
    ).toThrow(/must be "summer" or omitted/)
  })
})

describe('getVariantName / getVariantSecondaryBundle', () => {
  test.each([
    ['versions.var-french.page-1', 'french', null],
    ['versions.var-french~drafts.page-1', 'french', 'drafts'],
    ['versions.var-french~summer.page-1', 'french', 'summer'],
    ['versions.var-french-premium~drafts.page-1', 'french-premium', 'drafts'],
  ])('%s', (id, name, secondary) => {
    const variantId = VariantVersionId(id)
    expect(getVariantName(variantId)).toEqual(name)
    expect(getVariantSecondaryBundle(variantId)).toEqual(secondary)
  })
})

describe('isVariantVersionId', () => {
  test.each([
    ['versions.var-french.page-1', true],
    ['versions.var-french~drafts.page-1', true],
    ['versions.var-french~summer.page-1', true],
    ['versions.summer.page-1', false],
    ['drafts.page-1', false],
    ['page-1', false],
  ])('%s → %s', (id, expected) => {
    expect(isVariantVersionId(DocumentId(id))).toEqual(expected)
  })
})

describe('isVariantOf', () => {
  it('matches variant versions sharing the same root doc', () => {
    expect(
      isVariantOf(
        PublishedId('page-1'),
        VariantVersionId('versions.var-french.page-1'),
      ),
    ).toBe(true)
    expect(
      isVariantOf(
        DraftId('drafts.page-1'),
        VariantVersionId('versions.var-french~drafts.page-1'),
      ),
    ).toBe(true)
  })
  it('does not match non-variant versions', () => {
    expect(
      isVariantOf(PublishedId('page-1'), VersionId('versions.summer.page-1')),
    ).toBe(false)
    expect(isVariantOf(PublishedId('page-1'), PublishedId('page-1'))).toBe(
      false,
    )
  })
  it('requires matching root doc id', () => {
    expect(
      isVariantOf(
        PublishedId('page-2'),
        VariantVersionId('versions.var-french.page-1'),
      ),
    ).toBe(false)
  })
  it('can filter by variant name', () => {
    expect(
      isVariantOf(
        PublishedId('page-1'),
        VariantVersionId('versions.var-french.page-1'),
        'french',
      ),
    ).toBe(true)
    expect(
      isVariantOf(
        PublishedId('page-1'),
        VariantVersionId('versions.var-french.page-1'),
        'german',
      ),
    ).toBe(false)
  })
})

describe('grouping compatibility', () => {
  it('getPublishedId drops composite bundle', () => {
    expect(
      getPublishedId(VariantVersionId('versions.var-french.page-1')),
    ).toEqual('page-1')
    expect(
      getPublishedId(VariantVersionId('versions.var-french~drafts.page-1')),
    ).toEqual('page-1')
    expect(
      getPublishedId(VariantVersionId('versions.var-french~summer.page-1')),
    ).toEqual('page-1')
  })

  it('isPublishedIdEqual groups variants with root doc', () => {
    expect(
      isPublishedIdEqual(
        PublishedId('page-1'),
        VariantVersionId('versions.var-french.page-1'),
      ),
    ).toBe(true)
    expect(
      isPublishedIdEqual(
        DraftId('drafts.page-1'),
        VariantVersionId('versions.var-french~drafts.page-1'),
      ),
    ).toBe(true)
    expect(
      isPublishedIdEqual(
        VersionId('versions.summer.page-1'),
        VariantVersionId('versions.var-french~summer.page-1'),
      ),
    ).toBe(true)
  })

  it('isVersionOf treats variant versions as versions of the root', () => {
    expect(
      isVersionOf(
        PublishedId('page-1'),
        VariantVersionId('versions.var-french~drafts.page-1'),
      ),
    ).toBe(true)
  })
})

describe('createVariantVersionId', () => {
  it('creates a variant version id with a random uuid when no input provided', () => {
    const id = createVariantVersionId('french')
    expect(id.startsWith('versions.var-french.')).toBe(true)
  })

  it('creates a composite variant version id with secondary bundle', () => {
    const id = createVariantVersionId('french', 'drafts', 'My Page')
    expect(id).toEqual('versions.var-french~drafts.MyPage')
  })

  it('validates the generated id', () => {
    expect(isVariantVersionId(createVariantVersionId('french'))).toBe(true)
  })
})
