import { createCloudTrailClient, CredentialManager } from "@takomo/aws-clients"
import { CloudTrailEvent, Region } from "@takomo/aws-model"
import { createAwsSchemas } from "@takomo/aws-schema"
import {
  CommandContext,
  CommandHandler,
  createCommonSchema,
} from "@takomo/core"
import { TkmLogger, validateInput } from "@takomo/util"
import Joi, { AnySchema } from "joi"
import R from "ramda"
import {
  GenerateIamPoliciesInput,
  GenerateIamPoliciesIO,
  GenerateIamPoliciesOutput,
} from "./model"

const getEventsFromRegion = (
  credentialManager: CredentialManager,
  logger: TkmLogger,
  region: Region,
  startTime: Date,
  endTime: Date,
): Promise<ReadonlyArray<CloudTrailEvent>> => {
  const ct = createCloudTrailClient({
    logger,
    region,
    id: "cloudtrail",
    credentialManager,
  })

  return ct.lookupEvents(startTime, endTime)
}

const getEventsFromRegions = async (
  credentialManager: CredentialManager,
  logger: TkmLogger,
  regions: ReadonlyArray<Region>,
  startTime: Date,
  endTime: Date,
  events: ReadonlyArray<CloudTrailEvent>,
): Promise<ReadonlyArray<CloudTrailEvent>> => {
  if (regions.length === 0) {
    return events
  }

  const [region, ...rest] = regions
  const regionEvents = await getEventsFromRegion(
    credentialManager,
    logger,
    region,
    startTime,
    endTime,
  )

  return getEventsFromRegions(
    credentialManager,
    logger,
    rest,
    startTime,
    endTime,
    [...events, ...regionEvents],
  )
}

const generateIamPolicies = async (
  ctx: CommandContext,
  io: GenerateIamPoliciesIO,
  input: GenerateIamPoliciesInput,
  credentialManager: CredentialManager,
): Promise<GenerateIamPoliciesOutput> => {
  const { timer, startTime, endTime, regions, identities } = input

  const events = await getEventsFromRegions(
    credentialManager,
    io,
    regions,
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

  timer.stop()

  return {
    policies,
    message: "Success",
    status: "SUCCESS",
    success: true,
    timer,
  }
}

const inputSchema = (ctx: CommandContext): AnySchema => {
  const { region } = createAwsSchemas({ regions: ctx.regions })
  const { project } = createCommonSchema()

  return Joi.object({
    project,
    regions: Joi.array().items(region).unique(),
    createSamples: Joi.boolean(),
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
    .then((input) => generateIamPolicies(ctx, io, input, credentialManager))
    .then(io.printOutput)
