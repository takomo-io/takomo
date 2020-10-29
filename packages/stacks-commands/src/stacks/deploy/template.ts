import { S3Client } from "@takomo/aws-clients"
import { CommandStatus, Constants } from "@takomo/core"
import {
  Stack,
  StackOperationVariables,
  StackResult,
} from "@takomo/stacks-model"
import { mapToObject, readFileContents, renderTemplate } from "@takomo/util"
import { CloudFormation } from "aws-sdk"
import path from "path"
import { createOrUpdateStack } from "./execute"
import { TagsHolder, TemplateBodyHolder, TemplateLocationHolder } from "./model"
import { reviewChanges } from "./review"
import { validateTemplate } from "./validate"

export const summarizeTemplate = async (
  holder: TemplateLocationHolder,
): Promise<StackResult> => {
  const {
    cloudFormationClient,
    stack,
    templateS3Url,
    templateBody,
    io,
    watch,
    state,
  } = holder
  const childWatch = watch.startChild("summarize-template")
  const input = templateS3Url || templateBody
  const key = templateS3Url ? "TemplateURL" : "TemplateBody"

  try {
    const templateSummary = await cloudFormationClient.getTemplateSummary({
      [key]: input,
    })

    childWatch.stop()

    if (state.autoConfirm) {
      return createOrUpdateStack({ ...holder, templateSummary })
    }

    return reviewChanges({
      ...holder,
      templateSummary,
    })
  } catch (e) {
    io.error(`${stack.getPath()} - Failed to summarize template`, e)
    return {
      stack,
      message: e.message,
      reason: "TEMPLATE_SUMMARY_FAILED",
      status: CommandStatus.FAILED,
      events: [],
      success: false,
      watch: watch.stop(),
    }
  }
}

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

export const createVariablesForStackTemplate = (
  variables: StackOperationVariables,
  stack: Stack,
  parameters: CloudFormation.Parameter[],
): any => {
  const stackPath = stack.getPath()
  const pathSegments = stackPath.substr(1).split("/")
  const filePath = pathSegments.slice(0, -1).join("/")
  return {
    ...variables,
    stack: {
      pathSegments,
      project: stack.getProject(),
      path: stackPath,
      name: stack.getName(),
      template: stack.getTemplate(),
      templateBucket: stack.getTemplateBucket(),
      commandRole: stack.getCommandRole(),
      region: stack.getRegion(),
      tags: mapToObject(stack.getTags()),
      timeout: stack.getTimeout(),
      depends: stack.getDependencies(),
      terminationProtection: stack.isTerminationProtectionEnabled(),
      data: stack.getData(),
      parameters: parameters.map((p) => ({
        key: p.ParameterKey,
        value: p.ParameterValue,
      })),
      configFile: {
        filePath,
        basename: path.basename(filePath),
        name: path.basename(filePath, ".yml"),
        dirPath:
          pathSegments.length === 2 ? "" : pathSegments.slice(0, -2).join("/"),
      },
    },
  }
}

export const prepareCloudFormationTemplate = async (
  holder: TagsHolder,
): Promise<StackResult> => {
  const { ctx, stack, watch, variables, logger, parameters } = holder
  logger.debug("Prepare CloudFormation template")

  const childWatch = watch.startChild("prepare-template")
  const stackVariables = createVariablesForStackTemplate(
    variables,
    stack,
    parameters,
  )

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
