import { buildDeploymentConfig } from "../../../src/takomo-stacks-context/config/build-standard-stack.js"
import { createStackConfig, createStackGroup } from "../helpers.js"

describe("#buildDeploymentConfig", () => {
  test("no deployment config", () => {
    const stackGroup = createStackGroup()
    const stackConfig = createStackConfig()
    const blueprint = undefined

    expect(
      buildDeploymentConfig({ stackGroup, stackConfig, blueprint }),
    ).toStrictEqual({ mode: "STANDARD", disableRollback: false })
  })

  test("deployment config defined in stack group", () => {
    const stackGroup = createStackGroup({
      deploymentConfig: { mode: "EXPRESS", disableRollback: true },
    })
    const stackConfig = createStackConfig()
    const blueprint = undefined

    expect(
      buildDeploymentConfig({ stackGroup, stackConfig, blueprint }),
    ).toStrictEqual({ mode: "EXPRESS", disableRollback: true })
  })

  test("deployment config defined in blueprint", () => {
    const stackGroup = createStackGroup()
    const stackConfig = createStackConfig()
    const blueprint = createStackConfig({
      deploymentConfig: { mode: "EXPRESS" },
    })

    expect(
      buildDeploymentConfig({ stackGroup, stackConfig, blueprint }),
    ).toStrictEqual({ mode: "EXPRESS", disableRollback: false })
  })

  test("deployment config defined in stack config", () => {
    const stackGroup = createStackGroup()
    const stackConfig = createStackConfig({
      deploymentConfig: { disableRollback: true },
    })
    const blueprint = createStackConfig()

    expect(
      buildDeploymentConfig({ stackGroup, stackConfig, blueprint }),
    ).toStrictEqual({ mode: "STANDARD", disableRollback: true })
  })

  test("stack config overrides blueprint and stack group", () => {
    const stackGroup = createStackGroup({
      deploymentConfig: { mode: "STANDARD", disableRollback: false },
    })
    const stackConfig = createStackConfig({
      deploymentConfig: { mode: "EXPRESS", disableRollback: true },
    })
    const blueprint = createStackConfig({
      deploymentConfig: { mode: "STANDARD", disableRollback: false },
    })

    expect(
      buildDeploymentConfig({ stackGroup, stackConfig, blueprint }),
    ).toStrictEqual({ mode: "EXPRESS", disableRollback: true })
  })

  test("blueprint overrides stack group", () => {
    const stackGroup = createStackGroup({
      deploymentConfig: { mode: "EXPRESS", disableRollback: true },
    })
    const stackConfig = createStackConfig()
    const blueprint = createStackConfig({
      deploymentConfig: { mode: "STANDARD", disableRollback: false },
    })

    expect(
      buildDeploymentConfig({ stackGroup, stackConfig, blueprint }),
    ).toStrictEqual({ mode: "STANDARD", disableRollback: false })
  })

  test("properties are resolved individually", () => {
    const stackGroup = createStackGroup({
      deploymentConfig: { mode: "EXPRESS" },
    })
    const stackConfig = createStackConfig({
      deploymentConfig: { disableRollback: true },
    })
    const blueprint = undefined

    expect(
      buildDeploymentConfig({ stackGroup, stackConfig, blueprint }),
    ).toStrictEqual({ mode: "EXPRESS", disableRollback: true })
  })

  test("explicit false in stack config overrides true in stack group", () => {
    const stackGroup = createStackGroup({
      deploymentConfig: { disableRollback: true },
    })
    const stackConfig = createStackConfig({
      deploymentConfig: { disableRollback: false },
    })
    const blueprint = undefined

    expect(
      buildDeploymentConfig({ stackGroup, stackConfig, blueprint }),
    ).toStrictEqual({ mode: "STANDARD", disableRollback: false })
  })
})
