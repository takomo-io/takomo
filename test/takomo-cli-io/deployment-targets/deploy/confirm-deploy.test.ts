import { mock } from "jest-mock-extended"
import { dedent } from "ts-dedent"
import { createDeployTargetsIO } from "../../../../src/cli-io/deployment-targets/deploy-targets-io.js"
import { PlannedDeploymentTarget } from "../../../../src/command/targets/common/plan/model.js"
import { TargetsExecutionPlan } from "../../../../src/command/targets/operation/model.js"
import { bold } from "../../../../src/utils/colors.js"
import {
  createConsoleLogger,
  LogWriter,
} from "../../../../src/utils/logging.js"
import { createCapturingLogWriter } from "../../../capturing-log-writer.js"
import { UserActions } from "../../../../src/cli-io/user-actions.js"

const actions = mock<UserActions>()

actions.choose
  .calledWith(
    "How do you want to continue?",
    [
      {
        name: "cancel deployment",
        value: "CANCEL",
      },
      {
        name: "continue, but let me review changes to each target",
        value: "CONTINUE_AND_REVIEW",
      },
      {
        name: "continue, deploy all targets without reviewing changes",
        value: "CONTINUE_NO_REVIEW",
      },
    ],
    true,
  )
  .mockResolvedValue(true)

const createIO = (writer: LogWriter) =>
  createDeployTargetsIO({
    actions,
    writer,
    logger: createConsoleLogger({ logLevel: "info" }),
  })

const confirmDeploy = (plan: TargetsExecutionPlan): Promise<string> => {
  const output = { value: "" }
  return createIO(createCapturingLogWriter(output))
    .confirmOperation(plan)
    .then(() => output.value)
}

interface TargetProps {
  readonly id: string
  readonly accountId?: string
  readonly description?: string
  readonly configSets: Array<string>
}

const target = ({ id, configSets, accountId, description }: TargetProps) => {
  return {
    id,
    configSets: configSets.map((name) => ({ name, commandPaths: ["/"] })),
    data: mock<PlannedDeploymentTarget>({
      name: id,
      accountId,
      description,
    }),
    vars: {},
  }
}

describe("Confirm deploy", () => {
  test("a single target", async () => {
    const output = await confirmDeploy({
      stages: [
        {
          stageName: "default",
          groups: [
            {
              id: "all/one",
              targets: [target({ id: "first", configSets: ["example"] })],
            },
          ],
        },
      ],
    })
    const expected = dedent`
    
    ${bold("Targets deployment plan")}
    ${bold("-----------------------")}
    A targets deployment plan has been created and is shown below. Targets
    will be deployed in the order they are listed.
    
    Following targets will be deployed:
    
      stage: default
    
        all/one:
    
          - name:               first
            config sets:
              - example
    
    `
    expect(output).toBe(expected)
  })

  test("a single target with account id", async () => {
    const output = await confirmDeploy({
      stages: [
        {
          stageName: "super",
          groups: [
            {
              id: "all/two",
              targets: [
                target({
                  id: "second",
                  accountId: "12345678912",
                  configSets: ["other"],
                }),
              ],
            },
          ],
        },
      ],
    })
    const expected = dedent`
    
    ${bold("Targets deployment plan")}
    ${bold("-----------------------")}
    A targets deployment plan has been created and is shown below. Targets
    will be deployed in the order they are listed.
    
    Following targets will be deployed:
    
      stage: super
    
        all/two:
    
          - name:               second
            account id:         12345678912
            config sets:
              - other
    
    `
    expect(output).toBe(expected)
  })

  test("a single target with account id and description", async () => {
    const output = await confirmDeploy({
      stages: [
        {
          stageName: "super",
          groups: [
            {
              id: "all/two",
              targets: [
                target({
                  id: "third",
                  accountId: "888888887766",
                  description: "hello",
                  configSets: ["logs", "vpc", "data"],
                }),
              ],
            },
          ],
        },
      ],
    })
    const expected = dedent`
    
    ${bold("Targets deployment plan")}
    ${bold("-----------------------")}
    A targets deployment plan has been created and is shown below. Targets
    will be deployed in the order they are listed.
    
    Following targets will be deployed:
    
      stage: super
    
        all/two:
    
          - name:               third
            account id:         888888887766
            description:        hello
            config sets:
              - logs
              - vpc
              - data
    
    `
    expect(output).toBe(expected)
  })
})
