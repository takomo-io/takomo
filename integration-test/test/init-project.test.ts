import tmp from "tmp"
import { dirExists, fileExists, readFileContents } from "../../src/utils/files"
import { parseYamlFile } from "../../src/utils/yaml"
import { executeInitProjectCommand } from "../src/commands/init"

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

const createTempDir = (): string => tmp.dirSync({ unsafeCleanup: true }).name

describe("Init project", () => {
  test("with project and a single region given from command line", async () => {
    const projectDir = createTempDir()
    await executeInitProjectCommand({
      projectDir,
      createSamples: false,
      project: "MyProject",
      regions: ["eu-west-1"],
    })
      .expectOutputToBeSuccessful()
      .assert()

    await assertCreatedFiles(projectDir, "MyProject", "eu-west-1")
  })

  test("with project and two regions given from command line", async () => {
    const projectDir = createTempDir()
    await executeInitProjectCommand({
      projectDir,
      createSamples: false,
      project: "Foo",
      regions: ["us-east-1", "eu-north-1"],
    })
      .expectOutputToBeSuccessful()
      .assert()

    await assertCreatedFiles(projectDir, "Foo", ["us-east-1", "eu-north-1"])
  })

  test("with project, region and create samples given from command line", async () => {
    const projectDir = createTempDir()
    await executeInitProjectCommand({
      projectDir,
      createSamples: true,
      project: "test",
      regions: ["eu-central-1"],
    })
      .expectOutputToBeSuccessful()
      .assert()

    await assertCreatedFiles(projectDir, "test", "eu-central-1", true)
  })
})
