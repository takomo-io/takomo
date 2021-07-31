import { run } from "@takomo/cli"
import "source-map-support/register"
import { Arguments } from "yargs"

const overridingHandler = (args: Arguments<unknown>) => {
  console.log(JSON.stringify(args, undefined, 2))
}

run({ overridingHandler, showHelpOnFail: false })
