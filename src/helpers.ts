// internal helpers

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

export function partition<T, S extends T>(
  array: T[],
  predicate: (element: T) => element is S,
): [trueValues: S[], falseValues: Exclude<T, S>[]] {
  const trueValues: S[] = []
  const falseValues: Exclude<T, S>[] = []

  for (const element of array) {
    if (predicate(element)) {
      trueValues.push(element)
    } else {
      // TypeScript cannot infer the negative case of a generic type predicate.
      falseValues.push(element as Exclude<T, S>)
    }
  }

  return [trueValues, falseValues]
}
