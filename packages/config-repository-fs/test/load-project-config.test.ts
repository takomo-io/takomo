import {
  defaultFeatures,
  DEFAULT_REGIONS,
  InternalTakomoProjectConfig,
} from "@takomo/core"
import { FilePath } from "@takomo/util"
import { join } from "path"
import { loadProjectConfig } from "../src/project/config"

const projectDir = `${process.cwd()}/test`

const doLoadProjectConfig = (
  pathToFile: FilePath,
): Promise<InternalTakomoProjectConfig> =>
  loadProjectConfig(projectDir, `${process.cwd()}/test/${pathToFile}`, {})

describe("#loadProjectConfig", () => {
  test("with empty file", async () => {
    const config = await doLoadProjectConfig("project-config-01.yml")
    expect(config).toStrictEqual({
      requiredVersion: undefined,
      organization: undefined,
      deploymentTargets: undefined,
      regions: DEFAULT_REGIONS,
      resolvers: [],
      helpers: [],
      helpersDir: [],
      varFiles: [],
      features: defaultFeatures(),
    })
  })

  test("with a single region", async () => {
    const config = await doLoadProjectConfig("project-config-02.yml")
    expect(config).toStrictEqual({
      requiredVersion: undefined,
      organization: undefined,
      deploymentTargets: undefined,
      regions: ["eu-west-1"],
      resolvers: [],
      helpers: [],
      helpersDir: [],
      varFiles: [],
      features: defaultFeatures(),
    })
  })

  test("with multiple regions", async () => {
    const config = await doLoadProjectConfig("project-config-03.yml")
    expect(config).toStrictEqual({
      requiredVersion: undefined,
      organization: undefined,
      deploymentTargets: undefined,
      regions: ["eu-central-1", "eu-north-1", "us-east-1"],
      resolvers: [],
      helpers: [],
      helpersDir: [],
      varFiles: [],
      features: defaultFeatures(),
    })
  })

  test("with resolvers", async () => {
    const config = await doLoadProjectConfig("project-config-04.yml")
    expect(config).toStrictEqual({
      requiredVersion: undefined,
      organization: undefined,
      deploymentTargets: undefined,
      regions: ["eu-central-1", "us-east-1"],
      helpers: [],
      helpersDir: [],
      varFiles: [],
      features: defaultFeatures(),
      resolvers: [
        {
          package: "@takomo/my-example-resolver",
        },
        {
          package: "another-resolver",
          name: undefined,
        },
        {
          package: "another-resolver-v2",
          name: "a-better-name",
        },
      ],
    })
  })

  test("with helpers", async () => {
    const config = await doLoadProjectConfig("project-config-05.yml")
    expect(config).toStrictEqual({
      requiredVersion: undefined,
      organization: undefined,
      deploymentTargets: undefined,
      regions: ["eu-central-1", "us-east-1"],
      resolvers: [],
      varFiles: [],
      features: defaultFeatures(),
      helpers: [
        {
          package: "@takomo/my-example-helper",
        },
        {
          package: "another-helper",
          name: undefined,
        },
        {
          package: "another-helper-v2",
          name: "a-better-name",
        },
      ],
      helpersDir: [],
    })
  })

  test("with var files", async () => {
    const config = await doLoadProjectConfig("project-config-06.yml")
    expect(config).toStrictEqual({
      requiredVersion: undefined,
      organization: undefined,
      deploymentTargets: undefined,
      regions: DEFAULT_REGIONS,
      resolvers: [],
      helpers: [],
      helpersDir: [],
      varFiles: [join(projectDir, "file1.json"), join(projectDir, "file2.yml")],
      features: defaultFeatures(),
    })
  })

  test("with helper dirs", async () => {
    const config = await doLoadProjectConfig("project-config-07.yml")
    expect(config).toStrictEqual({
      requiredVersion: undefined,
      organization: undefined,
      deploymentTargets: undefined,
      regions: DEFAULT_REGIONS,
      resolvers: [],
      helpers: [],
      helpersDir: ["/tmp/custom"],
      varFiles: [],
      features: defaultFeatures(),
    })
  })

  test("with extends", async () => {
    const config = await doLoadProjectConfig("project-config-08.yml")
    expect(config).toStrictEqual({
      requiredVersion: ">1.0.0",
      organization: undefined,
      deploymentTargets: undefined,
      regions: ["eu-central-1", "eu-west-1", "us-east-1"],
      resolvers: [],
      helpers: [],
      helpersDir: [join(projectDir, "my-helpers")],
      varFiles: [],
      features: defaultFeatures(),
    })
  })
})
