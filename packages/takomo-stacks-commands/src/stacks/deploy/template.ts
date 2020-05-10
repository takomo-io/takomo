import { S3Client } from "@takomo/aws-clients"
import { CommandStatus, Constants } from "@takomo/core"
import { StackResult } from "@takomo/stacks"
import { readFileContents, renderTemplate } from "@takomo/util"
import path from "path"
import { InitialLaunchContext, TemplateBodyHolder } from "./model"
import { validateTemplate } from "./validate"

export const uploadTemplate = async (
  holder: TemplateBodyHolder,
): Promise<StackResult> => {
  const { stack, templateBody, io, watch, logger } = holder

  const childWatch = watch.startChild("upload-template")
  const templateBucket = stack.getTemplateBucket()

  if (!templateBucket) {
    logger.debug("No template bucket configured")
    childWatch.stop()
    return validateTemplate({
      ...holder,
      templateS3Url: null,
    })
  }

  const key = `${
    templateBucket.keyPrefix || ""
  }${stack.getName()}-${Date.now()}.yml`
  const templateS3Url = `https://s3.amazonaws.com/${templateBucket.name}/${key}`

  logger.debugObject("Template bucket configured:", templateBucket)

  const s3Client = new S3Client({
    credentialProvider: stack.getCredentialProvider(),
    region: stack.getRegion(),
    logger: io,
  })

  logger.debug(`Upload template to: ${templateS3Url}`)

  try {
    await s3Client.putObject(templateBucket.name, key, templateBody)
    childWatch.stop()
    return validateTemplate({ ...holder, templateS3Url })
  } catch (e) {
    logger.error("Failed to upload template to S3", e)
    return {
      stack,
      message: e.message,
      reason: "TEMPLATE_UPLOAD_FAILED",
      status: CommandStatus.FAILED,
      events: [],
      success: false,
      watch: watch.stop(),
    }
  }
}

export const prepareCloudFormationTemplate = async (
  holder: InitialLaunchContext,
): Promise<StackResult> => {
  const { ctx, stack, watch, variables, logger } = holder
  logger.debug("Prepare CloudFormation template")
  const childWatch = watch.startChild("prepare-template")

  const stackVariables = {
    ...variables,
    stack: {
      project: stack.getProject(),
      path: stack.getPath(),
      name: stack.getName(),
      template: stack.getTemplate(),
      templateBucket: stack.getTemplateBucket(),
      commandRole: stack.getCommandRole(),
      region: stack.getRegion(),
      tags: stack.getTags(),
      timeout: stack.getTimeout(),
      depends: stack.getDependencies(),
      data: stack.getData(),
    },
  }

  const pathToTemplate = path.join(
    ctx.getOptions().getProjectDir(),
    Constants.TEMPLATES_DIR,
    stack.getTemplate(),
  )

  logger.debug(`Path to CloudFormation template: ${pathToTemplate}`)

  try {
    const content = await readFileContents(pathToTemplate)

    logger.traceText("Raw template body:", content)

    if (!pathToTemplate.endsWith(".hbs")) {
      childWatch.stop()
      return await uploadTemplate({
        ...holder,
        templateBody: content,
      })
    }

    logger.traceObject("Render template using variables:", stackVariables)

    const renderedContent = await renderTemplate(
      ctx.getTemplateEngine(),
      pathToTemplate,
      content,
      stackVariables,
    )

    logger.traceText("Final rendered template:", renderedContent)

    childWatch.stop()
    return uploadTemplate({
      ...holder,
      templateBody: renderedContent,
    })
  } catch (e) {
    logger.error("Failed to prepare template", e)
    return {
      stack,
      message: e.message,
      reason: "PREPARE_TEMPLATE_FAILED",
      status: CommandStatus.FAILED,
      events: [],
      success: false,
      watch: watch.stop(),
    }
  }
}
