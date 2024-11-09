import {type SanityDocument} from '@sanity/types'
import {assertType, describe, test} from 'vitest'

import {DocumentId, DraftId, PublishedId, VersionId} from '../brands'

describe('string compatibility', () => {
  test('Document ids should be string compatible', () => {
    assertType<string>(DocumentId(''))
    assertType<string>(VersionId(''))
    assertType<string>(PublishedId(''))
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
