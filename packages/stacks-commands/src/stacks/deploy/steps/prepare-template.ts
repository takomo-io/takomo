import { InternalStack, StackOperationVariables } from "@takomo/stacks-model"
import { arrayToObject } from "@takomo/util"
import path from "path"
import { StackOperationStep } from "../../common/steps"
import { StackParameterInfo } from "../model"
import { TagsHolder } from "../states"

/**
 * @hidden
 */
export const createVariablesForStackTemplate = (
  variables: StackOperationVariables,
  stack: InternalStack,
  parameters: ReadonlyArray<StackParameterInfo>,
): any => {
  const stackPath = stack.path
  const pathSegments = stackPath.substr(1).split("/")
  const filePath = pathSegments.slice(0, -1).join("/")
  return {
    ...variables,
    stack: {
      pathSegments,
      project: stack.project,
      path: stackPath,
      name: stack.name,
      template: stack.template.filename,
      templateBucket: stack.templateBucket,
      commandRole: stack.commandRole,
      region: stack.region,
      tags: Array.from(stack.tags.entries()).map(([key, value]) => ({
        key,
        value,
      })),
      parameters: parameters.map((p) => ({ key: p.key, value: p.value })),
      parametersMap: arrayToObject(
        parameters,
        (p) => p.key,
        (p) => p.value,
      ),
      timeout: stack.timeout,
      depends: stack.dependencies,
      terminationProtection: stack.terminationProtection,
      data: stack.data,
      configFile: {
        filePath,
        basename: path.basename(filePath),
        name: path.basename(filePath, ".yml"),
        dirPath:
          pathSegments.length === 2 ? "" : pathSegments.slice(0, -2).join("/"),
      },
    },
  }
}

export const prepareTemplate: StackOperationStep<TagsHolder> = async (
  state,
) => {
  const { stack, variables, transitions, configRepository, parameters } = state

  const stackVariables = createVariablesForStackTemplate(
    variables,
    stack,
    parameters,
  )

  const templateBody = await configRepository.getStackTemplateContents({
    ...stack.template,
    variables: stackVariables,
  })

  return transitions.uploadTemplate({
    ...state,
    templateBody,
  })
}
