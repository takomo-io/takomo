interface TakomoErrorOptions {
  readonly info?: string
  readonly instructions?: string[]
}

// See https://www.typescriptlang.org/docs/handbook/release-notes/typescript-2-2.html#example
export class TakomoError extends Error {
  readonly isTakomoError = true
  readonly info?: string
  readonly instructions?: string[]

  constructor(message: string, options?: TakomoErrorOptions) {
    super(message)
    this.info = options?.info
    this.instructions = options?.instructions
    Object.setPrototypeOf(this, new.target.prototype)
  }
}
