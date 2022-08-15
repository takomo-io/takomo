import { executeDeployStacksCommand } from '@takomo/test-integration/src'
import { uuid } from '@takomo/util'

const projectDir = "configs/put-to-s3-hook",
  stackPath = "/stack.yml/eu-west-1",
  stackName = "stack",
  bucketName = uuid(),
  key = uuid(),
  content = '{"test":"testing"}'

describe('Put to S3 Hook', () => {
  test('Should put object to S3', async () => {
    await executeDeployStacksCommand({
      projectDir,
      var: [`bucketName=${bucketName}`, `key=${key}`, `content=${content}`],
    })
      .expectCommandToSucceed()
      .expectStackCreateSuccess({
        stackName,
        stackPath,
      })
      .assert()
  })
})
