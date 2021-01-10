/**
 * @hidden
 */
export interface TakomoErrorProps {
  readonly info?: string
  readonly instructions?: string[]
}

// See https://www.typescriptlang.org/docs/handbook/release-notes/typescript-2-2.html#example
/**
 * @hidden
 */
export class TakomoError extends Error {
  readonly isTakomoError = true
  readonly info?: string
  readonly instructions?: string[]

  constructor(message: string, props?: TakomoErrorProps) {
    super(message)
    this.info = props?.info
    this.instructions = props?.instructions
    Object.setPrototypeOf(this, new.target.prototype)
  }
}

/**
 * @hidden
 */
export class ValidationError extends TakomoError {
  readonly messages: ReadonlyArray<string>
  constructor(
    message: string,
    messages: ReadonlyArray<string>,
    props?: TakomoErrorProps,
  ) {
    super(message, props)
    this.messages = messages
  }
}
