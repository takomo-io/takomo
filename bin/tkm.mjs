#!/usr/bin/env node
import semver from "semver"
import { run } from "../dist/index.js"

const requiredVersion = "20.11.0"
if (!semver.satisfies(process.version, ">=" + requiredVersion)) {
  console.log("ERROR")
  console.log("-----")
  console.log(
    "Your Node.js version " +
      process.version +
      " is not compatible with Takomo.",
  )
  console.log()
  console.log(
    "Takomo requires at least Node.js " +
      requiredVersion +
      " or above. Please upgrade your Node.js.",
  )
  console.log()
  process.exit(1)
}

run()
