import {expect, test} from 'vitest'

import {createDraftId, createPublishedId, createVersionId} from '../create'

test('create from input string', () => {
  expect(createPublishedId('foo')).toEqual('foo')
  expect(createDraftId('foo')).toEqual('drafts.foo')
  expect(createVersionId('xyz', 'foo')).toEqual('versions.xyz.foo')
})

test('create from input string with special characters', () => {
  expect(createPublishedId('%Ωweı∂&')).toMatchInlineSnapshot(`"wei"`)
  expect(createPublishedId('____fooo____')).toMatchInlineSnapshot(`"fooo"`)
  expect(createDraftId('%Ωweı∂&')).toEqual('drafts.wei')
  expect(createPublishedId('.notvalid')).toEqual('notvalid')
  expect(createVersionId('xyz', '%Ωweı∂&')).toEqual('versions.xyz.wei')
})

test('create without input creates a uuid', () => {
  expect(createPublishedId()).toMatch(/\w{8}-\w{4}-\w{4}-\w{4}-\w{12}/)
  expect(createDraftId()).toMatch(/drafts.\w{8}-\w{4}-\w{4}-\w{4}-\w{12}/)
  expect(createVersionId('xyz')).toMatch(
    /versions.xyz.\w{8}-\w{4}-\w{4}-\w{4}-\w{12}/,
  )
})
