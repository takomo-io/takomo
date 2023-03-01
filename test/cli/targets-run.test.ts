import { executors } from "./helpers.js"

const { expectFailure, expectSuccess } = executors("targets run")

const failures = [["", "Missing required argument: map"]]

const successCases = [
  "--map 'echo hello'",
  "--map 'echo hello' --output text",
  "--map 'echo hello' --output yaml",
  "--map 'echo hello' --output json",
  "--map 'echo hello' --capture-last-line",
  "--map 'echo hello' --capture-after yyy",
  "--map 'echo hello' --capture-before xxx",
  "--map 'echo hello' --map-args world",
  "--map 'echo hello' --reduce 'echo x'",
  "--map js:ma.js --reduce js:re.js",
  "--map 'echo hello' --reduce-role-arn arn:aws:iam::123456789012:role/admin",
  "--map 'cat hello.txt' group1 group2",
  "--map 'echo hello' --concurrent-targets 2",
  "--map 'echo hello' --label example",
  "--map 'echo hello' --label example --label another",
  "--map 'echo hello' --exclude-label example",
  "--map 'echo hello' --target example",
  "--map 'echo hello' --config-file cfg.yml",
  "--map 'echo hello' --disable-map-role",
  "--map 'echo hello' --exclude-target example",
]

describe("tkm targets run", () => {
  test.each(failures)("failure %#", expectFailure)
  test.each(successCases)("success %#", expectSuccess)
})
