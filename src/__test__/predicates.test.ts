import {expect, test} from 'vitest'

import {DocumentId} from '../brands'
import {
  isDraftId,
  isDraftOf,
  isPublishedId,
  isPublishedIdEqual,
  isPublishedOf,
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
})
