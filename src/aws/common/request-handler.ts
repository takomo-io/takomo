import { NodeHttpHandler } from "@smithy/node-http-handler"
import https from "https"

export const customRequestHandler = (maxSockets: number) => {
  const agent = new https.Agent({
    maxSockets,
  })

  return new NodeHttpHandler({
    httpsAgent: agent,
  })
}
