import { StackOperationStep } from "../../../common/steps.js"
import { TemplateSummaryHolder } from "../states.js"
import {
  createDir,
  createFile,
  dirExists,
  expandFilePath,
} from "../../../../../utils/files.js"
import { join, dirname } from "path"
import { toErrorWithMessage } from "../../../../../utils/errors.js"

export const emitStackTemplate: StackOperationStep<
  TemplateSummaryHolder
> = async (state) => {
  const {
    transitions,
    currentStack: stackAfterOperation,
    outDir,
    io,
    stack,
    ctx,
    templateBody,
  } = state

  if (!outDir) {
    return transitions.executeAfterDeployHooks({
      ...state,
      stackAfterOperation,
      message: "Emit stack template succeeded",
      status: "SUCCESS",
      events: [],
      success: true,
    })
  }

  const expandedOutDir = expandFilePath(ctx.projectDir, outDir)

  const templateFilePath = join(
    expandedOutDir,
    stack.path.slice(1).replaceAll("/", "-"),
  )

  io.info(`Emit stack template to file: ${templateFilePath}`)

  try {
    const outPutDirName = dirname(templateFilePath)
    if (!(await dirExists(outPutDirName))) {
      await createDir(outPutDirName)
    }

    await createFile(templateFilePath, templateBody)

    return transitions.executeAfterDeployHooks({
      ...state,
      stackAfterOperation,
      message: "Emit stack template succeeded",
      status: "SUCCESS",
      events: [],
      success: true,
    })
  } catch (error: unknown) {
    return transitions.executeAfterDeployHooks({
      ...state,
      stackAfterOperation,
      message: "Emit stack template failed",
      status: "FAILED",
      events: [],
      success: false,
      error: toErrorWithMessage(error),
    })
  }
}
