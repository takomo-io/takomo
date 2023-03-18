import { executors, targetOperations } from "./helpers.js"

const { expectSuccess } = executors("targets undeploy")

const successCases = [...targetOperations]

describe("tkm targets undeploy", () => {
  test.each(successCases)("success %#", async (cmd) => expectSuccess(cmd))
})
