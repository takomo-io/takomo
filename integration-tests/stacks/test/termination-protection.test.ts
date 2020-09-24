import { initOptionsAndVariables, OptionsAndVariables } from "@takomo/cli"
import { CommandStatus, Constants } from "@takomo/core"
import {
  deployStacksCommand,
  undeployStacksCommand,
} from "@takomo/stacks-commands"
import {
  aws,
  TestDeployStacksIO,
  TestUndeployStacksIO,
  TIMEOUT,
} from "@takomo/test"
import { TakomoError } from "@takomo/util/src"
import { Credentials } from "aws-sdk"
import { basename } from "path"
import { Recycler, Reservation } from "testenv-recycler"

const createOptions = async (
  reservation: Reservation | null,
  terminationProtection: boolean,
): Promise<OptionsAndVariables> => {
  if (!reservation) {
    throw new Error("Reservation is null")
  }

  const account1Id = reservation.accounts[0].accountId

  return initOptionsAndVariables(
    {
      log: "info",
      yes: true,
      dir: "configs/termination-protection",
      var: [
        `ACCOUNT_1_ID=${account1Id}`,
        `terminationProtection=${terminationProtection}`,
      ],
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

describe("Termination protection", () => {
  test(
    "Create a stack with termination protection enabled",
    async () => {
      const { options, variables, watch } = await createOptions(
        reservation,
        true,
      )
      const output = await deployStacksCommand(
        {
          commandPath: Constants.ROOT_STACK_GROUP_PATH,
          options,
          variables,
          ignoreDependencies: false,
          interactive: false,
          watch,
        },
        new TestDeployStacksIO(options),
      )

      expect(output.status).toBe(CommandStatus.SUCCESS)
      expect(output.results[0].success).toBeTruthy()
      expect(output.results[0].status).toBe(CommandStatus.SUCCESS)
      expect(output.results[0].reason).toBe("CREATE_SUCCESS")

      const stack = await aws.cloudFormation.describeStack({
        credentials: new Credentials(reservation!.credentials),
        iamRoleArn: `arn:aws:iam::${
          reservation!.accounts[0].accountId
        }:role/OrganizationAccountAccessRole`,
        stackName: "termination-protection",
        region: "eu-north-1",
      })
      expect(stack.EnableTerminationProtection).toBeTruthy()
    },
    TIMEOUT,
  )

  test(
    "Try to undeploy",
    async () => {
      const { options, variables, watch } = await createOptions(
        reservation,
        false,
      )

      await expect(
        undeployStacksCommand(
          {
            commandPath: Constants.ROOT_STACK_GROUP_PATH,
            ignoreDependencies: false,
            interactive: false,
            options,
            variables,
            watch,
          },
          new TestUndeployStacksIO(options),
        ),
      ).rejects.toEqual(
        new TakomoError(
          "Can't undeploy stacks because following stacks have termination protection enabled:\n\n" +
            "  - /a.yml/eu-north-1",
        ),
      )
    },
    TIMEOUT,
  )

  test(
    "Disable termination protection",
    async () => {
      const { options, variables, watch } = await createOptions(
        reservation,
        false,
      )
      const output = await deployStacksCommand(
        {
          commandPath: Constants.ROOT_STACK_GROUP_PATH,
          options,
          variables,
          ignoreDependencies: false,
          interactive: false,
          watch,
        },
        new TestDeployStacksIO(options),
      )

      expect(output.status).toBe(CommandStatus.SUCCESS)
      expect(output.results[0].success).toBeTruthy()
      expect(output.results[0].status).toBe(CommandStatus.SUCCESS)
      expect(output.results[0].reason).toBe("UPDATE_SUCCESS")

      const stack = await aws.cloudFormation.describeStack({
        credentials: new Credentials(reservation!.credentials),
        iamRoleArn: `arn:aws:iam::${
          reservation!.accounts[0].accountId
        }:role/OrganizationAccountAccessRole`,
        stackName: "termination-protection",
        region: "eu-north-1",
      })
      expect(stack.EnableTerminationProtection).toBeFalsy()
    },
    TIMEOUT,
  )

  test(
    "Undeploy",
    async () => {
      const { options, variables, watch } = await createOptions(
        reservation,
        false,
      )
      const output = await undeployStacksCommand(
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

      expect(output.status).toBe(CommandStatus.SUCCESS)
    },
    TIMEOUT,
  )
})
