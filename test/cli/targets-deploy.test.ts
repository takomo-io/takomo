import { executors, targetOperations } from "./helpers.js"

const { expectSuccess } = executors("targets deploy")

const successCases = [...targetOperations]

describe("tkm targets deploy", () => {
  test.each(successCases)("success %#", async (cmd) => await expectSuccess(cmd))
})
