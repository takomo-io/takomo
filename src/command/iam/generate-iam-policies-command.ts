import Joi, { AnySchema } from "joi"
import R from "ramda"

import { AwsClientProvider } from "../../aws/aws-client-provider.js"
import { CloudTrailEvent } from "../../aws/cloudtrail/model.js"
import { CredentialManager } from "../../aws/common/credentials.js"
import { AccountId, IamRoleName, Region } from "../../aws/common/model.js"
import { CommandContext } from "../../context/command-context.js"
import { createAwsSchemas } from "../../schema/aws-schema.js"
import { CommandHandler } from "../../takomo-core/command.js"
import { TkmLogger } from "../../utils/logging.js"
import { validateInput } from "../../utils/validation.js"
import {
  GenerateIamPoliciesInput,
  GenerateIamPoliciesIO,
  GenerateIamPoliciesOutput,
} from "./model.js"

const getEventsFromRegion = async (
  awsClientProvider: AwsClientProvider,
  credentialManager: CredentialManager,
  logger: TkmLogger,
  region: Region,
  startTime: Date,
  endTime: Date,
): Promise<ReadonlyArray<CloudTrailEvent>> => {
  const credentials = await credentialManager.getCredentials()
  const ct = await awsClientProvider.createCloudTrailClient({
    logger,
    region,
    id: "cloudtrail",
    credentialProvider: async () => credentials,
  })

  return ct.lookupEvents(startTime, endTime)
}

const getEventsFromRegions = async (
  awsClientProvider: AwsClientProvider,
  credentialManager: CredentialManager,
  logger: TkmLogger,
  accountId: AccountId,
  regions: ReadonlyArray<Region>,
  startTime: Date,
  endTime: Date,
  events: ReadonlyArray<CloudTrailEvent>,
): Promise<ReadonlyArray<CloudTrailEvent>> => {
  if (regions.length === 0) {
    return events
  }

  const [region, ...remainingRegions] = regions

  logger.info(`Get events for account: ${accountId}, region: ${region}`)
  const regionEvents = await getEventsFromRegion(
    awsClientProvider,
    credentialManager,
    logger,
    region,
    startTime,
    endTime,
  )

  logger.info(
    `Got ${regionEvents.length} events for account: ${accountId}, region: ${region}`,
  )

  return getEventsFromRegions(
    awsClientProvider,
    credentialManager,
    logger,
    accountId,
    remainingRegions,
    startTime,
    endTime,
    [...events, ...regionEvents],
  )
}

const getCredentialManagerForAccount = async (
  credentialManager: CredentialManager,
  accountId: AccountId,
  roleName?: IamRoleName,
): Promise<CredentialManager> => {
  if (!roleName) {
    return credentialManager
  }

  const readerRoleArn = `arn:aws:iam::${accountId}:role/${roleName}`
  return credentialManager.createCredentialManagerForRole(readerRoleArn)
}

const getEventsFromAccounts = async (
  awsClientProvider: AwsClientProvider,
  credentialManager: CredentialManager,
  logger: TkmLogger,
  accountIds: ReadonlyArray<AccountId>,
  regions: ReadonlyArray<Region>,
  roleName: IamRoleName | undefined = undefined,
  startTime: Date,
  endTime: Date,
  events: ReadonlyArray<CloudTrailEvent>,
): Promise<ReadonlyArray<CloudTrailEvent>> => {
  if (accountIds.length === 0) {
    return events
  }

  const [accountId, ...remainingAccountIds] = accountIds
  const accountCredentialManager = await getCredentialManagerForAccount(
    credentialManager,
    accountId,
    roleName,
  )

  logger.info(`Get events for account: ${accountId}`)
  const accountEvents = await getEventsFromRegions(
    awsClientProvider,
    accountCredentialManager,
    logger,
    accountId,
    regions,
    startTime,
    endTime,
    [],
  )

  logger.info(`Got ${accountEvents.length} events for account: ${accountId}`)

  return getEventsFromAccounts(
    awsClientProvider,
    credentialManager,
    logger,
    remainingAccountIds,
    regions,
    roleName,
    startTime,
    endTime,
    [...events, ...accountEvents],
  )
}

const generateIamPolicies = async (
  awsClientProvider: AwsClientProvider,
  io: GenerateIamPoliciesIO,
  input: GenerateIamPoliciesInput,
  credentialManager: CredentialManager,
): Promise<GenerateIamPoliciesOutput> => {
  const { timer, startTime, endTime, identities, roleName, regions } = input

  const accountIds = R.uniq(
    identities.map((identity) => identity.split(":")[4]),
  )

  const events = await getEventsFromAccounts(
    awsClientProvider,
    credentialManager,
    io,
    accountIds,
    regions,
    roleName,
    startTime,
    endTime,
    [],
  )

  const eventsByIdentity = R.groupBy(
    (e) => e.cloudTrailEvent.userIdentity?.arn,
    events,
  )

  const policies = Object.entries(eventsByIdentity)
    .map(([identity, eventList]) => ({
      identity,
      actions: R.uniq(
        eventList.map((e) => e.eventSource.split(".")[0] + ":" + e.eventName),
      ).sort(),
    }))
    .filter(({ identity }) => identities.includes(identity))

  return {
    policies,
    message: "Success",
    status: "SUCCESS",
    success: true,
    outputFormat: input.outputFormat,
    timer: timer.stop(),
  }
}

const inputSchema = (ctx: CommandContext): AnySchema => {
  const { iamRoleName, region } = createAwsSchemas({ regions: ctx.regions })

  return Joi.object({
    roleName: iamRoleName,
    identities: Joi.array().items(Joi.string()).required(),
    regions: Joi.array().items(region).unique().required(),
    endTime: Joi.date().required(),
    startTime: Joi.date().required(),
  }).unknown(true)
}

export const generateIamPoliciesCommand: CommandHandler<
  unknown,
  GenerateIamPoliciesIO,
  GenerateIamPoliciesInput,
  GenerateIamPoliciesOutput
> = async ({
  ctx,
  io,
  input,
  credentialManager,
}): Promise<GenerateIamPoliciesOutput> =>
  validateInput(inputSchema(ctx), input)
    .then((input) =>
      generateIamPolicies(ctx.awsClientProvider, io, input, credentialManager),
    )
    .then(io.printOutput)
