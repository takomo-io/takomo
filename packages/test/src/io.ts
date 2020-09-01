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

interface TestDeployStacksIOAnswers {
  confirmDeploy: ConfirmDeployAnswer
  confirmStackDeploy: ConfirmStackDeployAnswer
}

export class TestDeployStacksIO extends CliDeployStacksIO {
  readonly #answers: TestDeployStacksIOAnswers
  constructor(options: Options, answers?: TestDeployStacksIOAnswers) {
    super(options)
    this.#answers = answers || {
      confirmDeploy: ConfirmDeployAnswer.CANCEL,
      confirmStackDeploy: ConfirmStackDeployAnswer.CANCEL,
    }
  }

  confirmDeploy = async (): Promise<ConfirmDeployAnswer> =>
    this.options.isAutoConfirmEnabled()
      ? ConfirmDeployAnswer.CONTINUE_NO_REVIEW
      : this.#answers.confirmDeploy

  confirmStackDeploy = async (): Promise<ConfirmStackDeployAnswer> =>
    this.options.isAutoConfirmEnabled()
      ? ConfirmStackDeployAnswer.CONTINUE
      : this.#answers.confirmStackDeploy
}

interface TestUndeployStacksIOAnswers {
  confirmUndeploy: ConfirmUndeployAnswer
}

export class TestUndeployStacksIO extends CliUndeployStacksIO {
  readonly #answers: TestUndeployStacksIOAnswers
  constructor(options: Options, answers?: TestUndeployStacksIOAnswers) {
    super(options)
    this.#answers = answers || {
      confirmUndeploy: ConfirmUndeployAnswer.CANCEL,
    }
  }

  confirmUndeploy = async (): Promise<ConfirmUndeployAnswer> =>
    this.options.isAutoConfirmEnabled()
      ? ConfirmUndeployAnswer.CONTINUE
      : this.#answers.confirmUndeploy
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
