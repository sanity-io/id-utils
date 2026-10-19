import {describe, expect, it, test} from 'vitest'

import {DocumentId, VersionId} from '../brands'
import {
  getDraftId,
  getPublishedId,
  getVariantId,
  getVersionId,
  getVersionNameFromId,
} from '../converters'

test.each([
  ['From published id', 'somedoc', 'abcd', 'versions.abcd.somedoc'],
  ['From draft id', 'drafts.somedoc', 'abcd', 'versions.abcd.somedoc'],
  [
    'From same version id',
    'versions.abcd.somedoc',
    'abcd',
    'versions.abcd.somedoc',
  ],
  [
    'From other version id',
    'versions.winter-drop.somedoc',
    'abcd',
    'versions.abcd.somedoc',
  ],
])('getVersionId(): %s', (_, documentId, equalsDocumentId, shouldEqual) => {
  expect(getVersionId(DocumentId(documentId), equalsDocumentId)).toEqual(
    shouldEqual,
  )
})

test.each([
  ['from published id', 'somedoc', 'somedoc'],
  ['from draft id', 'drafts.somedoc', 'somedoc'],
  ['from version id', 'versions.abcd.somedoc', 'somedoc'],
  ['from complex id with version', 'versions.abcd.foo.somedoc', 'foo.somedoc'],
])('getPublishedId(): %s', (_, documentId, shouldEqual) => {
  expect(getPublishedId(DocumentId(documentId))).toEqual(shouldEqual)
})

describe('getVersionFromId', () => {
  it('should return the version id', () => {
    expect(getVersionNameFromId(VersionId('versions.abcd.document-id'))).toBe(
      'abcd',
    )
  })
})

test.each([
  ['from variant definition id', '_.variants.audience-a', 'audience-a'],
  ['from variant id', 'audience-a', 'audience-a'],
  ['from multi-segment variant definition id', '_.variants.foo.bar', 'foo.bar'],
  ['from bare variants path', '_.variants', '_.variants'],
])('getVariantId(): %s', (_, variantDefinitionId, shouldEqual) => {
  expect(getVariantId(variantDefinitionId)).toEqual(shouldEqual)
})

test.each([
  ['from published id', 'somedoc', 'drafts.somedoc'],
  ['from draft id', 'drafts.somedoc', 'drafts.somedoc'],
  ['from version id', 'versions.abcd.somedoc', 'drafts.somedoc'],
  [
    'from complex id with version',
    'versions.abcd.foo.somedoc',
    'drafts.foo.somedoc',
  ],
])('getDraftId(): %s', (_, documentId, shouldEqual) => {
  expect(getDraftId(DocumentId(documentId))).toEqual(shouldEqual)
})
