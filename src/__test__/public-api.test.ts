import {expect, test} from 'vitest'

import * as idUtils from '../'

test('exported methods', () => {
  expect(
    Object.entries(idUtils)
      .map(([name, sym]) => [name, typeof sym].join(': '))
      .toSorted(),
  ).toMatchInlineSnapshot(`
    [
      "DocumentId: function",
      "DraftId: function",
      "PublishedId: function",
      "VariantVersionId: function",
      "VersionId: function",
      "createDraftId: function",
      "createPublishedId: function",
      "createVariantVersionId: function",
      "createVersionId: function",
      "getDraftId: function",
      "getPublishedId: function",
      "getVariantBundleId: function",
      "getVariantName: function",
      "getVariantSecondaryBundle: function",
      "getVariantVersionId: function",
      "getVersionId: function",
      "getVersionNameFromId: function",
      "isDraftId: function",
      "isDraftOf: function",
      "isPublishedId: function",
      "isPublishedIdEqual: function",
      "isVariantOf: function",
      "isVariantVersionId: function",
      "isVersionId: function",
      "isVersionOf: function",
      "parseVariantBundleId: function",
    ]
  `)
})
