import Joi, { AnySchema } from "joi"
import * as R from "ramda"
import { CommandContext } from "../../../../context/command-context.js"
import { InternalStacksContext } from "../../../../context/stacks-context.js"
import { createStacksSchemas } from "../../../../schema/stacks-schema.js"
import { InternalStandardStack } from "../../../../stacks/standard-stack.js"
import { CommandHandler } from "../../../../takomo-core/command.js"
import { StacksConfigRepository } from "../../../../takomo-stacks-context/model.js"
import {
  getStackPath,
  isNotObsolete,
  isWithinCommandPath,
} from "../../../../takomo-stacks-model/util.js"
import { arrayToMap } from "../../../../utils/collections.js"
import { validateInput } from "../../../../utils/validation.js"
import { collectStackDependencies } from "../../deploy/plan.js"
import {
  ShowConfigurationInput,
  ShowConfigurationIO,
  ShowConfigurationOutput,
} from "./model.js"
import { buildStacksContext } from "../../../../takomo-stacks-context/config/build-stacks-context.js"
import { sortStacksForDeploy } from "../../../../takomo-stacks-context/dependencies.js"
import { StackPath } from "../../../../stacks/stack.js"

const modifyStacks = async (
  input: ShowConfigurationInput,
  ctx: InternalStacksContext,
  io: ShowConfigurationIO,
): Promise<ReadonlyArray<InternalStandardStack>> => {
  const stacks = ctx.stacks

  if (!input.interactive) {
    return stacks
  }

  const commandPath = await io.chooseCommandPath(ctx.rootStackGroup)
  if (commandPath === input.commandPath) {
    return stacks
  }

  const stacksByPath = arrayToMap(stacks, getStackPath)
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
    .filter(isNotObsolete)

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

      const output: ShowConfigurationOutput = {
        success: true,
        status: "SUCCESS",
        message: "Success",
        outputFormat: input.outputFormat,
        timer: timer.stop(),
        stacks,
      }

      return output
    })
    .then(io.printOutput)
