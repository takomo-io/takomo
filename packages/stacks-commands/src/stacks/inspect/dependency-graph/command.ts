import { commandPath, CommandStatus } from "@takomo/core"
import { buildConfigContext } from "@takomo/stacks-context"
import { validateInput } from "@takomo/util"
import Joi from "joi"
import {
  DependencyGraphInput,
  DependencyGraphIO,
  DependencyGraphOutput,
} from "./model"

const schema = Joi.object({
  commandPath: commandPath.required(),
}).unknown(true)

export const dependencyGraphCommand = async (
  input: DependencyGraphInput,
  io: DependencyGraphIO,
): Promise<DependencyGraphOutput> =>
  validateInput(schema, input)
    .then((input) =>
      buildConfigContext({
        ...input,
        logger: io,
      }),
    )
    .then((ctx) => ({
      success: true,
      status: CommandStatus.SUCCESS,
      message: "Success",
      watch: input.watch.stop(),
      stacks: ctx.getStacks(),
    }))
    .then(io.printOutput)
