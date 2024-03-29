import { IamRoleName, Region } from "../../aws/common/model.js"
import { CommandInput, CommandOutput, IO } from "../../takomo-core/command.js"

export interface GenerateIamPoliciesInput extends CommandInput {
  readonly startTime: Date
  readonly endTime: Date
  readonly identities: ReadonlyArray<string>
  readonly regions: ReadonlyArray<Region>
  readonly roleName?: IamRoleName
}

export interface GeneratedPolicy {
  readonly identity: string
  readonly actions: ReadonlyArray<string>
}

export interface GenerateIamPoliciesOutput extends CommandOutput {
  readonly policies: ReadonlyArray<GeneratedPolicy>
}

export type GenerateIamPoliciesIO = IO<GenerateIamPoliciesOutput>
