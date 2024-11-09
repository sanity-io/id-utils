// internal helpers

import {partition as lodashPartition} from 'lodash'

export type SafeError = {success: false; error: Error}
export type SafeSuccess<T> = {success: true; value: T}

export type SafeResult<T> = SafeSuccess<T> | SafeError

// eslint-disable-next-line @typescript-eslint/no-shadow
export function error(error: Error): SafeError {
  return {success: false, error}
}
export function success<T>(value: T): SafeSuccess<T> {
  return {success: true, value}
}

export function safe<T>(fn: () => T): SafeResult<T> {
  try {
    return success(fn())
  } catch (err) {
    return error(err instanceof Error ? err : new Error(String(err)))
  }
}

/**
 * lodash types are wildly inaccurate
 * todo: replace with es-toolkit, which has better typings
 * @param array
 * @param predicate
 */

export function partition<T, S extends T>(
  array: T[],
  predicate: (element: T) => element is S,
): [trueValues: S[], falseValues: Exclude<T, S>[]] {
  return lodashPartition(array, predicate)
}
