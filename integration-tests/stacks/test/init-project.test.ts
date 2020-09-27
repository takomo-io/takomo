import { initOptionsAndVariables } from "@takomo/cli"
import { CommandStatus, Constants } from "@takomo/core"
import { initProjectCommand } from "@takomo/init-command"
import { TestInitProjectIO } from "@takomo/test"
import {
  dirExists,
  fileExists,
  parseYamlFile,
  readFileContents,
} from "@takomo/util"
import mkdirp from "mkdirp"
import rimfaf from "rimraf"
import uuid from "uuid"

const tmpPath = `/tmp/takomo-tests/${uuid.v4()}`

const createOptions = async (dir: string) =>
  initOptionsAndVariables({
    log: "info",
    yes: true,
    dir,
  })

const cleanTmpDir = async (): Promise<boolean> =>
  new Promise((resolve, reject) => {
    rimfaf(`${tmpPath}/*`, (err) => {
      if (err) reject(err)
      else resolve(true)
    })
  })

const makeDir = async (dir: string): Promise<string> =>
  mkdirp(dir).then(() => dir)

const createTmpDir = async (): Promise<string> => makeDir(tmpPath)

beforeAll(createTmpDir)
afterAll(cleanTmpDir)

const assertCreatedFiles = async (
  dir: string,
  project: string,
  regions: string | string[],
  createSamples = false,
): Promise<string> => {
  expect(await dirExists(dir)).toBeTruthy()

  expect(await dirExists(`${dir}/stacks`)).toBeTruthy()
  expect(await dirExists(`${dir}/templates`)).toBeTruthy()
  expect(await dirExists(`${dir}/resolvers`)).toBeTruthy()
  expect(await dirExists(`${dir}/helpers`)).toBeTruthy()
  expect(await dirExists(`${dir}/partials`)).toBeTruthy()

  expect(await fileExists(`${dir}/stacks/config.yml`)).toBeTruthy()

  const parsedFile = await parseYamlFile(`${dir}/stacks/config.yml`)
  expect(parsedFile.project).toBe(project)
  expect(parsedFile.regions).toStrictEqual(regions)

  if (createSamples) {
    expect(await fileExists(`${dir}/stacks/vpc.yml`)).toBeTruthy()
    expect(await fileExists(`${dir}/templates/vpc.yml`)).toBeTruthy()

    const sampleStackConfig = await readFileContents(`${dir}/stacks/vpc.yml`)
    expect(sampleStackConfig).toBe(`# Takomo sample VPC stack configuration.
# The corresponding CloudFormation template can be found from templates/vpc.yml
regions: eu-west-1
parameters:
  CidrBlock: 10.0.0.0/24
`)

    const sampleStackTemplate = await readFileContents(
      `${dir}/templates/vpc.yml`,
    )

    expect(sampleStackTemplate).toBe(`# Takomo sample VPC template
# The corresponding stack config file can be found from stacks/vpc.yml
Description: Takomo sample VPC
Parameters:
  CidrBlock:
    Type: String
    Description: VPC CIDR block
Resources:
  VPC:
    Type: AWS::EC2::VPC
    Properties:
      CidrBlock: !Ref CidrBlock
`)
  }

  return dir
}

const takomoDirs = [
  Constants.STACKS_DIR,
  Constants.TEMPLATES_DIR,
  Constants.RESOLVERS_DIR,
  Constants.HOOKS_DIR,
  Constants.PARTIALS_DIR,
  Constants.HELPERS_DIR,
]

describe("Init project", () => {
  test("with project and a single region given from command line", async () => {
    const dir = await makeDir(`${tmpPath}/a`)
    const { options, variables, watch } = await createOptions(dir)
    const result = await initProjectCommand(
      {
        options,
        variables,
        watch,
        createSamples: false,
        project: "MyProject",
        regions: ["eu-west-1"],
      },
      new TestInitProjectIO(options),
    )

    expect(result.success).toBeTruthy()
    expect(result.status).toBe(CommandStatus.SUCCESS)

    await assertCreatedFiles(result.projectDir, "MyProject", "eu-west-1")
  })

  test("with project and two regions given from command line", async () => {
    const dir = await makeDir(`${tmpPath}/b`)
    const { options, variables, watch } = await createOptions(dir)
    const result = await initProjectCommand(
      {
        options,
        variables,
        watch,
        createSamples: false,
        project: "Foo",
        regions: ["us-east-1", "eu-north-1"],
      },
      new TestInitProjectIO(options),
    )

    expect(result.success).toBeTruthy()
    expect(result.status).toBe(CommandStatus.SUCCESS)

    await assertCreatedFiles(result.projectDir, "Foo", [
      "us-east-1",
      "eu-north-1",
    ])
  })

  test("with project, region and create samples given from command line", async () => {
    const dir = await makeDir(`${tmpPath}/c`)
    const { options, variables, watch } = await createOptions(dir)
    const result = await initProjectCommand(
      {
        options,
        variables,
        watch,
        createSamples: true,
        project: "test",
        regions: ["eu-central-1"],
      },
      new TestInitProjectIO(options),
    )

    expect(result.success).toBeTruthy()
    expect(result.status).toBe(CommandStatus.SUCCESS)

    await assertCreatedFiles(result.projectDir, "test", "eu-central-1", true)
  })

  test.each(takomoDirs)(
    "fails when '%s' dir already exists",
    async (takomoDir) => {
      const dir = await makeDir(`${tmpPath}/${uuid.v4()}`)
      const { options, variables, watch } = await createOptions(dir)
      await makeDir(`${dir}/${takomoDir}`)
      const initProject = async () =>
        initProjectCommand(
          {
            options,
            variables,
            watch,
            createSamples: false,
            project: "test",
            regions: ["eu-central-1"],
          },
          new TestInitProjectIO(options),
        )

      await expect(initProject).rejects.toThrow(
        `Could not initialize a new project in directory: ${dir}. Following directories already exists in the target directory:\n\n  - ${takomoDir}`,
      )
    },
  )
})
