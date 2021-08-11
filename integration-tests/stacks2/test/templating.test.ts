import {
  ExecuteCommandProps,
  executeDeployStacksCommand,
  withSingleAccountReservation,
} from "@takomo/test-integration"

const props: ExecuteCommandProps = {
  projectDir: "configs/templating",
  varFile: ["queues.yml"],
}

describe("Templating", () => {
  test(
    "Deploy",
    withSingleAccountReservation(async ({ credentials, accountId }) =>
      executeDeployStacksCommand(props)
        .expectCommandToSucceed()
        .expectStackCreateSuccess({
          stackPath: "/queues.yml/eu-north-1",
          stackName: "queues",
        })
        .expectStackCreateSuccess({
          stackPath: "/topics.yml/eu-north-1",
          stackName: "topics",
        })
        .expectStackCreateSuccess({
          stackPath: "/not-dynamic.yml/eu-north-1",
          stackName: "not-dynamic",
        })
        .expectStackCreateSuccess({
          stackPath: "/another-not-dynamic.yml/eu-north-1",
          stackName: "another-not-dynamic",
        })
        .expectStackCreateSuccess({
          stackPath: "/dynamic.yml/eu-north-1",
          stackName: "dynamic",
        })
        .expectStackCreateSuccess({
          stackPath: "/parameters.yml/eu-north-1",
          stackName: "parameters",
        })
        .expectDeployedCfStack({
          credentials,
          accountId,
          stackName: "parameters",
          region: "eu-north-1",
          roleName: "OrganizationAccountAccessRole",
          expectedOutputs: {
            ParamA: "one",
            ParamB: "two",
            ParamC: "three",
            ParamD: "foo,bar,baz",
            OutMap: "foo,bar,baz",
          },
        })
        .expectDeployedCfStack({
          credentials,
          accountId,
          stackName: "queues",
          region: "eu-north-1",
          roleName: "OrganizationAccountAccessRole",
          expectedOutputs: {
            NumberParam: "300",
            HelloParam: "World",
          },
          expectedDescription: "IT - templating World",
        })
        .expectDeployedCfStack({
          credentials,
          accountId,
          stackName: "dynamic",
          region: "eu-north-1",
          roleName: "OrganizationAccountAccessRole",
          expectedDescription: "dynamic",
        })
        .expectDeployedCfStack({
          credentials,
          accountId,
          stackName: "not-dynamic",
          region: "eu-north-1",
          roleName: "OrganizationAccountAccessRole",
          expectedDescription: "String with handlebars syntax {{ var.hello }}",
        })
        .expectDeployedCfStack({
          credentials,
          accountId,
          stackName: "another-not-dynamic",
          region: "eu-north-1",
          roleName: "OrganizationAccountAccessRole",
          expectedDescription:
            "Another string with handlebars syntax {{ var.hello }}",
        })
        .assert(),
    ),
  )
})
