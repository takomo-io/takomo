import { expectSuccess } from "./helpers.js"

describe("tkm --version", () => {
  it("should print the current version", () => expectSuccess("--version"))
})
