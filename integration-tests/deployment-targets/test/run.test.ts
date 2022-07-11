/**
 * @testenv-recycler-count 5
 */
import {
  aws,
  executeRunTargetsCommand,
  withReservation,
} from "@takomo/test-integration"

const projectDir = "configs/run"

describe("Run", () => {
  test("Simple map command", () =>
    executeRunTargetsCommand({
      projectDir,
      mapCommand: "echo $TKM_TARGET_NAME",
    })
      .expectCommandToSucceed((result: any) => {
        expect(result.sort()).toStrictEqual([
          "five\n",
          "four\n",
          "one\n",
          "three\n",
          "two\n",
        ])
      })
      .assert())

  test(
    "Simple map command with deployment role",
    withReservation(({ accountIds }) =>
      executeRunTargetsCommand({
        projectDir,
        targets: ["one"],
        mapCommand:
          "aws sts get-caller-identity --query Account --output text --region eu-central-1",
      })
        .expectCommandToSucceed([`${accountIds[0]}\n`])
        .assert(),
    ),
  )

  test(
    "Simple map command without deployment role",
    withReservation(async ({ credentials }) => {
      const { accountId } = await aws.sts.getCallerIdentity(credentials)
      return executeRunTargetsCommand({
        projectDir,
        targets: ["three"],
        mapCommand:
          "aws sts get-caller-identity --query Account --output text --region eu-central-1",
      })
        .expectCommandToSucceed([`${accountId}\n`])
        .assert()
    }),
  )

  test("Simple map command with map args of type string", () =>
    executeRunTargetsCommand({
      projectDir,
      disableMapRole: true,
      targets: ["three"],
      mapArgs: "hello-partner",
      mapCommand: "echo $TKM_MAP_ARGS",
    })
      .expectCommandToSucceed(["hello-partner\n"])
      .assert())

  test("Simple map command with map args from a .txt file", () =>
    executeRunTargetsCommand({
      projectDir,
      disableMapRole: true,
      targets: ["three"],
      mapArgs: "file:message.txt",
      mapCommand: "echo $TKM_MAP_ARGS",
    })
      .expectCommandToSucceed(["Rick and Morty rules!\n"])
      .assert())

  test("Simple map command with map args from a .json file", () =>
    executeRunTargetsCommand({
      projectDir,
      disableMapRole: true,
      targets: ["three"],
      mapArgs: "file:args.json",
      mapCommand: "echo $TKM_MAP_ARGS",
    })
      .expectCommandToSucceed([`{"hello":"world"}\n`])
      .assert())

  test("Simple map command with map args from a .yml file", () =>
    executeRunTargetsCommand({
      projectDir,
      disableMapRole: true,
      targets: ["three"],
      mapArgs: "file:my-dir/args.yml",
      mapCommand: "echo $TKM_MAP_ARGS",
    })
      .expectCommandToSucceed([`{"name":"James Bond","age":44}\n`])
      .assert())

  test("JS map command with map args of type string", () =>
    executeRunTargetsCommand({
      projectDir,
      disableMapRole: true,
      targets: ["three"],
      mapArgs: "nothing-to-see-here",
      mapCommand: "js:get-args.js",
    })
      .expectCommandToSucceed(["nothing-to-see-here"])
      .assert())

  test("JS map command with map args from a .txt file", () =>
    executeRunTargetsCommand({
      projectDir,
      disableMapRole: true,
      targets: ["three"],
      mapArgs: "file:message.txt",
      mapCommand: "js:get-args.js",
    })
      .expectCommandToSucceed(["Rick and Morty rules!"])
      .assert())

  test("JS map command with map args from a .json file", () =>
    executeRunTargetsCommand({
      projectDir,
      disableMapRole: true,
      targets: ["three"],
      mapArgs: "file:args.json",
      mapCommand: "js:get-args.js",
    })
      .expectCommandToSucceed([{ hello: "world" }])
      .assert())

  test("JS map command with map args from a .yml file", () =>
    executeRunTargetsCommand({
      projectDir,
      disableMapRole: true,
      targets: ["three"],
      mapArgs: "file:my-dir/args.yml",
      mapCommand: "js:get-args.js",
    })
      .expectCommandToSucceed([{ name: "James Bond", age: 44 }])
      .assert())

  test(
    "Simple map command with deployment role and disable map role option",
    withReservation(async ({ credentials }) => {
      const { accountId } = await aws.sts.getCallerIdentity(credentials)
      return executeRunTargetsCommand({
        projectDir,
        targets: ["one"],
        disableMapRole: true,
        mapCommand:
          "aws sts get-caller-identity --query Account --output text --region eu-central-1",
      })
        .expectCommandToSucceed([`${accountId}\n`])
        .assert()
    }),
  )

  test("Simple map command with capture last line", () =>
    executeRunTargetsCommand({
      projectDir,
      targets: ["one"],
      captureLastLine: true,
      mapCommand: "cat sample.txt",
    })
      .expectCommandToSucceed(["ten\n"])
      .assert())

  test("Simple map command with capture after line", () =>
    executeRunTargetsCommand({
      projectDir,
      targets: ["one"],
      captureAfterLine: "seven",
      mapCommand: "cat sample.txt",
    })
      .expectCommandToSucceed(["eight\nnine\nten\n"])
      .assert())

  test("Simple map command with capture before line", () =>
    executeRunTargetsCommand({
      projectDir,
      targets: ["one"],
      captureBeforeLine: "four",
      mapCommand: "cat sample.txt",
    })
      .expectCommandToSucceed(["one\ntwo\nthree\n"])
      .assert())

  test("Simple map command with capture between lines", () =>
    executeRunTargetsCommand({
      projectDir,
      targets: ["one"],
      captureAfterLine: "two",
      captureBeforeLine: "six",
      mapCommand: "cat sample.txt",
    })
      .expectCommandToSucceed(["three\nfour\nfive\n"])
      .assert())

  test(
    "JS map command with deployment role",
    withReservation(({ accountIds }) =>
      executeRunTargetsCommand({
        projectDir,
        targets: ["one"],
        mapCommand: "js:get-caller-identity.js",
      })
        .expectCommandToSucceed([accountIds[0]])
        .assert(),
    ),
  )

  test(
    "JS map command without deployment role",
    withReservation(async ({ credentials }) => {
      const { accountId } = await aws.sts.getCallerIdentity(credentials)
      return executeRunTargetsCommand({
        projectDir,
        targets: ["three"],
        mapCommand: "js:get-caller-identity.js",
      })
        .expectCommandToSucceed([accountId])
        .assert()
    }),
  )

  test(
    "JS map command with deployment role and disable map role option",
    withReservation(async ({ credentials }) => {
      const { accountId } = await aws.sts.getCallerIdentity(credentials)
      return executeRunTargetsCommand({
        projectDir,
        targets: ["one"],
        disableMapRole: true,
        mapCommand: "js:get-caller-identity.js",
      })
        .expectCommandToSucceed([accountId])
        .assert()
    }),
  )

  test(
    "Simple reduce command",
    withReservation(async ({ credentials }) => {
      const { accountId } = await aws.sts.getCallerIdentity(credentials)
      return executeRunTargetsCommand({
        projectDir,
        targets: ["one"],
        disableMapRole: true,
        mapCommand: "echo hello",
        reduceCommand:
          "aws sts get-caller-identity --query Account --output text --region eu-central-1",
      })
        .expectCommandToSucceed(`${accountId}\n`)
        .assert()
    }),
  )

  test(
    "Simple reduce command with reduce role arn",
    withReservation(async ({ accountIds }) =>
      executeRunTargetsCommand({
        projectDir,
        targets: ["one"],
        disableMapRole: true,
        reduceRoleArn: `arn:aws:iam::${accountIds[0]}:role/OrganizationAccountAccessRole`,
        mapCommand: "echo hello",
        reduceCommand:
          "aws sts get-caller-identity --query Account --output text --region eu-central-1",
      })
        .expectCommandToSucceed(`${accountIds[0]}\n`)
        .assert(),
    ),
  )

  test(
    "JS reduce command",
    withReservation(async ({ credentials }) => {
      const { accountId } = await aws.sts.getCallerIdentity(credentials)
      return executeRunTargetsCommand({
        projectDir,
        targets: ["one"],
        disableMapRole: true,
        mapCommand: "echo hello",
        reduceCommand: "js:get-caller-identity.js",
      })
        .expectCommandToSucceed(accountId)
        .assert()
    }),
  )

  test(
    "JS reduce command with reduce role arn",
    withReservation(async ({ accountIds }) =>
      executeRunTargetsCommand({
        projectDir,
        targets: ["one"],
        disableMapRole: true,
        reduceRoleArn: `arn:aws:iam::${accountIds[0]}:role/OrganizationAccountAccessRole`,
        mapCommand: "echo hello",
        reduceCommand: "js:get-caller-identity.js",
      })
        .expectCommandToSucceed(accountIds[0])
        .assert(),
    ),
  )

  test("JS reduce command that joins target results", () =>
    executeRunTargetsCommand({
      projectDir,
      disableMapRole: true,
      mapCommand: "js:get-target-name.js",
      reduceCommand: "js:join.js",
    })
      .expectCommandToSucceed("five,four,one,three,two")
      .assert())

  test("Simple reduce command that prints target results json", () =>
    executeRunTargetsCommand({
      projectDir,
      disableMapRole: true,
      mapCommand: "js:get-target-name.js",
      reduceCommand: "echo $TKM_TARGET_RESULTS_JSON",
    })
      .expectCommandToSucceed('["one","two","five","four","three"]\n')
      .assert())
})
