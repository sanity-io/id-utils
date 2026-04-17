# @sanity/id-utils

Utilities for working with Sanity document IDs

# Why?
Quite often you'll see an APIs that takes a Sanity document ID as a `string`, but in many cases there’s an implicit expectation in the API about this document ID being either a published ID or a draft ID. Passing the wrong type of ID can lead to subtle errors, and at the same time guarding against this often leads to lots of redundant checks in places we a certain document ID variant is required.

With the help from this library, and it’s use of [branded types](https://www.learningtypescript.com/articles/branded-types) functions and components can now declare which ID variant they need as part of their signature, which provides developers with immediate feedback if attempting to pass the wrong variant.


For example, imagine that this component has an implicit assumption that `props.id` will always be the id of the published document:
```typescript
function SomeComponent(props: {id: string}) {
//... Things will break in spectacular ways if `props.id` is a draft id
}
```
This can now be written this way:
```typescript
function SomeComponent(props: {id: PublishedId}) {
//...
}
````
If you try to pass this component a draft id now, you’ll immediately see an error in your IDE
```tsx
<SomeComponent id={someDraftId} />
// TS2322: Type string is not assignable to type PublishedId
// Or, if it's of the DraftId type:
// TS2322: Type DraftId is not assignable to type PublishedId
```

You will have to make sure to turn it into a published id before passing it:
```tsx
<SomeComponent id={getPublishedId(someDraftId)} />
```

# Features

- Added type safety through [branded types](https://www.learningtypescript.com/articles/branded-types) via [ts-brand](https://github.com/kourge/ts-brand).
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

## Variant document ids

Variants are document-level overlays (e.g. `french`, `enterprise`) implemented
on top of the versions system. A variant document is a version document whose
bundle id starts with `var-`. The bundle can additionally encode the source
layer (draft or release) using a `~` separator:

| Source document          | Variant version id                        |
| ------------------------ | ----------------------------------------- |
| `page-1` (published)     | `versions.var-french.page-1`              |
| `drafts.page-1`          | `versions.var-french~drafts.page-1`       |
| `versions.summer.page-1` | `versions.var-french~summer.page-1`       |

Because the final segment is always the root document id, grouping and
`getPublishedId` work without any special-casing.

```typescript
import {
  DraftId,
  PublishedId,
  VariantVersionId,
  createVariantVersionId,
  getPublishedId,
  getVariantBundleId,
  getVariantName,
  getVariantSecondaryBundle,
  getVariantVersionId,
  isVariantOf,
  isVariantVersionId,
  parseVariantBundleId,
} from '@sanity/id-utils'

// Build a variant id from any document id. The source layer is inferred:
getVariantVersionId(PublishedId('page-1'), 'french')
// => versions.var-french.page-1

getVariantVersionId(DraftId('drafts.page-1'), 'french')
// => versions.var-french~drafts.page-1

getVariantVersionId(PublishedId('page-1'), 'french', 'summer')
// => versions.var-french~summer.page-1

// Extract variant info from a variant id:
const id = VariantVersionId('versions.var-french~drafts.page-1')
getVariantName(id) // => 'french'
getVariantSecondaryBundle(id) // => 'drafts'
getPublishedId(id) // => 'page-1'

// Variant ids are also version ids, so the existing helpers work:
isVariantVersionId(id) // => true
isVariantOf(PublishedId('page-1'), id) // => true
isVariantOf(PublishedId('page-1'), id, 'french') // => true (name filter)

// Parse or build a bundle id on its own:
parseVariantBundleId('var-french~summer')
// => {variantName: 'french', secondaryBundle: 'summer'}

getVariantBundleId('french', 'drafts')
// => 'var-french~drafts'

// Generate a new variant id (with a uuid or a safe slug from input):
createVariantVersionId('french')
// => versions.var-french.<uuid>

createVariantVersionId('french', 'drafts', 'My Page')
// => versions.var-french~drafts.MyPage
```

The following are rejected at construction time:

- `~` outside the bundle segment of a `versions.var-*.*` id
- `var-<name>~published` — omit the secondary to target the published source
- `var-<name>~var-<other>` — no variants of variants
- Empty variant name or empty secondary bundle

# API Docs

Find the latest autogenerated API docs [here](https://github.com/sanity-io/id-utils/blob/main/docs/id-utils.md)
