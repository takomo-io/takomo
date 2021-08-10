import {
  executeDeployStacksCommand,
  withSingleAccountReservation,
} from "@takomo/test-integration"

describe("Tag inheritance", () => {
  test(
    "Deploy",
    withSingleAccountReservation(({ credentials, accountId }) =>
      executeDeployStacksCommand({
        projectDir: "configs/tag-inheritance",
      })
        .expectCommandToSucceed()
        .expectStackCreateSuccess(
          {
            stackName: "three",
            stackPath: "/three.yml/eu-north-1",
          },
          {
            stackName: "aaa-two",
            stackPath: "/aaa/two.yml/eu-north-1",
          },
          {
            stackName: "aaa-bbb-one",
            stackPath: "/aaa/bbb/one.yml/eu-north-1",
          },
        )
        .expectDeployedCfStack({
          credentials,
          accountId,
          stackName: "three",
          region: "eu-north-1",
          roleName: "OrganizationAccountAccessRole",
          expectedTags: {
            foo: "bar",
            fux: "baz",
            hello: "world",
          },
        })
        .expectDeployedCfStack({
          credentials,
          accountId,
          stackName: "aaa-two",
          region: "eu-north-1",
          roleName: "OrganizationAccountAccessRole",
          expectedTags: {
            foo: "bar1",
            fux: "baz",
            hello: "world",
          },
        })
        .expectDeployedCfStack({
          credentials,
          accountId,
          stackName: "aaa-bbb-one",
          region: "eu-north-1",
          roleName: "OrganizationAccountAccessRole",
          expectedTags: {
            foo: "bar1",
            fux: "new-value",
            hello: "world",
          },
        })
        .assert(),
    ),
  )
})
