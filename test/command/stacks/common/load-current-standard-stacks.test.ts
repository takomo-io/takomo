import { AwsCredentialIdentity } from "@aws-sdk/types"
import { CloudFormationClient } from "../../../../src/aws/cloudformation/client.js"
import {
  CloudFormationStackSummary,
  DetailedCloudFormationStackSummary,
  StackName,
} from "../../../../src/aws/cloudformation/model.js"
import { loadCurrentStandardStacks } from "../../../../src/command/stacks/common/load-current-cf-stacks.js"
import { StackPath, StackUuid } from "../../../../src/stacks/stack.js"
import { InternalStandardStack } from "../../../../src/stacks/standard-stack.js"
import { makeStackName } from "../../../../src/takomo-stacks-context/config/make-stack-name.js"
import { logger } from "../../../logger.js"
import { mock } from "jest-mock-extended"

const stack = (
  uuid: StackUuid,
  stackPath: StackPath,
  client: CloudFormationClient,
  credentials: AwsCredentialIdentity,
): InternalStandardStack => {
  const region = stackPath.split(".yml/")[0]

  const getCloudFormationClient = async (): Promise<CloudFormationClient> => {
    return client
  }

  const getCredentials = async (): Promise<AwsCredentialIdentity> => {
    return credentials
  }

  return mock<InternalStandardStack>({
    uuid,
    region,
    path: stackPath,
    name: makeStackName(stackPath),
    getCloudFormationClient,
    getCredentials,
  })
}

type StackInfo = {
  uuid: StackUuid
  path: StackPath
  credentials: AwsCredentialIdentity
}

const setup = (
  params: {
    existingStacks?: StackInfo[]
    nonExistingStacks?: StackInfo[]
  } = {},
) => {
  const listNotDeletedStacks = async (
    stackNames?: ReadonlyArray<string>,
  ): Promise<Map<StackName, DetailedCloudFormationStackSummary>> => {
    const pairs: [StackName, DetailedCloudFormationStackSummary][] =
      existingStacks
        .filter(({ name }) => stackNames?.includes(name))
        .map(({ name }) => [name, mock<DetailedCloudFormationStackSummary>()])

    return new Map(pairs)
  }

  const client = mock<CloudFormationClient>({
    listNotDeletedStacks,
  })

  const existingStacks =
    params.existingStacks?.map(({ uuid, path, credentials }) =>
      stack(uuid, path, client, credentials),
    ) ?? []

  const nonExistingStacks =
    params.nonExistingStacks?.map(({ uuid, path, credentials }) =>
      stack(uuid, path, client, credentials),
    ) ?? []

  return {
    stacks: [...existingStacks, ...nonExistingStacks],
  }
}

const credentialsA = {
  accessKeyId: "A",
  secretAccessKey: "A",
  accountId: "A",
  sessionToken: "A",
}

const credentialsB = {
  accessKeyId: "B",
  secretAccessKey: "B",
  accountId: "B",
  sessionToken: "B",
}

const credentialsC = {
  accessKeyId: "C",
  secretAccessKey: "C",
  accountId: "C",
  sessionToken: "C",
}

const expectResult = (
  result: Map<StackUuid, CloudFormationStackSummary | undefined>,
  uuid: StackUuid,
  valueFound: boolean,
): void => {
  if (valueFound) {
    expect(result.get(uuid)).toBeDefined()
  } else {
    expect(result.get(uuid)).toBeUndefined()
  }

  expect(result.has(uuid)).toBe(true)
}

