"use strict"
import { run } from "../../dist/src/cli/index.js"

const overridingHandler = (args) => {
  console.log(JSON.stringify(args, undefined, 2))
}

run({ showHelpOnFail: false, overridingHandler })
