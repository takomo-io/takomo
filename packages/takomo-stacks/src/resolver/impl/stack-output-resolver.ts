import { CloudFormationClient } from "@takomo/aws-clients"
import { IamRoleArn, StackPath } from "@takomo/core"
import { Resolver, ResolverInput } from "../model"

export class StackOutputResolver implements Resolver {
  private readonly stack: StackPath
  private readonly output: string
  private readonly dependencies: StackPath[]

  constructor(props: any) {
    this.stack = props.stack
    this.output = props.output
    this.dependencies = [this.stack]
  }

  isConfidential = (): boolean => false

  getDependencies = (): StackPath[] => this.dependencies

  getIamRoleArns = (): IamRoleArn[] => []

  resolve = async ({
    ctx,
    logger,
    parameterName,
  }: ResolverInput): Promise<string> => {
    logger.debugObject(
      `Resolving value for parameter '${parameterName}' using stack-output resolver:`,
      { stack: this.stack, output: this.output },
    )

    const [referencedStack, ...rest] = ctx.getStacksByPath(this.stack)

    if (!referencedStack) {
      // TODO: We should be able to detect this earlier - when the configuration is being built
      throw new Error(`Stack not found with path: ${this.stack}`)
    }

    if (rest.length > 0) {
      // TODO: We should be able to detect this earlier - when the configuration is being built
      throw new Error(`More than one stack found with path: ${this.stack}`)
    }

    const cf = new CloudFormationClient({
      credentialProvider: referencedStack.getCredentialProvider(),
      region: referencedStack.getRegion(),
      logger,
    })

    const cfStack = await cf.describeStack(referencedStack.getName())
    if (!cfStack) {
      throw new Error(`No such stack: ${referencedStack.getName()}`)
    }

    const value = cfStack.Outputs!.find((o) => o.OutputKey === this.output)
    if (!value) {
      throw new Error(
        `Stack ${referencedStack.getName()} does not have output ${
          this.output
        }`,
      )
    }

    return value.OutputValue!
  }
}
