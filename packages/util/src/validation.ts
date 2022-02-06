import { AnySchema } from "joi"
import { TakomoError } from "./errors"

/**
 * @hidden
 */
export const validate = (
  schema: AnySchema,
  value: any,
  errorMessage: string,
): void => {
  const { error } = schema.validate(value, {
    abortEarly: false,
    convert: false,
    errors: { label: false },
  })
  if (error) {
    const details = error.details.map((d) => `  - ${d.message}`).join("\n")
    throw new TakomoError(`${errorMessage}:\n\n${details}`)
  }
}

/**
 * @hidden
 */
export const validateInput = async <T>(
  schema: AnySchema,
  input: T,
): Promise<T> => {
  const { error } = schema.validate(input, { convert: false })
  if (error) {
    const details = error.details.map((d: any) => `  - ${d.message}`).join("\n")
    throw new TakomoError(
      `${error.details.length} validation error(s) in arguments:\n\n${details}`,
    )
  }

  return input
}
