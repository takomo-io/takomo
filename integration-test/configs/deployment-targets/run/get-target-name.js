export default async ({ target, logger }) => {
  logger.info(`Target: ${target.name}`)
  return target.name
}
