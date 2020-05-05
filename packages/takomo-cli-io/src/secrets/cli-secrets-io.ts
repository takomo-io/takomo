import { Secret, StackSecretsDiff } from "@takomo/stacks"
import { green, red } from "@takomo/util"
import CliIO from "../cli-io"

export enum SecretOperation {
  ADD,
  REMOVE,
}

const operationSymbol = (operation: SecretOperation | undefined): string => {
  switch (operation) {
    case SecretOperation.ADD:
      return `${green("+")} `
    case SecretOperation.REMOVE:
      return `${red("-")} `
    default:
      return ""
  }
}

export class CliSecretsIo extends CliIO {
  printSecret = (
    secret: Secret,
    operation: SecretOperation | undefined = undefined,
  ): void => {
    this.message(`  ${operationSymbol(operation)}${secret.name}`, true)
    this.message(`    parameter name: ${secret.ssmParameterName}`)
    this.message(`    description:    ${secret.description}`)
  }

  printSecretsDiff = (stacks: StackSecretsDiff[]): void =>
    stacks.forEach((diff) => {
      if (diff.add.length === 0 && diff.remove.length === 0) {
        return
      }

      this.message(diff.stack.getPath(), true)
      diff.add.forEach((s) => {
        this.printSecret(s, SecretOperation.ADD)
      })
      diff.remove.forEach((s) => {
        this.printSecret(s, SecretOperation.REMOVE)
      })
    })
}
