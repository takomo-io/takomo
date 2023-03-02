import * as R from "ramda"
import {
  DetailedChangeSet,
  DetailedCloudFormationStack,
  DetailedStackParameter,
  StackParameterKey,
  StackParameterNoEcho,
  StackParameterValue,
} from "../../../aws/cloudformation/model.js"
import { bold, green, red, yellow } from "../../../utils/colors.js"
import { BaseIO } from "../../cli-io.js"
import { printValue } from "./common.js"

export type ParameterOperation = "update" | "create" | "delete"

export interface ParameterSpec {
  readonly key: StackParameterKey
  readonly operation: ParameterOperation
  readonly currentValue?: StackParameterValue
  readonly newValue?: StackParameterValue
  readonly newNoEcho: StackParameterNoEcho
  readonly currentNoEcho: StackParameterNoEcho
}

export interface ParametersSpec {
  readonly updated: ReadonlyArray<ParameterSpec>
  readonly added: ReadonlyArray<ParameterSpec>
  readonly removed: ReadonlyArray<ParameterSpec>
}

export const collectRemovedParameters = (
  newParameters: ReadonlyArray<DetailedStackParameter>,
  existingParameters: ReadonlyArray<DetailedStackParameter>,
): ReadonlyArray<ParameterSpec> => {
  const newParameterNames = newParameters.map((p) => p.key)
  return existingParameters
    .filter((p) => !newParameterNames.includes(p.key))
    .map(
      ({ key, value, noEcho }) =>
        ({
          key,
          currentValue: value,
          newValue: undefined,
          operation: "delete",
          currentNoEcho: noEcho,
          newNoEcho: false,
        } as ParameterSpec),
    )
    .sort((a, b) => a.key.localeCompare(b.key))
}

export const collectAddedParameters = (
  newParameters: ReadonlyArray<DetailedStackParameter>,
  existingParameters: ReadonlyArray<DetailedStackParameter>,
): ReadonlyArray<ParameterSpec> => {
  const existingParameterNames = existingParameters.map((p) => p.key)
  return newParameters
    .filter((p) => !existingParameterNames.includes(p.key))
    .map(
      ({ key, value, noEcho }) =>
        ({
          key,
          currentValue: undefined,
          newValue: value,
          operation: "create",
          newNoEcho: noEcho,
          currentNoEcho: false,
        } as ParameterSpec),
    )
    .sort((a, b) => a.key.localeCompare(b.key))
}

export const collectUpdatedParameters = (
  newParameters: ReadonlyArray<DetailedStackParameter>,
  existingParameters: ReadonlyArray<DetailedStackParameter>,
): ReadonlyArray<ParameterSpec> => {
  const existingParameterNames = existingParameters.map((p) => p.key)
  return newParameters
    .filter((p) => existingParameterNames.includes(p.key))
    .map((newParam) => {
      const existingParam = existingParameters.find(
        (existingParam) => existingParam.key === newParam.key,
      )

      return [newParam, existingParam!]
    })
    .filter(
      ([newParam, existingParam]) =>
        newParam.noEcho ||
        existingParam.noEcho ||
        newParam.value !== existingParam.value,
    )
    .map(
      ([newParam, existingParam]) =>
        ({
          key: newParam.key,
          currentValue: existingParam?.value,
          newValue: newParam.value,
          operation: "update",
          newNoEcho: newParam.noEcho,
          currentNoEcho: existingParam?.noEcho || false,
        } as ParameterSpec),
    )
    .sort((a, b) => a.key.localeCompare(b.key))
}

export const formatParameterOperation = (
  param: ParameterSpec,
  columnLength: number,
): string => {
  switch (param.operation) {
    case "create":
      const addKey = `+ ${param.key}:`.padEnd(columnLength + 4)
      return green(`${addKey}(parameter will be created)`)
    case "delete":
      const deleteKey = `- ${param.key}:`.padEnd(columnLength + 4)
      return red(`${deleteKey}(parameter will be removed)`)
    case "update":
      if (param.newNoEcho || param.currentNoEcho) {
        const updateKey = `~ ${param.key}:`.padEnd(columnLength + 4)
        return yellow(`${updateKey}(parameter might be updated, NoEcho = true)`)
      } else {
        const updateKey = `~ ${param.key}:`.padEnd(columnLength + 4)
        return yellow(`${updateKey}(parameter will be updated)`)
      }
    default:
      throw new Error(`Unsupported parameter operation: '${param.operation}'`)
  }
}

export const buildParametersSpec = (
  changeSet: DetailedChangeSet,
  existingStack?: DetailedCloudFormationStack,
): ParametersSpec => {
  const newParameters = changeSet.parameters
  const existingParameters = existingStack?.parameters ?? []

  const updated = collectUpdatedParameters(newParameters, existingParameters)
  const added = collectAddedParameters(newParameters, existingParameters)
  const removed = collectRemovedParameters(newParameters, existingParameters)

  return {
    updated,
    added,
    removed,
  }
}

export const printParameters = (
  io: BaseIO,
  changeSet?: DetailedChangeSet,
  existingStack?: DetailedCloudFormationStack,
): boolean => {
  if (!changeSet) {
    return false
  }

  const { updated, added, removed } = buildParametersSpec(
    changeSet,
    existingStack,
  )

  const all = [...added, ...updated, ...removed]
  if (all.length === 0) {
    return false
  }

  const maxParamNameLength = R.apply(
    Math.max,
    all.map((t) => t.key.length),
  )

  const paramNameColumnLength = Math.max(27, maxParamNameLength)

  io.message({ text: bold("Parameters:"), marginTop: true })

  all.forEach((param) => {
    io.message({
      text: `  ${formatParameterOperation(param, paramNameColumnLength)}`,
      marginTop: true,
    })
    io.message({
      text: `      current value:             ${printValue(
        param.currentValue,
      )}`,
    })
    io.message({
      text: `      new value:                 ${printValue(param.newValue)}`,
    })
  })

  if (all.length < 2) {
    return true
  }

  const counts = Object.entries(R.countBy((o) => o.operation, all))
    .map(([key, count]) => {
      switch (key) {
        case "create":
          return { order: "1", text: green(`create: ${count}`) }
        case "update":
          return { order: "2", text: yellow(`update: ${count}`) }
        case "delete":
          return { order: "3", text: red(`remove: ${count}`) }
        default:
          throw new Error(`Unsupported parameter operation: '${key}'`)
      }
    })
    .sort((a, b) => a.order.localeCompare(b.order))
    .map((o) => o.text)
    .join(", ")

  io.message({
    text: `  changed parameters | total: ${all.length}, ${counts}`,
    marginTop: true,
  })

  return true
}
