import { uuid } from "../../../../../utils/strings.js"
import { StackOperationStep } from "../../../common/steps.js"
import { TemplateBodyHolder } from "../states.js"

const buildTemplateS3Url = (
  bucketName: string,
  key: string,
  location?: string,
): string => {
  const locationPart = location !== "us-east-1" ? `${location}.` : ""
  return `https://${bucketName}.s3.${locationPart}amazonaws.com/${key}`
}

export const uploadTemplate: StackOperationStep<TemplateBodyHolder> = async (
  state,
) => {
  const { stack, templateBody, logger, transitions, ctx } = state

  const templateBucket = stack.templateBucket

  if (!templateBucket) {
    logger.debug("No template bucket configured")
    return transitions.validateTemplate(state)
  }

  logger.debugObject("Template bucket configured:", () => templateBucket)

  const s3Client = await ctx.awsClientProvider.createS3Client({
    credentialProvider: stack.credentialManager.getCredentialProvider(),
    region: stack.region,
    id: uuid(),
    logger,
  })

  const location = await s3Client.getBucketLocation(templateBucket.name)

  // S3 client needs to be in the same region as the bucket is
  const uploadClient =
    location === stack.region
      ? s3Client
      : await ctx.awsClientProvider.createS3Client({
          credentialProvider: stack.credentialManager.getCredentialProvider(),
          region: location,
          id: uuid(),
          logger,
        })

  const key = `${templateBucket.keyPrefix ?? ""}${stack.name}-${Date.now()}.yml`
  const templateS3Url = buildTemplateS3Url(templateBucket.name, key, location)

  logger.debug(`Upload template to: ${templateS3Url}`)
  await uploadClient.putObject(templateBucket.name, key, templateBody)

  return transitions.validateTemplate({ ...state, templateS3Url })
}
