export const deepCopy = (obj: any): any => JSON.parse(JSON.stringify(obj))

export const identity = <T>(value: T): T => value
