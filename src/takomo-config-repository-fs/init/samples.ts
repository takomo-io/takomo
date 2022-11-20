import path from "path"
import { createFile, FilePath } from "../../utils/files"

const vpcStackConfig = `# Takomo sample VPC stack configuration.
# The corresponding CloudFormation template can be found from templates/vpc.yml
regions: eu-west-1
parameters:
  CidrBlock: 10.0.0.0/24
`

const vpcStackTemplate = `# Takomo sample VPC template
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
`

export const createSampleFiles = async (
  stacksDir: FilePath,
  templatesDir: FilePath,
): Promise<void> => {
  const pathToStackConfig = path.join(stacksDir, "vpc.yml")
  const pathToStackTemplate = path.join(templatesDir, "vpc.yml")
  await createFile(pathToStackConfig, vpcStackConfig)
  await createFile(pathToStackTemplate, vpcStackTemplate)
}
