module.exports = {
  name: "my-cool-resolver",
  init: (props) => {
    return {
      resolve: () => props.greeting.toUpperCase() 
    }
  }       
}