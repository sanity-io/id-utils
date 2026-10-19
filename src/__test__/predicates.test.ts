import {expect, test} from 'vitest'

import {DocumentId, VariantVersionId} from '../brands'
import {safe} from '../helpers'
import {
  isDraftId,
  isDraftOf,
  isPublishedId,
  isPublishedIdEqual,
  isPublishedOf,
  isVariantDefinitionId,
  isVariantVersionIdLike,
  isVersionId,
  isVersionOf,
} from '../predicates'

type TestCase = {
  description: string
  lhs: string
  rhs: string
  expected: boolean
}

function _case(
  description: string,
  lhs: string,
  rhs: string,
  expected: boolean,
): TestCase {
  return {description, lhs, rhs, expected}
}

const variations = Object.entries({
  published: 'foo',
  draft: 'drafts.foo',
  version: 'versions.xyz.foo',
})

const cases: TestCase[] = variations.flatMap(([variation, id]) => {
  return variations.flatMap(([otherVariation, otherId]) => {
    return variation === otherVariation
      ? _case(`full equality, ${variation}`, id, otherId, true)
      : [
          _case(`lhs ${variation}, rhs ${otherVariation}`, id, otherId, true),
          _case(`lhs ${otherVariation}, rhs ${variation}`, otherId, id, true),
          _case(`different ${variation} lhs`, 'another-doc', id, false),
          _case(`different ${variation} rhs`, id, 'another-doc', false),
        ]
  })
})

test.each(cases)(
  `isPublishedIdEqual($lhs, $rhs) -> $expected, $description`,
  ({lhs, rhs, expected, description}) => {
    expect(
      isPublishedIdEqual(DocumentId(lhs), DocumentId(rhs)),
      description,
    ).toBe(expected)
  },
)

test('isVersionOf()', () => {
  expect(isVersionOf(DocumentId('foo'), DocumentId('versions.xyz.foo'))).toBe(
    true,
  )
  expect(
    isVersionOf(DocumentId('versions.xyz.foo'), DocumentId('versions.xyz.foo')),
  ).toBe(true)
  expect(
    isVersionOf(DocumentId('drafts.foo'), DocumentId('versions.xyz.foo')),
  ).toBe(true)

  expect(
    isVersionOf(DocumentId('versions.xyz.foo'), DocumentId('versions.xyz.foo')),
  ).toBe(true)

  expect(
    isVersionOf(DocumentId('versions.xyz.foo'), DocumentId('versions.xyz.bar')),
  ).toBe(false)
  expect(
    isVersionOf(DocumentId('versions.xyz.foo'), DocumentId('versions.xyz.bar')),
  ).toBe(false)
})

test('isDraftOf()', () => {
  expect(isDraftOf(DocumentId('foo'), DocumentId('drafts.foo'))).toBe(true)
  expect(isDraftOf(DocumentId('drafts.foo'), DocumentId('drafts.foo'))).toBe(
    true,
  )

  expect(
    isDraftOf(DocumentId('versions.xyz.foo'), DocumentId('drafts.foo')),
  ).toBe(true)

  expect(
    isDraftOf(DocumentId('versions.xyz.foo'), DocumentId('versions.xyz.bar')),
  ).toBe(false)
  expect(
    isDraftOf(DocumentId('versions.xyz.foo'), DocumentId('versions.xyz.bar')),
  ).toBe(false)
})

test('isPublishedOf()', () => {
  expect(isPublishedOf(DocumentId('drafts.foo'), DocumentId('foo'))).toBe(true)
  expect(isPublishedOf(DocumentId('foo'), DocumentId('foo'))).toBe(true)
  expect(isPublishedOf(DocumentId('drafts.foo'), DocumentId('foo'))).toBe(true)

  expect(isPublishedOf(DocumentId('versions.xyz.foo'), DocumentId('foo'))).toBe(
    true,
  )

  expect(isPublishedOf(DocumentId('versions.xyz.foo'), DocumentId('bar'))).toBe(
    false,
  )
  expect(isPublishedOf(DocumentId('foo'), DocumentId('bar'))).toBe(false)
})

test('isPublishedId/isDraftId/isVersionId', () => {
  expect(isPublishedId(DocumentId('foo'))).toBe(true)
  expect(isPublishedId(DocumentId('bar'))).toBe(true)
  expect(isPublishedId(DocumentId('_.variants.audience-a'))).toBe(true)
  expect(isPublishedId(DocumentId('versions.foo.bar'))).toBe(false)
  expect(isPublishedId(DocumentId('drafts.bar'))).toBe(false)

  expect(isDraftId(DocumentId('drafts.foo'))).toBe(true)
  expect(isDraftId(DocumentId('drafts.bar.baz'))).toBe(true)
  expect(isDraftId(DocumentId('versions.foo.bar'))).toBe(false)
  expect(isDraftId(DocumentId('bar'))).toBe(false)

  expect(isVersionId(DocumentId('versions.foo.bar'))).toBe(true)
  expect(isVersionId(DocumentId('versions.xyz.bar.baz'))).toBe(true)
  expect(isVersionId(DocumentId('drafts.foo.bar'))).toBe(false)
  expect(isVersionId(DocumentId('bar'))).toBe(false)

  expect(isVariantDefinitionId(DocumentId('_.variants.audience-a'))).toBe(true)
  expect(isVariantDefinitionId(DocumentId('_.variants.foo.bar'))).toBe(true)
  expect(isVariantDefinitionId(DocumentId('foo'))).toBe(false)
  expect(isVariantDefinitionId(DocumentId('drafts.foo'))).toBe(false)
})

const variantVersionIdCases = [
  {id: 'versions.DSLmihOUubL6ePkL.foo', expected: true},
  {id: 'versions.DSLmihOUubL6ePkL.foo.bar', expected: true},
  {id: 'versions.0000000000000000._foo', expected: true},
  // Indistinguishable from a variant version id: the scope id is a hash.
  {id: 'versions.a1b2c3d4e5f6g7h8.foo', expected: true},
  {id: 'versions.summer.foo', expected: false},
  {id: 'versions.DSLmihOUubL6ePk.foo', expected: false},
  {id: 'versions.DSLmihOUubL6ePkLx.foo', expected: false},
  {id: 'versions.DSLmihOUubL6ePk_.foo', expected: false},
  {id: 'versions.DSLmihOUubL6ePk-.foo', expected: false},
  {id: 'versions.DSLmihOUubL6ePkL._.variants.german', expected: false},
  {id: 'drafts.foo', expected: false},
  {id: 'foo', expected: false},
  {id: 'DSLmihOUubL6ePkL.foo', expected: false},
  {id: '_.variants.DSLmihOUubL6ePkL', expected: false},
]

test.each(variantVersionIdCases)(
  'isVariantVersionIdLike($id) -> $expected',
  ({id, expected}) => {
    expect(isVariantVersionIdLike(DocumentId(id))).toBe(expected)
  },
)

test.each(variantVersionIdCases)(
  'isVariantVersionIdLike($id) agrees with the VariantVersionId brand',
  ({id}) => {
    expect(isVariantVersionIdLike(DocumentId(id))).toBe(
      safe(() => VariantVersionId(id)).success,
    )
  },
)
