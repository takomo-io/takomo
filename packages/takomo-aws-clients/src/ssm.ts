import { Region } from "@takomo/core"
import { Credentials, SSM } from "aws-sdk"
import { ParameterHistoryList } from "aws-sdk/clients/ssm"
import { AwsClient, AwsClientClientProps } from "./aws-client"

export class SSMClient extends AwsClient<SSM> {
  constructor(props: AwsClientClientProps) {
    super(props)
  }

  protected getClient = (credentials: Credentials, region: Region): SSM =>
    new SSM({
      ...this.clientOptions(),
      credentials,
      region,
    })

  putEncryptedParameter = async (
    name: string,
    value: string,
    description: string,
  ): Promise<boolean> =>
    this.withClientPromise(
      (c) =>
        c.putParameter({
          Type: "SecureString",
          Value: value,
          Name: name,
          Overwrite: true,
          Description: description,
        }),
      () => true,
    )

  getEncryptedParameter = async (name: string): Promise<string | null> =>
    this.withClientPromise(
      (c) =>
        c.getParameter({
          Name: name,
          WithDecryption: true,
        }),
      (res) => res.Parameter!.Value!,
      (e) => {
        if (e.code === "ParameterNotFound") {
          return null
        }

        throw e
      },
    )

  getParameterHistory = async (name: string): Promise<ParameterHistoryList> =>
    this.withClientPromise(
      (c) =>
        c.getParameterHistory({
          Name: name,
          WithDecryption: true,
        }),
      (res) => res.Parameters!,
    )

  getParameterDescription = async (name: string): Promise<string> =>
    this.getParameterHistory(name).then((history) => history[0].Description!)

  deleteParameters = async (names: string[]): Promise<boolean> =>
    this.withClientPromise(
      (c) =>
        c.deleteParameters({
          Names: names,
        }),
      () => true,
    )

  getEncryptedParametersByPath = async (
    path: string,
  ): Promise<SSM.Parameter[]> =>
    this.withClient((c) =>
      this.pagedOperation(
        (params) => c.getParametersByPath(params),
        {
          Path: path,
          WithDecryption: true,
          Recursive: true,
        },
        (res) => res.Parameters,
      ),
    )
}
