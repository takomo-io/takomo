import {
  CliDeployStacksIO,
  CliInitProjectIO,
  CliListSecretsIO,
  CliSetSecretIO,
  CliUndeployStacksIO,
} from "@takomo/cli-io"
import { Options } from "@takomo/core"
import {
  ConfirmDeployAnswer,
  ConfirmStackDeployAnswer,
  ConfirmUndeployAnswer,
} from "@takomo/stacks-commands"
import { Secret, SecretName, SecretValue } from "@takomo/stacks-model"

export class TestDeployStacksIO extends CliDeployStacksIO {
  constructor(options: Options) {
    super(options)
  }

  confirmDeploy = async (): Promise<ConfirmDeployAnswer> =>
    this.options.isAutoConfirmEnabled()
      ? ConfirmDeployAnswer.CONTINUE_NO_REVIEW
      : ConfirmDeployAnswer.CANCEL

  confirmStackDeploy = async (): Promise<ConfirmStackDeployAnswer> =>
    this.options.isAutoConfirmEnabled()
      ? ConfirmStackDeployAnswer.CONTINUE
      : ConfirmStackDeployAnswer.CANCEL
}

export class TestUndeployStacksIO extends CliUndeployStacksIO {
  constructor(options: Options) {
    super(options)
  }

  confirmUndeploy = async (): Promise<ConfirmUndeployAnswer> =>
    this.options.isAutoConfirmEnabled()
      ? ConfirmUndeployAnswer.CONTINUE
      : ConfirmUndeployAnswer.CANCEL
}

export class TestListSecretsIO extends CliListSecretsIO {}

export class TestSetSecretIO extends CliSetSecretIO {
  private readonly answers: Map<SecretName, SecretValue>

  constructor(options: Options, answers: Map<SecretName, SecretValue>) {
    super(options)
    this.answers = answers
  }

  promptSecretValue = async (secret: Secret): Promise<string> =>
    this.answers.get(secret.name)!
}

export class TestInitProjectIO extends CliInitProjectIO {
  constructor(options: Options) {
    super(options)
  }
}
