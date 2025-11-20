import { CustomStackStatus } from "../stacks/custom-stack.js"
import { CustomStackType } from "../stacks/stack.js"
import { TkmLogger } from "../utils/logging.js"

export type CustomStackState = {
  status?: CustomStackStatus
  lastUpdatedTime?: Date
  creationTime?: Date
  parameters?: Record<string, string>
  tags?: Record<string, string>
  outputs?: Record<string, string>
}

export interface GetCurrentStateProps<CONFIG> {
  readonly logger: TkmLogger
  readonly config: CONFIG
}

export interface GetCurrentStateResult<STATE extends CustomStackState> {
  readonly success: boolean
  readonly error?: Error
  readonly message?: string
  readonly state?: STATE
}

export interface CreateCustomStackProps<CONFIG> {
  readonly logger: TkmLogger
  readonly config: CONFIG
  readonly parameters: Record<string, string>
  readonly tags: Record<string, string>
}

export interface CreateCustomStackResult {
  readonly success: boolean
  readonly error?: Error
  readonly message?: string
  readonly outputs?: Record<string, string>
}

export interface UpdateCustomStackProps<
  CONFIG,
  STATE extends CustomStackState,
> {
  readonly logger: TkmLogger
  readonly state: STATE
  readonly config: CONFIG
  readonly parameters: Record<string, string>
  readonly tags: Record<string, string>
}

export interface UpdateCustomStackResult {
  readonly success: boolean
  readonly error?: Error
  readonly message?: string
  readonly outputs?: Record<string, string>
}

export interface ParseConfigProps {
  readonly logger: TkmLogger
  readonly config: unknown
}

export interface ParseConfigResult<CONFIG> {
  readonly success: boolean
  readonly error?: Error
  readonly message?: string
  readonly config: CONFIG
}

export interface DeleteCustomStackProps<
  CONFIG,
  STATE extends CustomStackState,
> {
  readonly logger: TkmLogger
  readonly state: STATE
  readonly config: CONFIG
}

export interface DeleteCustomStackResult {
  readonly success: boolean
  readonly error?: Error
  readonly message?: string
}

export interface CustomStackHandler<CONFIG, STATE extends CustomStackState> {
  readonly type: CustomStackType

  readonly getCurrentState: (
    props: GetCurrentStateProps<CONFIG>,
  ) => Promise<STATE>

  readonly parseConfig: (
    props: ParseConfigProps,
  ) => Promise<ParseConfigResult<CONFIG>>

  readonly create: (
    props: CreateCustomStackProps<CONFIG>,
  ) => Promise<CreateCustomStackResult>

  readonly update: (
    props: UpdateCustomStackProps<CONFIG, STATE>,
  ) => Promise<UpdateCustomStackResult>

  readonly delete: (
    props: DeleteCustomStackProps<CONFIG, STATE>,
  ) => Promise<DeleteCustomStackResult>
}
