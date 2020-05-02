module.exports = {
  type: "error",
  init: (props) => {
    console.log("Initialize error hook");
    return {
      execute: (input) => {
        console.log("Execute error hook!");
        console.log(`Stage:     ${input.stage}`);
        console.log(`Operation: ${input.operation}`);
        console.log(`Status:    ${input.status}`);
        console.log(JSON.stringify(props, null, 2));
        throw new Error("Oh no!");
      }
    }
  }
};
