import { executeRunTargetsCommand } from "../../src/commands/targets/run-targets.js"
import { withSingleAccountReservation } from "../../src/reservations.js"

const projectDir = `${process.cwd()}/integration-test/configs/deployment-targets/run-with-typescript`

describe("Run", () => {
  test(
    "Map and reduce with Typescript",
    withSingleAccountReservation(({ accountId }) =>
      executeRunTargetsCommand({
        projectDir,
        mapCommand: "ts:./map.ts",
        reduceCommand: "ts:./reduce.ts",
      })
        .expectCommandToSucceed((result: any) => {
          expect(result).toStrictEqual(`${accountId}=I like beer`)
        })
        .assert(),
    ),
  )
})
