import { initDefaultCredentialManager } from "@takomo/aws-clients"
import { AccountId, OrganizationFeatureSet } from "@takomo/aws-model"
import {
  createOrganizationCommand,
  CreateOrganizationOutput,
} from "@takomo/organization-commands"
import { createConsoleLogger, createTimer } from "@takomo/util"
import { createTestCreateOrganizationIO } from "../../io"
import { ExecuteCommandProps } from "../common"
import { createCtxAndConfigRepository } from "./common"

interface ExpectCreateOrganizationOutputProps {
  readonly featureSet: OrganizationFeatureSet
  readonly masterAccountId: AccountId
}

export interface CreateOrganizationOutputMatcher {
  expectCommandToSucceed: () => CreateOrganizationOutputMatcher
  assert: (
    props: ExpectCreateOrganizationOutputProps,
  ) => Promise<CreateOrganizationOutput>
}

export const createCreateOrganizationOutputMatcher = (
  executor: () => Promise<CreateOrganizationOutput>,
  outputAssertions?: (output: CreateOrganizationOutput) => void,
): CreateOrganizationOutputMatcher => {
  const expectCommandToSucceed = () =>
    createCreateOrganizationOutputMatcher(executor, (output) => {
      expect(output.status).toEqual("SUCCESS")
      expect(output.message).toEqual("Success")
      expect(output.success).toEqual(true)
      expect(output.error).toBeUndefined()
    })

  const assert = async ({
    featureSet,
    masterAccountId,
  }: ExpectCreateOrganizationOutputProps): Promise<CreateOrganizationOutput> => {
    const output = await executor()
    if (outputAssertions) {
      outputAssertions(output)
    }

    expect(output.organization?.featureSet).toEqual(featureSet)
    expect(output.organization?.masterAccountId).toEqual(masterAccountId)

    return output
  }

  return {
    expectCommandToSucceed,
    assert,
  }
}

export interface ExecuteCreateOrganizationCommand extends ExecuteCommandProps {
  readonly featureSet: OrganizationFeatureSet
}

export const executeCreateOrganizationCommand = (
  props: ExecuteCreateOrganizationCommand,
): CreateOrganizationOutputMatcher =>
  createCreateOrganizationOutputMatcher(async () => {
    const logLevel = props.logLevel ?? "info"

    const ctxAndConfig = await createCtxAndConfigRepository({
      projectDir: props.projectDir,
      autoConfirmEnabled: props.autoConfirmEnabled ?? true,
      ignoreDependencies: props.ignoreDependencies ?? false,
      var: props.var ?? [],
      varFile: props.varFile ?? [],
      feature: props.feature ?? [],
      logLevel,
    })

    const logger = createConsoleLogger({
      logLevel,
    })

    const credentialManager = await initDefaultCredentialManager(
      () => Promise.resolve(""),
      logger,
      ctxAndConfig.ctx.awsClientProvider,
      ctxAndConfig.ctx.credentials,
    )

    return createOrganizationCommand({
      ...ctxAndConfig,
      credentialManager,
      io: createTestCreateOrganizationIO(logger),
      input: {
        timer: createTimer("total"),
        featureSet: props.featureSet,
        outputFormat: "text",
      },
    })
  })
