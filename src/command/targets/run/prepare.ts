import path from "path"
import { DeploymentTargetsContext } from "../../../context/targets-context.js"
import { compileTypescript } from "../../../utils/esbuild.js"
import { expandFilePath } from "../../../utils/files.js"
import { checksum } from "../../../utils/strings.js"
import { DeploymentTargetsListener } from "../operation/model.js"
import {
  DeploymentTargetsRunInput,
  DeploymentTargetsRunIO,
  DeploymentTargetsRunOutput,
  TargetsRunPlan,
} from "./model.js"
import { run } from "./run.js"

const handleTypescriptMap = async (
  ctx: DeploymentTargetsContext,
  input: DeploymentTargetsRunInput,
): Promise<DeploymentTargetsRunInput> => {
  if (!input.mapCommand.startsWith("ts:")) {
    return input
  }

  const mapCommandPathWithoutPrefix = input.mapCommand.slice(3)
  const mapCommandFullPath = expandFilePath(
    ctx.projectDir,
    mapCommandPathWithoutPrefix,
  )

  const outfile = expandFilePath(
    ctx.projectDir,
    path.join(".takomo", "out", `${checksum(mapCommandFullPath)}.mjs`),
  )

  ctx.logger.debug(
    `Compile map typescript file ${input.mapCommand} to ${outfile}`,
  )

  await compileTypescript({
    entryPoints: [mapCommandFullPath],
    outfile,
  })

  return {
    ...input,
    mapCommand: `js:${outfile}`,
  }
}

const handleTypescriptReduce = async (
  ctx: DeploymentTargetsContext,
  input: DeploymentTargetsRunInput,
): Promise<DeploymentTargetsRunInput> => {
  if (!input.reduceCommand || !input.reduceCommand.startsWith("ts:")) {
    return input
  }

  const reduceCommandPathWithoutPrefix = input.reduceCommand.slice(3)
  const reduceCommandFullPath = expandFilePath(
    ctx.projectDir,
    reduceCommandPathWithoutPrefix,
  )

  const outfile = expandFilePath(
    ctx.projectDir,
    path.join(".takomo", "out", `${checksum(reduceCommandFullPath)}.mjs`),
  )

  ctx.logger.debug(
    `Compile reduce typescript file ${input.reduceCommand} to ${outfile}`,
  )

  await compileTypescript({
    entryPoints: [reduceCommandFullPath],
    outfile,
  })

  return {
    ...input,
    reduceCommand: `js:${outfile}`,
  }
}

const handleTypescriptMapAndReduce = async (
  ctx: DeploymentTargetsContext,
  input: DeploymentTargetsRunInput,
): Promise<DeploymentTargetsRunInput> => {
  const modifiedInput = await handleTypescriptMap(ctx, input)
  return handleTypescriptReduce(ctx, modifiedInput)
}

interface PrepareProps {
  readonly ctx: DeploymentTargetsContext
  readonly input: DeploymentTargetsRunInput
  readonly io: DeploymentTargetsRunIO
  readonly plan: TargetsRunPlan
  readonly listener: DeploymentTargetsListener
}

export const prepare = async (
  props: PrepareProps,
): Promise<DeploymentTargetsRunOutput> => {
  const { input, ctx } = props

  const modifiedInput = await handleTypescriptMapAndReduce(ctx, input)

  return run({
    ...props,
    input: modifiedInput,
  })
}
