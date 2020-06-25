import {
  CliDeployStacksIO,
  CliListSecretsIO,
  CliSetSecretIO,
  CliUndeployStacksIO,
} from "@takomo/cli-io"
import { ConfirmResult, Options } from "@takomo/core"
import { Secret, SecretName, SecretValue } from "@takomo/stacks-model"

export class TestDeployStacksIO extends CliDeployStacksIO {
  constructor(options: Options) {
    super(options)
  }

  confirmDeploy = async (): Promise<ConfirmResult> => {
    return this.options.isAutoConfirmEnabled()
      ? ConfirmResult.YES
      : ConfirmResult.NO
  }

  confirmStackDeploy = async (): Promise<ConfirmResult> => {
    return this.options.isAutoConfirmEnabled()
      ? ConfirmResult.YES
      : ConfirmResult.NO
  }
}

export class TestUndeployStacksIO extends CliUndeployStacksIO {
  constructor(options: Options) {
    super(options)
  }

  confirmUndeploy = async (): Promise<ConfirmResult> => {
    return this.options.isAutoConfirmEnabled()
      ? ConfirmResult.YES
      : ConfirmResult.NO
  }
}

export class TestListSecretsIO extends CliListSecretsIO {}

export class TestSetSecretIO extends CliSetSecretIO {
  private readonly answers: Map<SecretName, SecretValue>

  constructor(options: Options, answers: Map<SecretName, SecretValue>) {
    super(options)
    this.answers = answers
  }

  promptSecretValue = async (secret: Secret): Promise<string> => {
    return this.answers.get(secret.name)!
  }
}
