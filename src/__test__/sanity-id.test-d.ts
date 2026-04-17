import {type SanityDocument} from '@sanity/types'
import {assertType, describe, test} from 'vitest'

import {
  DocumentId,
  DraftId,
  PublishedId,
  VariantVersionId,
  VersionId,
} from '../brands'

describe('string compatibility', () => {
  test('Document ids should be string compatible', () => {
    assertType<string>(DocumentId(''))
    assertType<string>(VersionId(''))
    assertType<string>(PublishedId(''))
    assertType<string>(DraftId(''))
    assertType<string>(VariantVersionId(''))
  })
  test('VariantVersionId is assignable to VersionId', () => {
    assertType<VersionId>(VariantVersionId('versions.var-french.foo'))
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
