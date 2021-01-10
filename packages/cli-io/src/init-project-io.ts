import { Region } from "@takomo/aws-model"
import { CommandContext, createCommonSchema, Project } from "@takomo/core"
import {
  InitProjectInput,
  InitProjectIO,
  InitProjectOutput,
  ProjectInformation,
} from "@takomo/init-command"
import { LogWriter, TkmLogger } from "@takomo/util"
import Joi from "joi"
import { createBaseIO } from "./cli-io"

const makeRegionChoices = (regions: ReadonlyArray<Region>) =>
  regions.map((r) => ({ name: r, value: r }))

const { project } = createCommonSchema()

const projectSchema = Joi.object({
  project,
})

const validateProject = (input: string): string | boolean => {
  if (input.trim() === "") {
    return true
  }

  const { error } = projectSchema.validate({ project: input })
  if (error) {
    return error.message
  }

  return true
}

export const createInitProjectIO = (
  logger: TkmLogger,
  writer: LogWriter = console.log,
): InitProjectIO => {
  const io = createBaseIO(writer)

  const promptProject = async (
    givenValue?: Project,
  ): Promise<Project | undefined> => {
    if (givenValue) {
      return givenValue
    }

    const value = await io.question("Enter project name:", false, {
      validate: validateProject,
    })

    return value.trim() === "" ? undefined : value
  }

  const promptRegions = async (
    ctx: CommandContext,
    givenValue?: ReadonlyArray<Region>,
  ): Promise<ReadonlyArray<Region>> =>
    givenValue ||
    io.chooseMany("Choose region(s):", makeRegionChoices(ctx.regions), true)

  const promptCreateSamples = async (
    givenValue?: boolean,
  ): Promise<boolean> => {
    if (givenValue === true || givenValue === false) {
      return givenValue
    }

    return io.confirm("Create sample stacks?:", true)
  }

  const promptProjectInformation = async (
    ctx: CommandContext,
    input: InitProjectInput,
  ): Promise<ProjectInformation> => ({
    project: await promptProject(input.project),
    regions: await promptRegions(ctx, input.regions),
    createSamples: await promptCreateSamples(input.createSamples),
  })

  const printOutput = (output: InitProjectOutput): InitProjectOutput => {
    if (output.success) {
      io.header({
        text: "Project initialized!",
        marginTop: true,
        marginBottom: true,
      })
      io.message({
        text: output.description,
        marginTop: true,
      })
    }

    return output
  }

  return {
    ...logger,
    ...io,
    printOutput,
    promptProjectInformation,
  }
}
