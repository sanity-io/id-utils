import {expect, test} from 'vitest'

import {
  DocumentId,
  DraftId,
  PublishedId,
  VariantVersionId,
  VersionId,
} from '../brands'

test('DocumentId()', () => {
  expect(DocumentId('foo')).toEqual('foo')
  expect(() => DocumentId('foo')).not.toThrow()
  expect(() => DocumentId('foo.bar')).not.toThrow()
  expect(() => DocumentId('foo.bar.baz')).not.toThrow()
  expect(() => DocumentId('foo.BaR.bAz')).not.toThrow()
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
    `[Error: Not a valid document ID: "@øæå" – Must match the /^[a-z-A-Z0-9._~-]+$/ RegExp]`,
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
    `[Error: Not a valid version ID: "versions..versions.some-bundle.some-doc" – VERSION must match the /^[a-z-A-Z0-9._~-]+$/ RegExp in versions.[VERSION].id]`,
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
    `[Error: Not a valid document ID: "versions.ın˝valıd.foo" – Must match the /^[a-z-A-Z0-9._~-]+$/ RegExp]`,
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

test('VersionId() – variant bundles', () => {
  expect(() => VersionId('versions.var-french.page-1')).not.toThrow()
  expect(() => VersionId('versions.var-french~drafts.page-1')).not.toThrow()
  expect(() => VersionId('versions.var-french~summer.page-1')).not.toThrow()

  // `~` is only valid inside a variant bundle segment
  expect(() =>
    VersionId('versions.summer~drafts.page-1'),
  ).toThrowErrorMatchingInlineSnapshot(
    `[Error: Not a valid version ID: "versions.summer~drafts.page-1" – "~" is only allowed in variant bundles (expected primary to start with "var-", got "summer")]`,
  )

  // secondary cannot be another variant bundle
  expect(() =>
    VersionId('versions.var-french~var-german.page-1'),
  ).toThrowErrorMatchingInlineSnapshot(
    `[Error: Not a valid variant version ID: "versions.var-french~var-german.page-1" – secondary bundle "var-german" cannot be a variant bundle]`,
  )

  // `var-{name}~published` is invalid
  expect(() =>
    VersionId('versions.var-french~published.page-1'),
  ).toThrowErrorMatchingInlineSnapshot(
    `[Error: Not a valid variant version ID: "versions.var-french~published.page-1" – use the plain variant bundle (no "~") to target the published source]`,
  )

  // empty secondary segment
  expect(() =>
    VersionId('versions.var-french~.page-1'),
  ).toThrowErrorMatchingInlineSnapshot(
    `[Error: Not a valid variant version ID: "versions.var-french~.page-1" – secondary bundle in "var-french~" must be non-empty]`,
  )

  // multiple `~` in the bundle segment
  expect(() =>
    VersionId('versions.var-french~drafts~summer.page-1'),
  ).toThrowErrorMatchingInlineSnapshot(
    `[Error: Not a valid version ID: "versions.var-french~drafts~summer.page-1" – composite bundle "var-french~drafts~summer" must contain exactly one "~" separator]`,
  )

  // `~` outside the bundle segment is not allowed
  expect(() =>
    VersionId('versions.summer.pa~ge-1'),
  ).toThrowErrorMatchingInlineSnapshot(
    `[Error: Not a valid version ID: "versions.summer.pa~ge-1" – "~" is only valid in the bundle segment]`,
  )

  // empty variant name (only caught by the stricter VariantVersionId validation)
  expect(() =>
    VariantVersionId('versions.var-.page-1'),
  ).toThrowErrorMatchingInlineSnapshot(
    `[Error: Not a valid variant version ID: "versions.var-.page-1" – variant name in "var-" must be non-empty]`,
  )
})

test('VariantVersionId()', () => {
  expect(() => VariantVersionId('versions.var-french.page-1')).not.toThrow()
  expect(() =>
    VariantVersionId('versions.var-french~drafts.page-1'),
  ).not.toThrow()
  expect(() =>
    VariantVersionId('versions.var-french~summer.page-1'),
  ).not.toThrow()

  expect(() =>
    VariantVersionId('versions.summer.page-1'),
  ).toThrowErrorMatchingInlineSnapshot(
    `[Error: Not a valid variant version ID: "versions.summer.page-1" – bundle "summer" must start with "var-"]`,
  )

  expect(() =>
    VariantVersionId('drafts.page-1'),
  ).toThrowErrorMatchingInlineSnapshot(
    `[Error: Not a valid version ID: "drafts.page-1" – must start with "versions."]`,
  )
})

test('PublishedId() – rejects "~"', () => {
  expect(() => PublishedId('foo~bar')).toThrowErrorMatchingInlineSnapshot(
    `[Error: Not a valid published ID: "foo~bar" – "~" is only valid inside a variant bundle segment of a version ID]`,
  )
})

test('DraftId() – rejects "~"', () => {
  expect(() => DraftId('drafts.foo~bar')).toThrowErrorMatchingInlineSnapshot(
    `[Error: Not a valid draft ID: "drafts.foo~bar" – "~" is only valid inside a variant bundle segment of a version ID]`,
  )
})
