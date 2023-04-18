import { ReduceFunction } from "../../../../src/index.js"
import { MyTarget } from "./map.js"

const reduce: ReduceFunction<MyTarget, string> = async ({ targets }) => {
  return targets.map((t) => t.accountId + "=" + t.message).join("")
}

export default reduce
