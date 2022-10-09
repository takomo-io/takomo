import { Features } from "../../takomo-core"
import { TakomoError } from "../../takomo-util"

export const parseFeaturesFromArgs = (args: any): Partial<Features> => {
  const varsArray = args ? (Array.isArray(args) ? args : [args]) : []

  const featureNames: ReadonlyArray<keyof Features> = [
    "deploymentTargetsUndeploy",
    "deploymentTargetsTearDown",
  ]

  return varsArray.reduce((collected, arg) => {
    const [name, value] = arg.split("=", 2)
    if (!featureNames.includes(name)) {
      throw new TakomoError(`Unknown feature name: '${name}'`, {
        instructions: [`Supported feature names are: ${featureNames}`],
      })
    }

    if (!value || value === "") {
      throw new TakomoError(`Value not given for feature '${name}'`)
    }

    if ("true" !== value && "false" !== value) {
      throw new TakomoError(`Invalid value '${value}' for feature '${name}'`, {
        instructions: [`Supported values are: true, false`],
      })
    }

    return {
      ...collected,
      [name]: value === "true",
    }
  }, {})
}
