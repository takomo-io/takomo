"use strict"
import { run } from "../../dist/cli/index.js"

const overridingHandler = (args) => {
  console.log(JSON.stringify(args, undefined, 2))
}

run({ showHelpOnFail: false, overridingHandler })
