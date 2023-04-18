import { MapFunction } from "../../../../src/index.js"

export interface MyTarget {
  accountId: string
  message: string
}

const map: MapFunction<MyTarget> = async ({ target }) => {
  return {
    accountId: target.accountId!,
    message: target.vars.message,
  }
}

export default map
