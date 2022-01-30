import { TakomoError } from "@takomo/util"

/**
 * @hidden
 */
export class CredentialsError extends TakomoError {
  constructor(e: Error) {
    super("AWS credentials error.\n\n" + e)
  }
}
