import { TakomoError } from "../../utils/errors.js"

export class CredentialsError extends TakomoError {
  constructor(e: Error) {
    super("AWS credentials error.\n\n" + e)
  }
}
