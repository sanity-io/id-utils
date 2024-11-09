/* eslint-disable no-console */
import {
  DocumentId,
  getDraftId,
  getPublishedId,
  getVersionId,
  getVersionNameFromId,
} from '@sanity/id-utils'

// Make the document id "foo". This would have thrown the provided id was not valid
const id = DocumentId('foo')

// get the draft id of foo
const draftId = getDraftId(id)

console.log(draftId)
// => drafts.foo

// get the id of the document in version "someversion"
const someVersionId = getVersionId(draftId, 'some-version')
console.log(someVersionId)
// => versions.some-version.foo

// get the id of the document in version "other-version"
const otherVersionId = getVersionId(draftId, 'other-version')
console.log(otherVersionId)
// => versions.other-version.foo

// get the published id of the version
console.log(getPublishedId(otherVersionId))
// => foo

// get the published id of the other version
console.log(getVersionNameFromId(otherVersionId))
// => other-version

// get the version name from the draft id
// @ts-expect-error - this is a type error because draft ids does not contain version names
console.log(getVersionNameFromId(draftId))
