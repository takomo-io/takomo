/**
 * @testenv-recycler-count 2
 */

import { aws } from "../../src/aws-api.js"
import { executeDeployStacksCommand } from "../../src/commands/stacks.js"
import { withReservation } from "../../src/reservations.js"

const projectDir = `${process.cwd()}/integration-test/configs/resolvers/secret`
const stack = {
  stackPath: "/one.yml/eu-north-1",
  stackName: "one",
}

describe("Secret resolver", () => {
  test(
    "Deploy",
    withReservation(async ({ accountIds, credentials }) => {
      const [account1id, account2id] = accountIds

      const account1IamRoleArn = `arn:aws:iam::${account1id}:role/OrganizationAccountAccessRole`
      const account2IamRoleArn = `arn:aws:iam::${account2id}:role/OrganizationAccountAccessRole`

      // A secret in the same account and region
      await aws.secrets.createSecret({
        credentials,
        name: "MyAccount1Secret1",
        region: "eu-north-1",
        value: "my-secret-1",
        iamRoleArn: account1IamRoleArn,
      })

      // A secret in the same account and but different region
      await aws.secrets.createSecret({
        credentials,
        name: "MyAccount1Secret2",
        region: "eu-west-1",
        value: "my-secret-2",
        iamRoleArn: account1IamRoleArn,
      })

      // A secret in another account and same region
      await aws.secrets.createSecret({
        credentials,
        name: "MyAccount2Secret1",
        region: "eu-north-1",
        value: "my-secret-3",
        iamRoleArn: account2IamRoleArn,
      })

      // A secret in the same account with multiple versions and stages
      const { arn } = await aws.secrets.createSecret({
        credentials,
        name: "MyAccount1Secret3",
        region: "eu-north-1",
        value: "my-secret-4-first",
        iamRoleArn: account1IamRoleArn,
      })

      // Update the secret above
      const updatedSecret = await aws.secrets.putSecret({
        credentials,
        secretId: arn,
        region: "eu-north-1",
        value: "my-secret-4-updated",
        iamRoleArn: account1IamRoleArn,
      })

      // Update the secret above again
      await aws.secrets.putSecret({
        credentials,
        secretId: arn,
        region: "eu-north-1",
        value: "my-secret-4-updated-v2",
        iamRoleArn: account1IamRoleArn,
      })

      // A secret in the same account and region with value in json format
      await aws.secrets.createSecret({
        credentials,
        name: "MyAccount1Secret4",
        region: "eu-north-1",
        value: `{"person": {"name": "Zorro"}}`,
        iamRoleArn: account1IamRoleArn,
      })

      return executeDeployStacksCommand({
        projectDir,
        logLevel: "debug",
        var: [`updatedSecretVersionId=${updatedSecret.versionId}`],
      })
        .expectCommandToSucceed()
        .expectStackCreateSuccess(stack)
        .expectDeployedCfStackV2({
          stackPath: "/one.yml/eu-north-1",
          outputs: {
            OneOutput: "my-secret-1",
            TwoOutput: "my-secret-2",
            ThreeOutput: "Zorro",
            FourOutput: "my-secret-3",
            FiveOutput: "my-secret-4-updated",
            SixOutput: "my-secret-4-updated",
            SevenOutput: "my-secret-4-updated-v2",
          },
        })
        .assert()
    }),
  )
})
