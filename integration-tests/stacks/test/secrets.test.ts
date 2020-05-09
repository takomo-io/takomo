import { initOptionsAndVariables } from "@takomo/cli"
import { CommandStatus, Constants } from "@takomo/core"
import {
  deployStacksCommand,
  listSecretsCommand,
  setSecretCommand,
  undeployStacksCommand,
} from "@takomo/stacks-commands"
import {
  TestDeployStacksIO,
  TestListSecretsIO,
  TestSetSecretIO,
  TestUndeployStacksIO,
} from "./io"
import { TIMEOUT } from "./test-constants"

const createOptions = async () =>
  initOptionsAndVariables({
    log: "info",
    yes: true,
    dir: "configs/secrets",
  })

// First, make sure that there are no existing stacks left from previous test runs
beforeAll(async () => {
  const { options, variables, watch } = await createOptions()
  return await undeployStacksCommand(
    {
      commandPath: Constants.ROOT_STACK_GROUP_PATH,
      ignoreDependencies: false,
      interactive: false,
      options,
      variables,
      watch,
    },
    new TestUndeployStacksIO(options),
  )
}, TIMEOUT)

describe("Secrets", () => {
  test(
    "List secrets",
    async () => {
      const { options, variables, watch } = await createOptions()
      const output = await listSecretsCommand(
        {
          commandPath: Constants.ROOT_STACK_GROUP_PATH,
          options,
          variables,
          watch,
        },
        new TestListSecretsIO(options),
      )

      expect(output.success).toBeTruthy()
      expect(output.message).toBe("Success")

      expect(output.stacks).toHaveLength(2)

      const first = output.stacks.find(
        (s) => s.stack.getPath() === "/first-secret.yml/eu-central-1",
      )!
      expect(first).toBeDefined()

      const second = output.stacks.find(
        (s) => s.stack.getPath() === "/second-secret.yml/eu-central-1",
      )!
      expect(second).toBeDefined()

      expect(first.stack.getPath()).toBe("/first-secret.yml/eu-central-1")
      expect(first.stack.getSecrets().size).toBe(2)

      expect(second.stack.getPath()).toBe("/second-secret.yml/eu-central-1")
      expect(second.stack.getSecrets().size).toBe(0)

      const queueNameSecret = first.secrets.find((s) => s.name === "queueName")!

      expect(queueNameSecret.ssmParameterName).toBe(
        "/examples-secrets/first-secret.yml/eu-central-1/queueName",
      )
      expect(queueNameSecret.name).toBe("queueName")
      expect(queueNameSecret.description).toBe("Name for queue")
      expect(queueNameSecret.value).toBeNull()

      const topicNameSecret = first.secrets.find((s) => s.name === "topicName")!

      expect(topicNameSecret.ssmParameterName).toBe(
        "/examples-secrets/first-secret.yml/eu-central-1/topicName",
      )
      expect(topicNameSecret.name).toBe("topicName")
      expect(topicNameSecret.description).toBe("Name for topic")
      expect(topicNameSecret.value).toBeNull()
    },
    TIMEOUT,
  )

  test(
    "Set secrets",
    async () => {
      const { options, variables, watch } = await createOptions()

      const io = new TestSetSecretIO(
        options,
        new Map([
          ["queueName", "my-secret-queue"],
          ["topicName", "topic-of-the-day"],
        ]),
      )

      const output1 = await setSecretCommand(
        {
          options,
          variables,
          watch,
          stackPath: "/first-secret.yml/eu-central-1",
          secretName: "queueName",
        },
        io,
      )

      expect(output1.success).toBe(true)
      expect(output1.message).toBe("Success")

      const output2 = await setSecretCommand(
        {
          options,
          variables,
          watch,
          stackPath: "/first-secret.yml/eu-central-1",
          secretName: "topicName",
        },
        io,
      )

      expect(output2.success).toBeTruthy()
      expect(output2.message).toBe("Success")
    },
    TIMEOUT,
  )

  test(
    "List secrets again",
    async () => {
      const { options, variables, watch } = await createOptions()
      const output = await listSecretsCommand(
        {
          options,
          variables,
          watch,
          commandPath: Constants.ROOT_STACK_GROUP_PATH,
        },
        new TestListSecretsIO(options),
      )

      expect(output.success).toBeTruthy()
      expect(output.message).toBe("Success")

      expect(output.stacks).toHaveLength(2)

      const first = output.stacks.find(
        (s) => s.stack.getPath() === "/first-secret.yml/eu-central-1",
      )!
      expect(first).toBeDefined()

      const second = output.stacks.find(
        (s) => s.stack.getPath() === "/second-secret.yml/eu-central-1",
      )!
      expect(second).toBeDefined()

      expect(first.stack.getPath()).toBe("/first-secret.yml/eu-central-1")
      expect(first.stack.getSecrets().size).toBe(2)

      expect(second.stack.getPath()).toBe("/second-secret.yml/eu-central-1")
      expect(second.stack.getSecrets().size).toBe(0)

      const queueNameSecret = first.secrets.find((s) => s.name === "queueName")!

      expect(queueNameSecret.ssmParameterName).toBe(
        "/examples-secrets/first-secret.yml/eu-central-1/queueName",
      )
      expect(queueNameSecret.name).toBe("queueName")
      expect(queueNameSecret.description).toBe("Name for queue")
      expect(queueNameSecret.value).toBe("my-secret-queue")

      const topicNameSecret = first.secrets.find((s) => s.name === "topicName")!

      expect(topicNameSecret.ssmParameterName).toBe(
        "/examples-secrets/first-secret.yml/eu-central-1/topicName",
      )
      expect(topicNameSecret.name).toBe("topicName")
      expect(topicNameSecret.description).toBe("Name for topic")
      expect(topicNameSecret.value).toBe("topic-of-the-day")
    },
    TIMEOUT,
  )

  test(
    "Launch",
    async () => {
      const { options, variables, watch } = await createOptions()
      const output = await deployStacksCommand(
        {
          options,
          variables,
          watch,
          ignoreDependencies: false,
          interactive: false,
          commandPath: Constants.ROOT_STACK_GROUP_PATH,
        },
        new TestDeployStacksIO(options),
      )

      expect(output.status).toBe(CommandStatus.SUCCESS)
      // TODO: Add more assertions
    },
    TIMEOUT,
  )

  test(
    "Delete",
    async () => {
      const { options, variables, watch } = await createOptions()
      const output = await undeployStacksCommand(
        {
          options,
          variables,
          watch,
          ignoreDependencies: false,
          interactive: false,
          commandPath: Constants.ROOT_STACK_GROUP_PATH,
        },
        new TestUndeployStacksIO(options),
      )

      expect(output.status).toBe(CommandStatus.SUCCESS)
      // TODO: Add more assertions
    },
    TIMEOUT,
  )
})
