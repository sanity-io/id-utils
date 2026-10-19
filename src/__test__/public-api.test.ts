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
      "VariantDefinitionId: function",
      "VariantVersionId: function",
      "VersionId: function",
      "createDraftId: function",
      "createPublishedId: function",
      "createVariantDefinitionId: function",
      "createVariantVersionId: function",
      "createVersionId: function",
      "getDraftId: function",
      "getPublishedId: function",
      "getVariantId: function",
      "getVersionId: function",
      "getVersionNameFromId: function",
      "isDraftId: function",
      "isDraftOf: function",
      "isPublishedId: function",
      "isPublishedIdEqual: function",
      "isVariantDefinitionId: function",
      "isVariantVersionIdLike: function",
      "isVersionId: function",
      "isVersionOf: function",
    ]
  `)
})
