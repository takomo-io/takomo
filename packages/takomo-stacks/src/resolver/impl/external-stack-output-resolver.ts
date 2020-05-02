import { CloudFormationClient } from "@takomo/aws-clients"
import { CommandRole, IamRoleArn, Region, StackPath } from "@takomo/core"
import { Resolver, ResolverInput } from "../model"

export class ExternalStackOutputResolver implements Resolver {
  private readonly stack: string
  private readonly output: string
  private readonly region: Region | null
  private readonly commandRole: CommandRole | null
  private readonly iamRoleArns: IamRoleArn[] = []

  constructor(props: any) {
    this.stack = props.stack
    this.output = props.output
    this.region = props.region
    this.commandRole = props.commandRole
      ? { iamRoleArn: props.commandRole }
      : null
    this.iamRoleArns = this.commandRole ? [this.commandRole.iamRoleArn] : []
  }

  isConfidential = (): boolean => false

  getDependencies = (): StackPath[] => []

  getIamRoleArns = (): IamRoleArn[] => this.iamRoleArns

  resolve = async ({
    ctx,
    stack,
    logger,
    parameterName,
  }: ResolverInput): Promise<string> => {
    const credentialProvider = this.commandRole
      ? await ctx
          .getCredentialProvider()
          .createCredentialProviderForRole(this.commandRole.iamRoleArn)
      : stack.getCredentialProvider()

    const region = this.region || stack.getRegion()
    logger.debugObject(
      `Resolving value for parameter '${parameterName}' using external-stack-output resolver:`,
      { stack: this.stack, region, output: this.output },
    )

    const cf = new CloudFormationClient({
      credentialProvider,
      region,
      logger,
    })

    const cfStack = await cf.describeStack(this.stack)
    if (!cfStack) {
      throw new Error(`No such stack: ${this.stack}`)
    }

    const value = cfStack.Outputs!.find((o) => o.OutputKey === this.output)
    if (!value) {
      throw new Error(
        `Stack ${this.stack} does not have output: ${this.output}`,
      )
    }

    return value.OutputValue!
  }
}
