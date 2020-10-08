import { Constants, Options, project } from "@takomo/core"
import {
  InitProjectInput,
  InitProjectIO,
  InitProjectOutput,
  ProjectInformation,
} from "@takomo/init-command"
import { indentLines } from "@takomo/util"
import Joi from "joi"
import CliIO from "./cli-io"

const regionChoices = Constants.REGIONS.map((r) => ({ name: r, value: r }))

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

export class CliInitProjectIO extends CliIO implements InitProjectIO {
  constructor(options: Options) {
    super(options)
  }

  private promptProject = async (
    givenValue: string | null,
  ): Promise<string | null> => {
    if (givenValue) {
      return givenValue
    }

    const value = await this.question("Enter project name:", false, {
      validate: validateProject,
    })

    return value.trim() === "" ? null : value
  }

  private promptRegions = async (
    givenValue: string[] | null,
  ): Promise<string[]> =>
    givenValue || (await this.chooseMany("Choose region(s):", regionChoices))

  private promptCreateSamples = async (
    givenValue: boolean | null,
  ): Promise<boolean> => {
    if (givenValue === true || givenValue === false) {
      return givenValue
    }

    return await this.confirm("Create sample stacks?:")
  }

  promptProjectInformation = async (
    input: InitProjectInput,
  ): Promise<ProjectInformation> => ({
    project: await this.promptProject(input.project),
    regions: await this.promptRegions(input.regions),
    createSamples: await this.promptCreateSamples(input.createSamples),
  })

  printOutput = (output: InitProjectOutput): InitProjectOutput => {
    if (output.success) {
      this.header("Project initialized!", true, true)
      this.message(
        `The following file structure was created to dir: ${output.projectDir}`,
      )
      this.message(indentLines(output.description, 2), true)
    }

    return output
  }
}
