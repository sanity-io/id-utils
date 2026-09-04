import {expect, expectTypeOf, test} from 'vitest'

import {partition} from '../helpers'

type Result = {success: true; value: string} | {success: false; error: Error}

test('partitions values in their original order', () => {
  const firstError = new Error('first')
  const secondError = new Error('second')
  const results: Result[] = [
    {success: false, error: firstError},
    {success: true, value: 'one'},
    {success: true, value: 'two'},
    {success: false, error: secondError},
  ]

  const [successes, errors] = partition(
    results,
    (result): result is Extract<Result, {success: true}> => result.success,
  )

  expect(successes).toEqual([
    {success: true, value: 'one'},
    {success: true, value: 'two'},
  ])
  expect(errors).toEqual([
    {success: false, error: firstError},
    {success: false, error: secondError},
  ])
  expectTypeOf(successes).toEqualTypeOf<Extract<Result, {success: true}>[]>()
  expectTypeOf(errors).toEqualTypeOf<Extract<Result, {success: false}>[]>()
})
