import { uuid } from "@takomo/util"
import { StackOperationStep } from "../../common/steps"
import { TemplateBodyHolder } from "../states"

export const uploadTemplate: StackOperationStep<TemplateBodyHolder> = async (
  state,
) => {
  const { stack, templateBody, logger, transitions, ctx } = state

  const templateBucket = stack.templateBucket

  if (!templateBucket) {
    logger.debug("No template bucket configured")
    return transitions.validateTemplate(state)
  }

  const key = `${templateBucket.keyPrefix || ""}${stack.name}-${Date.now()}.yml`
  const templateS3Url = `https://s3.amazonaws.com/${templateBucket.name}/${key}`

  logger.debugObject("Template bucket configured:", templateBucket)

  const credentials = await stack.credentialManager.getCredentials()

  const s3Client = ctx.awsClientProvider.createS3Client({
    credentials,
    region: stack.region,
    id: uuid(),
    logger,
  })

  logger.debug(`Upload template to: ${templateS3Url}`)
  await s3Client.putObject(templateBucket.name, key, templateBody)

  return transitions.validateTemplate({ ...state, templateS3Url })
}
