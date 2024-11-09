# @sanity/id-utils

Utilities for working with Sanity document IDs

# Features

- Added type safety through [branded types](https://egghead.io/blog/using-branded-types-in-typescript) via [ts-brand](https://github.com/kourge/ts-brand).
- Runtime validation of IDs. Tells you if you accidentally use an [invalid](https://www.sanity.io/docs/ids#10abf7adf05a) ID.
- Easily convert between the IDs the published documents, draft document and any version of a document.
- Generate safe document ids from strings, useful for importing from external systems that may have incompatible ids

## Usage example

```typescript
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
```