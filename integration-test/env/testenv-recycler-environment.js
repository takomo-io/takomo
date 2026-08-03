import path from "path"
import { TestEnvironment } from "jest-environment-node"
import { Recycler } from "./testenv-recycler-client.js"

const isInteger = (str) => /^\+?(0|[1-9]\d*)$/.test(str)

export default class TestEnvRecyclerEnvironment extends TestEnvironment {
  constructor(config, context) {
    super(config, context)
    this.docblockPragmas = context.docblockPragmas
    this.testPath = context.testPath
    this.name = path.basename(this.testPath)
  }

  async setup() {
    await super.setup()

    this.recycler = new Recycler({
      name: this.name,
      hostname: this.global.process.env.RECYCLER_HOSTNAME,
      username: this.global.process.env.RECYCLER_USERNAME,
      password: this.global.process.env.RECYCLER_PASSWORD,
    })

    const countStr = this.docblockPragmas["testenv-recycler-count"] || "1"
    if (!isInteger(countStr)) {
      console.log(
        `${this.name} - @testenv-recycler-count must be a positive integer`,
      )
      throw new Error("@testenv-recycler-count must be a positive integer")
    }

    const count = parseInt(countStr, 10)

    try {
      await this.recycler.login()
    } catch (e) {
      console.log(`${this.name} - Failed to log in`, e)
      throw e
    }

    console.log(`${this.name} - Logged in`)

    try {
      this.global.reservation = await this.recycler.createReservation({
        name: this.name,
        count,
      })
    } catch (e) {
      console.log(`${this.name} - Failed to create the reservation`, e)
      throw e
    }
  }

  async teardown() {
    if (this.global.reservation) {
      try {
        await this.recycler.releaseReservation(this.global.reservation.id)
        console.log(
          `${this.name} - Released reservation ${this.global.reservation.id}`,
        )
      } catch (e) {
        console.log(
          `${this.name} - Failed to release the reservation ${this.global.reservation.id}`,
          e,
        )
        throw e
      }
    }
    await super.teardown()
  }
}
