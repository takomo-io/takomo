"use strict"
// eslint-disable-next-line @typescript-eslint/no-var-requires
const takomo_cli = require("../../dist/cli")

const overridingHandler = (args) => {
  console.log(JSON.stringify(args, undefined, 2))
}

takomo_cli.run({ showHelpOnFail: false, overridingHandler })
