import { TakomoError } from "../../utils/errors.js"
import { merge } from "../../utils/objects.js"

export const parseVarArgs = (varArgs: any): any => {
  const varsArray = varArgs
    ? Array.isArray(varArgs)
      ? varArgs
      : [varArgs]
    : []

  let vars = {}

  for (const varArg of varsArray) {
    if (/^([a-zA-Z][a-zA-Z0-9_]+)=/.test(varArg)) {
      const [varName, varValue] = varArg.split("=", 2)
      vars = merge(vars, { [varName]: varValue })
    } else {
      throw new TakomoError(`Invalid variable ${varArg}`)
    }
  }

  return vars
}
