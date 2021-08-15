import { Hook, HookInput, HookOutput } from "@takomo/stacks-model"
import { expandFilePath, FilePath } from "@takomo/util"
import { hashElement } from "folder-hash"

/**
 * @hidden
 */
export class ChecksumHook implements Hook {
  readonly dir: FilePath
  constructor(config: any) {
    if (!config.dir) {
      throw new Error("dir is required property")
    }
    this.dir = config.dir
  }

  async execute(input: HookInput): Promise<HookOutput> {
    const name = expandFilePath(input.ctx.projectDir, this.dir)

    const { hash } = await hashElement(name)

    return {
      success: true,
      value: hash,
    }
  }
}
