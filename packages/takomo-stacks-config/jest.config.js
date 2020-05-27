module.exports = {
  transform: { "^.+\\.ts?$": "ts-jest" },
  testEnvironment: "node",
  testRegex: ["/test/.*\\.(test)?\\.(ts)$"],
  moduleFileExtensions: ["ts", "js", "json", "node"],
  collectCoverage: false,
  coverageDirectory: "output/coverage",
}
