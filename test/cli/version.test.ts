import { expectSuccess } from "./helpers"

describe("tkm --version", () => {
  it("should print the current version", () => expectSuccess("--version"))
})
