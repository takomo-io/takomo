export const exhaustiveCheck = <T>(param: never): T => {
  throw new Error(param)
}
