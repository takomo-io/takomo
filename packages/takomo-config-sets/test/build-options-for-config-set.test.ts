import { Options } from "@takomo/core"
import { LogLevel } from "@takomo/util"
import { buildOptionsForConfigSet } from "../src/fn"

const currentOptions = new Options({
  projectDir: "/tmp",
  stats: false,
  logLevel: LogLevel.INFO,
  logConfidentialInfo: false,
  autoConfirm: false,
})

describe("#buildOptionsForConfigSet returns correct Options object", () => {
  test("when the config set has no projectDir defined", () => {
    const options = buildOptionsForConfigSet(currentOptions, {
      commandPaths: ["/dev"],
      description: "My config set",
      name: "MyConfigSet",
      projectDir: null,
      vars: {},
    })

    expect(options.getProjectDir()).toBe(options.getProjectDir())
    expect(options.isAutoConfirmEnabled()).toBe(options.isAutoConfirmEnabled())
    expect(options.getLogLevel()).toBe(options.getLogLevel())
    expect(options.isConfidentialInfoLoggingEnabled()).toBe(
      options.isConfidentialInfoLoggingEnabled(),
    )
    expect(options.isStatsEnabled()).toBe(options.isStatsEnabled())
  })

  test("when the config set has absolute projectDir defined", () => {
    const options = buildOptionsForConfigSet(currentOptions, {
      commandPaths: ["/dev"],
      description: "My config set",
      name: "MyConfigSet",
      projectDir: "/vars/configs",
      vars: {},
    })

    expect(options.getProjectDir()).toBe("/vars/configs")
    expect(options.isAutoConfirmEnabled()).toBe(options.isAutoConfirmEnabled())
    expect(options.getLogLevel()).toBe(options.getLogLevel())
    expect(options.isConfidentialInfoLoggingEnabled()).toBe(
      options.isConfidentialInfoLoggingEnabled(),
    )
    expect(options.isStatsEnabled()).toBe(options.isStatsEnabled())
  })

  test("when the config set has relative projectDir defined", () => {
    const options = buildOptionsForConfigSet(currentOptions, {
      commandPaths: ["/dev"],
      description: "My config set",
      name: "MyConfigSet",
      projectDir: "files",
      vars: {},
    })

    expect(options.getProjectDir()).toBe("/tmp/files")
    expect(options.isAutoConfirmEnabled()).toBe(options.isAutoConfirmEnabled())
    expect(options.getLogLevel()).toBe(options.getLogLevel())
    expect(options.isConfidentialInfoLoggingEnabled()).toBe(
      options.isConfidentialInfoLoggingEnabled(),
    )
    expect(options.isStatsEnabled()).toBe(options.isStatsEnabled())
  })
})
