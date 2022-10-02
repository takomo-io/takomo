import {
  aws,
  executeDeployStacksCommand,
  withSingleAccountReservation,
} from "@takomo/test-integration"
import { uuid } from "@takomo/util"

const projectDir = "configs/put-to-s3-hook",
  stackPath = "/stack.yml/eu-west-1",
  stackName = "stack",
  bucketName = uuid(),
  key = uuid(),
  key2 = uuid(),
  content = '{"test":"testing"}'

describe("Put to S3 Hook", () => {
  test(
    "Should put object to S3",
    withSingleAccountReservation(async ({ credentials, accountId }) => {
      await executeDeployStacksCommand({
        projectDir,
        var: [
          `bucketName=${bucketName}`,
          `key=${key}`,
          `key2=${key2}`,
          `content=${content}`,
        ],
      })
        .expectCommandToSucceed()
        .expectStackCreateSuccess({
          stackName,
          stackPath,
        })
        .assert()

      const actualContent = await aws.s3.getObjectContent({
        credentials,
        key,
        bucket: bucketName,
        region: "eu-west-1",
        iamRoleArn: `arn:aws:iam::${accountId}:role/OrganizationAccountAccessRole`,
      })

      expect(actualContent).toEqual(content)

      const actualContent2 = await aws.s3.getObjectContent({
        credentials,
        key: key2,
        bucket: bucketName,
        region: "eu-west-1",
        iamRoleArn: `arn:aws:iam::${accountId}:role/OrganizationAccountAccessRole`,
      })

      const expectedContent2 = {
        another: {
          content: "as object",
          example: [1, 2, 3],
        },
      }

      expect(JSON.parse(actualContent2)).toEqual(expectedContent2)
    }),
  )
})
