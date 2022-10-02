import { Hook, HookInput, HookOutput } from "@takomo/stacks-model"
import { uuid } from "@takomo/util"

interface PutToS3HookProps {
  readonly bucket: string
  readonly key: string
  readonly content: unknown
  readonly role?: string
  readonly region?: string
}

export class PutToS3Hook implements Hook {
  readonly bucket: string
  readonly key: string
  readonly content: string
  readonly role?: string
  readonly region?: string

  constructor({ bucket, key, content, role, region }: PutToS3HookProps) {
    this.bucket = bucket
    this.key = key
    this.content =
      typeof content === "string" ? content : JSON.stringify(content)
    this.role = role
    this.region = region
  }

  async execute({ ctx, logger, stack }: HookInput): Promise<HookOutput> {
    const crManager = this.role
      ? await ctx.credentialManager.createCredentialManagerForRole(this.role)
      : stack.credentialManager

    const s3Client = await ctx.awsClientProvider.createS3Client({
      logger,
      credentialProvider: crManager.getCredentialProvider(),
      id: uuid(),
      region: this.region ?? stack.region,
    })

    return s3Client
      .putObject(this.bucket, this.key, this.content)
      .then((response) => ({ success: response }))
      .catch((error) => {
        logger.error(`Failed to write to bucket ${this.bucket}`, error)
        return { success: false, error }
      })
  }
}