describe("loadCurrentStandardStacks", () => {
  test("empty list of stack", async () => {
    const { stacks } = setup()

    const result = await loadCurrentStandardStacks(logger, stacks)

    expect(result.size).toBe(0)
  })

  test("single stack not existing in AWS", async () => {
    const { stacks } = setup({
      nonExistingStacks: [
        { uuid: "A", path: "/stack1.yml/eu-west-1", credentials: credentialsA },
      ],
    })

    const result = await loadCurrentStandardStacks(logger, stacks)

    expect(result.size).toBe(1)
    expectResult(result, "A", false)
    // expect(result.get("A")).toBeUndefined()
    // expect(result.has("A")).toBe(true)
  })

  test("single stack existing in AWS", async () => {
    const { stacks } = setup({
      existingStacks: [
        { uuid: "B", path: "/stack2.yml/eu-west-1", credentials: credentialsB },
      ],
    })

    const result = await loadCurrentStandardStacks(logger, stacks)

    expect(result.size).toBe(1)
    expectResult(result, "B", true)
    // expect(result.get("/stack2.yml/eu-west-1")).toBeDefined()
    // expect(result.has("/stack2.yml/eu-west-1")).toBe(true)
  })

  test("two stacks, one existing in AWS and one not", async () => {
    const { stacks } = setup({
      existingStacks: [
        { uuid: "C", path: "/stack3.yml/eu-west-1", credentials: credentialsC },
      ],
      nonExistingStacks: [
        { uuid: "D", path: "/stack4.yml/eu-west-1", credentials: credentialsC },
      ],
    })

    const result = await loadCurrentStandardStacks(logger, stacks)

    expect(result.size).toBe(2)

    expectResult(result, "C", true)
    expectResult(result, "D", false)

    // expect(result.get("/stack3.yml/eu-west-1")).toBeDefined()
    // expect(result.has("/stack3.yml/eu-west-1")).toBe(true)

    // expect(result.get("/stack4.yml/eu-west-1")).toBeUndefined()
    // expect(result.has("/stack4.yml/eu-west-1")).toBe(true)
  })

  test("two stacks, both existing in AWS", async () => {
    const { stacks } = setup({
      existingStacks: [
        { uuid: "E", path: "/stack5.yml/eu-west-1", credentials: credentialsA },
        { uuid: "F", path: "/stack6.yml/eu-west-1", credentials: credentialsA },
      ],
    })

    const result = await loadCurrentStandardStacks(logger, stacks)

    expect(result.size).toBe(2)

    expectResult(result, "E", true)
    expectResult(result, "F", true)

    // expect(result.get("/stack5.yml/eu-west-1")).toBeDefined()
    // expect(result.has("/stack5.yml/eu-west-1")).toBe(true)

    // expect(result.get("/stack6.yml/eu-west-1")).toBeDefined()
    // expect(result.has("/stack6.yml/eu-west-1")).toBe(true)
  })

  test("two stacks with same name, both existing in same AWS account but in different regions", async () => {
    const { stacks } = setup({
      existingStacks: [
        { uuid: "G", path: "/stackX.yml/eu-west-1", credentials: credentialsA },
        {
          uuid: "H",
          path: "/stackX.yml/eu-central-1",
          credentials: credentialsA,
        },
      ],
    })

    const result = await loadCurrentStandardStacks(logger, stacks)

    expect(result.size).toBe(2)

    expectResult(result, "G", true)
    expectResult(result, "H", true)

    // expect(result.get("/stackX.yml/eu-west-1")).toBeDefined()
    // expect(result.has("/stackX.yml/eu-west-1")).toBe(true)

    // expect(result.get("/stackX.yml/eu-central-1")).toBeDefined()
    // expect(result.has("/stackX.yml/eu-central-1")).toBe(true)
  })

  test("two stacks with same name, both existing in different AWS accounts but in same region", async () => {
    const { stacks } = setup({
      existingStacks: [
        { uuid: "I", path: "/stackX.yml/eu-west-1", credentials: credentialsA },
        { uuid: "J", path: "/stackX.yml/eu-west-1", credentials: credentialsB },
      ],
    })

    const result = await loadCurrentStandardStacks(logger, stacks)

    expect(result.size).toBe(2)

    expectResult(result, "I", true)
    expectResult(result, "J", true)

    // expect(result.get("/stackX.yml/eu-west-1")).toBeDefined()
    // expect(result.has("/stackX.yml/eu-west-1")).toBe(true)

    // expect(result.get("/stackX.yml/eu-west-1")).toBeDefined()
    // expect(result.has("/stackX.yml/eu-west-1")).toBe(true)
  })
})
