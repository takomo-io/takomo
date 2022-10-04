import { NodeHttpHandler } from "@aws-sdk/node-http-handler"
import https from "https"

/**
 * @hidden
 */
export const customRequestHandler = (maxSockets: number) => {
  const agent = new https.Agent({
    maxSockets,
  })

  return new NodeHttpHandler({
    httpsAgent: agent,
  })
}
