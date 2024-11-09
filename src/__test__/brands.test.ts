import {expect, test} from 'vitest'

import {DocumentId, DraftId, PublishedId, VersionId} from '../brands'

test('DocumentId()', () => {
  expect(DocumentId('foo')).toEqual('foo')
  expect(() => DocumentId('foo')).not.toThrow()
  expect(() => DocumentId('foo.bar')).not.toThrow()
  expect(() => DocumentId('foo.bar.baz')).not.toThrow()
  expect(() => DocumentId('_.some.sys-doc')).not.toThrow()
  expect(() => DocumentId('versions.some-bundle.doc-123')).not.toThrow()

  expect(() => DocumentId('versions.foo')).toThrowErrorMatchingInlineSnapshot(`
    [AggregateError: Invalid Document ID
     - Not a valid published ID: "versions.foo" – cannot start with "drafts." or "versions."
     - Not a valid draft ID: "versions.foo" – must start with "drafts."
     - Not a valid version ID: "versions.foo" – missing document ID in versions.bundle.[ID]]
  `)
  expect(() => DocumentId('drafts.')).toThrowErrorMatchingInlineSnapshot(`
    [AggregateError: Invalid Document ID
     - Not a valid published ID: "drafts." – cannot start with "drafts." or "versions."
     - Not a valid draft ID: "drafts." – must have at least one character followed by "drafts."
     - Not a valid version ID: "drafts." – must start with "versions."]
  `)
  expect(() => DocumentId('versions.')).toThrowErrorMatchingInlineSnapshot(`
    [AggregateError: Invalid Document ID
     - Not a valid published ID: "versions." – cannot start with "drafts." or "versions."
     - Not a valid draft ID: "versions." – must start with "drafts."
     - Not a valid version ID: "versions." – must have at least one character followed by "versions."]
  `)
})

test('DraftId()', () => {
  expect(() => DraftId('drafts.foo')).not.toThrow()
  expect(() => DraftId('drafts.foo.bar')).not.toThrow()
  expect(() => DraftId('drafts.foo.bar.baz')).not.toThrow()
  expect(() => DraftId('drafts.drafts.bar.baz')).not.toThrow()
  expect(() => DraftId('foo')).toThrowErrorMatchingInlineSnapshot(
    `[Error: Not a valid draft ID: "foo" – must start with "drafts."]`,
  )
  expect(() => DraftId('bar.baz')).toThrowErrorMatchingInlineSnapshot(
    `[Error: Not a valid draft ID: "bar.baz" – must start with "drafts."]`,
  )
  expect(() => DraftId('versions.baz')).toThrowErrorMatchingInlineSnapshot(
    `[Error: Not a valid draft ID: "versions.baz" – must start with "drafts."]`,
  )
})

test('PublishedId()', () => {
  expect(() => PublishedId('foo')).not.toThrow()
  expect(() => PublishedId('foo.bar')).not.toThrow()
  expect(() => PublishedId('foo.bar.baz')).not.toThrow()
  // note: likely to not be supported by backend
  expect(() => PublishedId('bar.baz.drafts')).not.toThrow()
  expect(() => PublishedId('drafts.foo')).toThrowErrorMatchingInlineSnapshot(
    `[Error: Not a valid published ID: "drafts.foo" – cannot start with "drafts." or "versions."]`,
  )
  expect(() => PublishedId('')).toThrowErrorMatchingInlineSnapshot(
    `[Error: Must be a non-empty string]`,
  )
  expect(() => PublishedId('@øæå')).toThrowErrorMatchingInlineSnapshot(
    `[Error: Not a valid document ID: "@øæå" – Must match the /^[a-z0-9._-]+$/ RegExp]`,
  )
  expect(() => PublishedId('versions.baz')).toThrowErrorMatchingInlineSnapshot(
    `[Error: Not a valid published ID: "versions.baz" – cannot start with "drafts." or "versions."]`,
  )
})

test('VersionId()', () => {
  expect(() => VersionId('versions.some-bundle.some-doc')).not.toThrow()
  expect(() => VersionId('versions.some-bundle.foo.bar')).not.toThrow()
  expect(() => VersionId('versions.some-bundle.some-doc')).not.toThrow()
  // note: likely to not be supported by backend
  expect(() =>
    VersionId('versions.foo.versions.some-bundle.some-doc'),
  ).not.toThrow()
  expect(() =>
    VersionId('versions..versions.some-bundle.some-doc'),
  ).toThrowErrorMatchingInlineSnapshot(
    `[Error: Not a valid version ID: "versions..versions.some-bundle.some-doc" – VERSION must match the /^[a-z0-9._-]+$/ RegExp in versions.[VERSION].id]`,
  )

  expect(() => VersionId('drafts.foo')).toThrowErrorMatchingInlineSnapshot(
    `[Error: Not a valid version ID: "drafts.foo" – must start with "versions."]`,
  )
  expect(() => VersionId('versions.baz')).toThrowErrorMatchingInlineSnapshot(
    `[Error: Not a valid version ID: "versions.baz" – missing document ID in versions.bundle.[ID]]`,
  )

  expect(() =>
    VersionId('versions.ın˝valıd.foo'),
  ).toThrowErrorMatchingInlineSnapshot(
    `[Error: Not a valid document ID: "versions.ın˝valıd.foo" – Must match the /^[a-z0-9._-]+$/ RegExp]`,
  )
  expect(() =>
    VersionId('versions.drafts.foo'),
  ).toThrowErrorMatchingInlineSnapshot(
    `[Error: Not a valid version ID: "versions.drafts.foo" – invalid VERSION "drafts" in versions.[VERSION].id]`,
  )
  expect(() =>
    VersionId('versions.versions.foo'),
  ).toThrowErrorMatchingInlineSnapshot(
    `[Error: Not a valid version ID: "versions.versions.foo" – invalid VERSION "versions" in versions.[VERSION].id]`,
  )
})
