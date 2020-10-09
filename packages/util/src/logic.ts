export class Success<T> {
  readonly success = true
  private constructor(readonly value: T) {}
  static of = <T>(result: T): Success<T> => new Success(result)
}

export class Failure<E> {
  readonly success = false
  private constructor(readonly error: E) {}
  static of = <E>(error: E): Failure<E> => new Failure(error)
}

export type Result<E, T> = Success<T> | Failure<E>
