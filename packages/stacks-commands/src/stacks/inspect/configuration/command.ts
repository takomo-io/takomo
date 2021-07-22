import { CommandContext, CommandHandler } from "@takomo/core"
import {
  buildStacksContext,
  isWithinCommandPath,
  sortStacksForDeploy,
  StacksConfigRepository,
} from "@takomo/stacks-context"
import {
  InternalStack,
  InternalStacksContext,
  StackPath,
} from "@takomo/stacks-model"
import { createStacksSchemas } from "@takomo/stacks-schema"
import { arrayToMap, validateInput } from "@takomo/util"
import Joi, { AnySchema } from "joi"
import R from "ramda"
import { collectStackDependencies } from "../../deploy/plan"
import {
  ShowConfigurationInput,
  ShowConfigurationIO,
  ShowConfigurationOutput,
} from "./model"

const modifyStacks = async (
  input: ShowConfigurationInput,
  ctx: InternalStacksContext,
  io: ShowConfigurationIO,
): Promise<ReadonlyArray<InternalStack>> => {
  const stacks = ctx.stacks

  if (!input.interactive) {
    return stacks
  }

  const commandPath = await io.chooseCommandPath(ctx.rootStackGroup)
  if (commandPath === input.commandPath) {
    return stacks
  }

  const stacksByPath = arrayToMap(stacks, (s) => s.path)
  const modifiedStacks = stacks
    .filter((s) => isWithinCommandPath(s.path, commandPath))
    .reduce(
      (collected, stack) =>
        R.uniq([
          stack.path,
          ...collected,
          ...collectStackDependencies(stacksByPath, stack),
        ]),
      new Array<StackPath>(),
    )
    .map((stackPath) => stacksByPath.get(stackPath)!)

  return sortStacksForDeploy(modifiedStacks)
}

const inputSchema = (ctx: CommandContext): AnySchema => {
  const { commandPath } = createStacksSchemas({ regions: ctx.regions })
  return Joi.object({
    commandPath: commandPath.required(),
  }).unknown(true)
}

export const showConfigurationCommand: CommandHandler<
  StacksConfigRepository,
  ShowConfigurationIO,
  ShowConfigurationInput,
  ShowConfigurationOutput
> = ({
  ctx,
  io,
  input,
  configRepository,
  credentialManager,
}): Promise<ShowConfigurationOutput> =>
  validateInput(inputSchema(ctx), input)
    .then((input) =>
      buildStacksContext({
        ...input,
        configRepository,
        ctx,
        credentialManager,
        logger: io,
      }),
    )
    .then((ctx) => modifyStacks(input, ctx, io))
    .then((stacks) =>
      stacks.map((stack) => ({
        path: stack.path,
        name: stack.name,
        region: stack.region,
        data: stack.data,
      })),
    )
    .then((stacks) => {
      const { timer } = input

      timer.stop()

      const output: ShowConfigurationOutput = {
        success: true,
        status: "SUCCESS",
        message: "Success",
        outputFormat: input.outputFormat,
        timer,
        stacks,
      }

      return output
    })
    .then(io.printOutput)
