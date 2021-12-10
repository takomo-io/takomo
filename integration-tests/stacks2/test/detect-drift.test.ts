import {
  aws,
  executeDeployStacksCommand,
  executeDetectDriftCommand,
  withSingleAccountReservation,
} from "@takomo/test-integration"

const stackPath = "/vpc.yml/eu-north-1",
  stackName = "simple-vpc",
  projectDir = "configs/detect-drift"

describe("Detect drift", () => {
  test("Of pending stacks", () =>
    executeDetectDriftCommand({ projectDir })
      .expectCommandToSucceed()
      .expectStack({
        stackPath,
        stackName,
      })
      .assert())

  test("Of deployed stacks", async () => {
    await executeDeployStacksCommand({ projectDir })
      .expectCommandToSucceed()
      .expectStackCreateSuccess({
        stackPath,
        stackName,
      })
      .assert()

    await executeDetectDriftCommand({ projectDir })
      .expectCommandToSucceed()
      .expectStack({
        stackPath,
        stackName,
        status: "CREATE_COMPLETE",
        detectionStatus: "DETECTION_COMPLETE",
        stackDriftStatus: "IN_SYNC",
        driftedStackResourceCount: 0,
      })
      .assert()
  })

  test(
    "When a stack have drifted",
    withSingleAccountReservation(async ({ accountId, credentials }) => {
      await aws.ec2.tagVpc({
        credentials,
        tagKey: "Name",
        tagValue: "A new name",
        cidr: "10.0.1.0/24",
        iamRoleArn: `arn:aws:iam::${accountId}:role/OrganizationAccountAccessRole`,
        region: "eu-north-1",
      })

      return executeDetectDriftCommand({ projectDir })
        .expectCommandToFail()
        .expectStack({
          stackPath,
          stackName,
          status: "CREATE_COMPLETE",
          detectionStatus: "DETECTION_COMPLETE",
          stackDriftStatus: "DRIFTED",
          driftedStackResourceCount: 1,
        })
        .assert()
    }),
  )
})
