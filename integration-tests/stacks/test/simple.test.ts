import { initOptionsAndVariables, OptionsAndVariables } from "@takomo/cli"
import { CommandStatus, Constants } from "@takomo/core"
import {
  deployStacksCommand,
  undeployStacksCommand,
} from "@takomo/stacks-commands"
import { TestDeployStacksIO, TestUndeployStacksIO, TIMEOUT } from "@takomo/test"
import { Credentials } from "aws-sdk"
import { basename } from "path"
import { Recycler, Reservation } from "testenv-recycler"

const createOptions = async (
  reservation: Reservation | null,
): Promise<OptionsAndVariables> => {
  if (!reservation) {
    throw new Error("Reservation is null")
  }

  const account1Id = reservation.accounts[0].accountId

  return initOptionsAndVariables(
    {
      log: "info",
      yes: true,
      dir: "configs/simple",
      var: `ACCOUNT_1_ID=${account1Id}`,
    },
    new Credentials(reservation.credentials),
  )
}

const recycler = new Recycler({
  hostname: process.env.RECYCLER_HOSTNAME!,
  basePath: process.env.RECYCLER_BASEPATH!,
  username: process.env.RECYCLER_USERNAME!,
  password: process.env.RECYCLER_PASSWORD!,
})

let reservation: Reservation | null = null

beforeAll(async () => {
  await recycler.login()
  reservation = await recycler.createReservation({
    count: 1,
    name: basename(__filename),
  })
}, TIMEOUT)

afterAll(async () => {
  if (!reservation) {
    return
  }
  await recycler.releaseReservation(reservation.id)
})

describe("Simple", () => {
  test(
    "Deploy",
    async () => {
      const { options, variables, watch } = await createOptions(reservation)
      const output = await deployStacksCommand(
        {
          options,
          variables,
          watch,
          commandPath: Constants.ROOT_STACK_GROUP_PATH,
          ignoreDependencies: false,
          interactive: false,
        },
        new TestDeployStacksIO(options),
      )

      expect(output.status).toBe(CommandStatus.SUCCESS)
      expect(output.results[0].success).toBeTruthy()
      expect(output.results[0].status).toBe(CommandStatus.SUCCESS)
      expect(output.results[0].reason).toBe("CREATE_SUCCESS")
    },
    TIMEOUT,
  )

  test(
    "Deploying without changes",
    async () => {
      const { options, variables, watch } = await createOptions(reservation)
      const output = await deployStacksCommand(
        {
          options,
          variables,
          watch,
          commandPath: Constants.ROOT_STACK_GROUP_PATH,
          ignoreDependencies: false,
          interactive: false,
        },
        new TestDeployStacksIO(options),
      )

      expect(output.status).toBe(CommandStatus.SKIPPED)
      expect(output.results[0].success).toBeTruthy()
      expect(output.results[0].status).toBe(CommandStatus.SKIPPED)
      expect(output.results[0].reason).toBe("SKIPPED")
    },
    TIMEOUT,
  )

  test(
    "Undeploy",
    async () => {
      const { options, variables, watch } = await createOptions(reservation)
      const output = await undeployStacksCommand(
        {
          options,
          variables,
          watch,
          commandPath: Constants.ROOT_STACK_GROUP_PATH,
          ignoreDependencies: false,
          interactive: false,
        },
        new TestUndeployStacksIO(options),
      )

      expect(output.status).toBe(CommandStatus.SUCCESS)
    },
    TIMEOUT,
  )
})
