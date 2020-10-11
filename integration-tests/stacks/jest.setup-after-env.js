// Set timeout in millis for all tests

jest.setTimeout(1000 * 60 * 10)

expect.extend({
  stacksOperationOutputToBeSuccess(received) {
    if (received.status !== "SUCCESS") {
      return {
        message: () => `expected status to be 'SUCCESS'`,
        pass: false,
      }
    }

    if (received.success !== true) {
      return {
        message: () => `expected success to be true`,
        pass: false,
      }
    }

    if (received.message !== "Success") {
      return {
        message: () => `expected message to be 'Success'`,
        pass: false,
      }
    }

    return {
      message: () => "",
      pass: true,
    }
  },
  stacksOperationOutputToBeSkipped(received) {
    if (received.status !== "SKIPPED") {
      return {
        message: () => `expected status to be 'SKIPPED'`,
        pass: false,
      }
    }

    if (received.success !== true) {
      return {
        message: () => `expected success to be true`,
        pass: false,
      }
    }

    if (received.message !== "Skipped") {
      return {
        message: () => `expected message to be 'Skipped'`,
        pass: false,
      }
    }

    return {
      message: () => "",
      pass: true,
    }
  },
})
