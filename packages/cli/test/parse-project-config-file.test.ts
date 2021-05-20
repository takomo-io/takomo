import { defaultFeatures } from "@takomo/core"
import { FilePath } from "@takomo/util"
import { parseProjectConfigFile } from "../src/config"
import { DEFAULT_REGIONS } from "../src/constants"

const doParseProjectConfigFile = (pathToFile: FilePath): any =>
  parseProjectConfigFile(`${process.cwd()}/test/${pathToFile}`, {})

describe("#parseProjectConfigFile", () => {
  test("with empty file", async () => {
    const config = await doParseProjectConfigFile("project-config-01.yml")
    expect(config).toStrictEqual({
      requiredVersion: undefined,
      organization: undefined,
      deploymentTargets: undefined,
      regions: DEFAULT_REGIONS,
      resolvers: [],
      helpers: [],
      features: defaultFeatures(),
    })
  })

  test("with a single region", async () => {
    const config = await doParseProjectConfigFile("project-config-02.yml")
    expect(config).toStrictEqual({
      requiredVersion: undefined,
      organization: undefined,
      deploymentTargets: undefined,
      regions: ["eu-west-1"],
      resolvers: [],
      helpers: [],
      features: defaultFeatures(),
    })
  })

  test("with multiple regions", async () => {
    const config = await doParseProjectConfigFile("project-config-03.yml")
    expect(config).toStrictEqual({
      requiredVersion: undefined,
      organization: undefined,
      deploymentTargets: undefined,
      regions: ["eu-central-1", "eu-north-1", "us-east-1"],
      resolvers: [],
      helpers: [],
      features: defaultFeatures(),
    })
  })

  test("with resolvers", async () => {
    const config = await doParseProjectConfigFile("project-config-04.yml")
    expect(config).toStrictEqual({
      requiredVersion: undefined,
      organization: undefined,
      deploymentTargets: undefined,
      regions: ["eu-central-1", "us-east-1"],
      helpers: [],
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
    const config = await doParseProjectConfigFile("project-config-05.yml")
    expect(config).toStrictEqual({
      requiredVersion: undefined,
      organization: undefined,
      deploymentTargets: undefined,
      regions: ["eu-central-1", "us-east-1"],
      resolvers: [],
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
    })
  })
})
