import {type SanityDocument} from '@sanity/types'
import {assertType, describe, expectTypeOf, test} from 'vitest'

import {
  DocumentId,
  DraftId,
  PublishedId,
  VariantDefinitionId,
  VariantVersionId,
  VersionId,
} from '../brands'
import {getPublishedId} from '../converters'
import {createVariantVersionId} from '../create'
import {isVariantVersionIdLike} from '../predicates'

describe('string compatibility', () => {
  test('Document ids should be string compatible', () => {
    assertType<string>(DocumentId(''))
    assertType<string>(VersionId(''))
    assertType<string>(PublishedId(''))
    assertType<string>(VariantDefinitionId(''))
    assertType<string>(VariantVersionId(''))
    assertType<string>(DraftId(''))
  })
  test('It should be valid to use as document _id', () => {
    const totallyValid: SanityDocument = {
      _id: PublishedId('foobar'),
      _type: 'test-type',
      _rev: '??',
      _createdAt: '??',
      _updatedAt: '??',
    }
    assertType<{_id: string}>(totallyValid)
  })
})

describe('variant version ids', () => {
  test('are version ids and document ids', () => {
    assertType<VersionId>(VariantVersionId(''))
    assertType<DocumentId>(VariantVersionId(''))
    expectTypeOf(
      getPublishedId(VariantVersionId('')),
    ).toEqualTypeOf<PublishedId>()
  })
  test('cannot be assigned from other ids', () => {
    // @ts-expect-error - a version id is not necessarily a variant version id
    assertType<VariantVersionId>(VersionId(''))
    // @ts-expect-error - a plain string is not a variant version id
    assertType<VariantVersionId>('')
  })
  test('are narrowed by isVariantVersionIdLike', () => {
    const id = DocumentId('')
    if (isVariantVersionIdLike(id)) {
      expectTypeOf(id).toEqualTypeOf<VariantVersionId>()
    }
  })
  test('are created asynchronously', () => {
    expectTypeOf(
      createVariantVersionId({
        documentId: PublishedId(''),
        variantIds: '',
      }),
    ).toEqualTypeOf<Promise<VariantVersionId>>()
  })
})
