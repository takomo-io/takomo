import {
  aws,
  executeDeployStacksCommand,
  withSingleAccountReservation,
} from "@takomo/test-integration"

const projectDir = "configs/resolvers/ssm"
const stack = {
  stackPath: "/stack-x.yml/eu-west-1",
  stackName: "stack-x",
}

describe("SSM resolver", () => {
  test(
    "Deploy",
    withSingleAccountReservation(async ({ accountId, credentials }) => {
      const iamRoleArn = `arn:aws:iam::${accountId}:role/OrganizationAccountAccessRole`

      await aws.ssm.putParameter({
        credentials,
        iamRoleArn,
        region: "eu-west-1",
        encrypted: false,
        name: "simple-param",
        value: "Shinji Ikari",
      })
      await aws.ssm.putParameter({
        credentials,
        iamRoleArn,
        region: "eu-west-1",
        encrypted: false,
        name: "/param/with/path",
        value: "Asuka Langley Soryu",
      })
      await aws.ssm.putParameter({
        credentials,
        iamRoleArn,
        region: "eu-west-1",
        encrypted: true,
        name: "encrypted-param-name",
        value: "Rei Ayanami",
      })
      await aws.ssm.putParameter({
        credentials,
        iamRoleArn,
        region: "eu-north-1",
        encrypted: false,
        name: "/param/in/other/region",
        value: "Misato Katsuragi",
      })
      await aws.ssm.putParameter({
        credentials,
        iamRoleArn,
        region: "eu-west-1",
        encrypted: false,
        name: "/param/with/role",
        value: "Gendo Ikari",
      })

      return executeDeployStacksCommand({ projectDir, logLevel: "debug" })
        .expectCommandToSucceed()
        .expectStackCreateSuccess(stack)
        .expectDeployedCfStack({
          ...stack,
          credentials,
          accountId,
          region: "eu-west-1",
          roleName: "OrganizationAccountAccessRole",
          expectedOutputs: {
            OneOutput: "Shinji Ikari",
            TwoOutput: "Asuka Langley Soryu",
            ThreeOutput: "Rei Ayanami",
            FourOutput: "Misato Katsuragi",
            FiveOutput: "Gendo Ikari",
          },
        })
        .assert()
    }),
  )
})
