import {
  executeDeployStacksCommand,
  withSingleAccountReservation,
} from "@takomo/test-integration"

const projectDir = "configs/inherit-tags"

const common = {
  region: "eu-north-1",
  roleName: "OrganizationAccountAccessRole",
}
const a = {
  ...common,
  stackName: "group-a",
  stackPath: "/group/a.yml/eu-north-1",
}
const b = {
  ...common,
  stackName: "group-b",
  stackPath: "/group/b.yml/eu-north-1",
}
const c = {
  ...common,
  stackName: "group-c",
  stackPath: "/group/c.yml/eu-north-1",
}
const d = {
  ...common,
  stackName: "group-another-d",
  stackPath: "/group/another/d.yml/eu-north-1",
}
const e = {
  ...common,
  stackName: "group-another-e",
  stackPath: "/group/another/e.yml/eu-north-1",
}

describe("Inherit tags property", () => {
  test(
    "Deploy",
    withSingleAccountReservation(({ accountId, credentials }) =>
      executeDeployStacksCommand({ projectDir })
        .expectCommandToSucceed()
        .expectStackCreateSuccess(a, b, c, d, e)
        .expectDeployedCfStack({
          accountId,
          credentials,
          ...a,
          expectedTags: {
            code: "123",
          },
        })
        .expectDeployedCfStack({
          accountId,
          credentials,
          ...b,
          expectedTags: {
            foo: "bar",
            hello: "world",
          },
        })
        .expectDeployedCfStack({
          accountId,
          credentials,
          ...c,
          expectedTags: {
            foo: "bar",
            hello: "world",
            code: "456",
          },
        })
        .expectDeployedCfStack({
          accountId,
          credentials,
          ...d,
          expectedTags: {
            jolly: "roger",
            code: "789",
          },
        })
        .expectDeployedCfStack({
          accountId,
          credentials,
          ...e,
          expectedTags: {
            code: "100",
          },
        })
        .assert(),
    ),
  )
})
