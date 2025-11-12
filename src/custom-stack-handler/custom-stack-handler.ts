import { TkmLogger } from "../utils/logging.js"

export interface GetCurrentStateProps<CONFIG> {
  readonly logger: TkmLogger
  readonly config: CONFIG
}

export interface GetCurrentStateResult<STATE> {
  readonly state?: STATE
}

export interface CreateCustomStackProps<CONFIG> {
  readonly logger: TkmLogger
  readonly config: CONFIG
  readonly parameters: Record<string, string>
}

export interface CreateCustomStackResult {
  readonly outputs?: Record<string, string>
}

export interface UpdateCustomStackProps<CONFIG, STATE> {
  readonly logger: TkmLogger
  readonly state: STATE
  readonly config: CONFIG
  readonly parameters: Record<string, string>
}

export interface UpdateCustomStackResult<STATE> {
  readonly state: STATE
  readonly outputs?: Record<string, string>
}

export interface DeleteCustomStackProps<CONFIG, STATE> {
  readonly logger: TkmLogger
  readonly state: STATE
  readonly config: CONFIG
}

export interface DeleteCustomStackResult {
  readonly success: boolean
}

export interface CustomStackHandler<CONFIG, STATE> {
  readonly getCurrentState: (
    props: GetCurrentStateProps<CONFIG>,
  ) => Promise<STATE>

  readonly create: (
    props: CreateCustomStackProps<CONFIG>,
  ) => Promise<CreateCustomStackResult>

  readonly update: (
    props: UpdateCustomStackProps<CONFIG, STATE>,
  ) => Promise<UpdateCustomStackResult<STATE>>

  readonly delete: (
    props: DeleteCustomStackProps<CONFIG, STATE>,
  ) => Promise<DeleteCustomStackResult>
}
