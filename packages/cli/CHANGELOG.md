# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [3.11.1](https://github.com/takomo-io/takomo/compare/v3.11.0...v3.11.1) (2021-04-20)

**Note:** Version bump only for package @takomo/cli





# [3.11.0](https://github.com/takomo-io/takomo/compare/v3.10.0...v3.11.0) (2021-04-20)


### Features

* **deployment targets:** add support to select deployment targets by label ([#217](https://github.com/takomo-io/takomo/issues/217)) ([51bd726](https://github.com/takomo-io/takomo/commit/51bd726c2bad8d7bb0b5e5c01e28ae61e5ba44c1)), closes [#206](https://github.com/takomo-io/takomo/issues/206)





# [3.10.0](https://github.com/takomo-io/takomo/compare/v3.9.0...v3.10.0) (2021-04-14)

**Note:** Version bump only for package @takomo/cli





# [3.9.0](https://github.com/takomo-io/takomo/compare/v3.8.0...v3.9.0) (2021-04-12)


### Features

* optimize stack event polling to minimize requests towards AWS APIs ([52715a6](https://github.com/takomo-io/takomo/commit/52715a64dfc7d70b3ba4acce07300421a9300ef9))





# [3.8.0](https://github.com/takomo-io/takomo/compare/v3.7.0...v3.8.0) (2021-04-08)


### Features

* **deployment targets:** add feature flags to disable undeploy and tear down commands ([#197](https://github.com/takomo-io/takomo/issues/197)) ([61e5031](https://github.com/takomo-io/takomo/commit/61e5031fab497a54073b02b6f78ccb6a58c9c44e)), closes [#196](https://github.com/takomo-io/takomo/issues/196)





# [3.7.0](https://github.com/takomo-io/takomo/compare/v3.6.0...v3.7.0) (2021-04-01)


### Features

* **credentials:** implement support for MFA when initializing default credentials ([#195](https://github.com/takomo-io/takomo/issues/195)) ([3a2b3dd](https://github.com/takomo-io/takomo/commit/3a2b3dd67aaa9832617c6c997b8c895643de0893)), closes [#194](https://github.com/takomo-io/takomo/issues/194)





# [3.6.0](https://github.com/takomo-io/takomo/compare/v3.5.1...v3.6.0) (2021-03-28)

**Note:** Version bump only for package @takomo/cli





## [3.5.1](https://github.com/takomo-io/takomo/compare/v3.5.0...v3.5.1) (2021-03-22)

**Note:** Version bump only for package @takomo/cli





# [3.5.0](https://github.com/takomo-io/takomo/compare/v3.4.2...v3.5.0) (2021-03-21)


### Features

* load deployment targets from an external repository ([#176](https://github.com/takomo-io/takomo/issues/176)) ([3b4baaf](https://github.com/takomo-io/takomo/commit/3b4baafa78691e7f76e01ba6f1476f0c0578343a)), closes [#172](https://github.com/takomo-io/takomo/issues/172)





## [3.4.2](https://github.com/takomo-io/takomo/compare/v3.4.1...v3.4.2) (2021-03-18)

**Note:** Version bump only for package @takomo/cli





## [3.4.1](https://github.com/takomo-io/takomo/compare/v3.4.0...v3.4.1) (2021-03-17)

**Note:** Version bump only for package @takomo/cli





# [3.4.0](https://github.com/takomo-io/takomo/compare/v3.3.0...v3.4.0) (2021-03-08)


### Features

* add support to load custom parameter resolvers from NPM packages ([#164](https://github.com/takomo-io/takomo/issues/164)) ([8d1a5e8](https://github.com/takomo-io/takomo/commit/8d1a5e8b8786804b39dd0ade31954c6c2d159385)), closes [#163](https://github.com/takomo-io/takomo/issues/163)





# [3.3.0](https://github.com/takomo-io/takomo/compare/v3.2.2...v3.3.0) (2021-02-22)


### Features

* load supported regions from takomo.yml project configuration file ([#160](https://github.com/takomo-io/takomo/issues/160)) ([dd1338e](https://github.com/takomo-io/takomo/commit/dd1338e5ba410e2e5ba24cdde9bb7be50e8df807)), closes [#147](https://github.com/takomo-io/takomo/issues/147)





## [3.2.2](https://github.com/takomo-io/takomo/compare/v3.2.1...v3.2.2) (2021-02-20)

**Note:** Version bump only for package @takomo/cli





## [3.2.1](https://github.com/takomo-io/takomo/compare/v3.2.0...v3.2.1) (2021-02-18)

**Note:** Version bump only for package @takomo/cli





# [3.2.0](https://github.com/takomo-io/takomo/compare/v3.1.0...v3.2.0) (2021-02-16)

**Note:** Version bump only for package @takomo/cli





# [3.1.0](https://github.com/takomo-io/takomo/compare/v3.0.1...v3.1.0) (2021-02-14)


### Features

* add option to specify organizational unit to create account command ([#144](https://github.com/takomo-io/takomo/issues/144)) ([fe543f0](https://github.com/takomo-io/takomo/commit/fe543f0491cbbd69f26bc695a8b4e40126d8df1d)), closes [#143](https://github.com/takomo-io/takomo/issues/143)
* add support to register custom Joi schemas that can be used to validate configuration ([#139](https://github.com/takomo-io/takomo/issues/139)) ([e9b6447](https://github.com/takomo-io/takomo/commit/e9b64475d0c4ff4b81694aa333560311fa6ce18f)), closes [#137](https://github.com/takomo-io/takomo/issues/137)
* implement loading of accounts from external repository ([#142](https://github.com/takomo-io/takomo/issues/142)) ([953250e](https://github.com/takomo-io/takomo/commit/953250e57b6f0c3349cf94d2636619f9521682c4)), closes [#140](https://github.com/takomo-io/takomo/issues/140)
* persist created accounts using account repository ([#146](https://github.com/takomo-io/takomo/issues/146)) ([69a0231](https://github.com/takomo-io/takomo/commit/69a02312d6ed4da64a7cf6d45d4f62b883afa791)), closes [#141](https://github.com/takomo-io/takomo/issues/141)





## [3.0.1](https://github.com/takomo-io/takomo/compare/v3.0.0...v3.0.1) (2021-01-31)

**Note:** Version bump only for package @takomo/cli





# [3.0.0](https://github.com/takomo-io/takomo/compare/v3.0.0-alpha.5...v3.0.0) (2021-01-23)

**Note:** Version bump only for package @takomo/cli





# [3.0.0-alpha.5](https://github.com/takomo-io/takomo/compare/v3.0.0-alpha.4...v3.0.0-alpha.5) (2021-01-20)

**Note:** Version bump only for package @takomo/cli





# [3.0.0-alpha.4](https://github.com/takomo-io/takomo/compare/v3.0.0-alpha.3...v3.0.0-alpha.4) (2021-01-18)

**Note:** Version bump only for package @takomo/cli





# [3.0.0-alpha.3](https://github.com/takomo-io/takomo/compare/v3.0.0-alpha.2...v3.0.0-alpha.3) (2021-01-17)


### Bug Fixes

* fix loading of the current Takomo version from package.json ([e4e1632](https://github.com/takomo-io/takomo/commit/e4e1632402639df1930db5f3989760c9d16142ba))





# [3.0.0-alpha.2](https://github.com/takomo-io/takomo/compare/v3.0.0-alpha.1...v3.0.0-alpha.2) (2021-01-17)


### Features

* improve organization commands error handling ([691512c](https://github.com/takomo-io/takomo/commit/691512c174253db0ab18cb0ffd5915574be798ff))





# [3.0.0-alpha.1](https://github.com/takomo-io/takomo/compare/v3.0.0-alpha.0...v3.0.0-alpha.1) (2021-01-15)

**Note:** Version bump only for package @takomo/cli





# [3.0.0-alpha.0](https://github.com/takomo-io/takomo/compare/v2.12.1...v3.0.0-alpha.0) (2021-01-10)


### chore

* Prepare release 3.0.0 ([3c0b70b](https://github.com/takomo-io/takomo/commit/3c0b70ba5a6cd5d4472ccdf01e78a2a95465ccc1))


### BREAKING CHANGES

* - Remove secrets management CLI commands
- Remove secret parameter resolver
- Remove secret property from stack configuration files
- Remove projectDir from configSet object used with organization and deployment targets
- All CloudFormation templates are now processed with Handlebars templating engine
- Major refactoring and cleanup of the codebase





## [2.12.1](https://github.com/takomo-io/takomo/compare/v2.12.0...v2.12.1) (2020-12-25)

**Note:** Version bump only for package @takomo/cli





# [2.12.0](https://github.com/takomo-io/takomo/compare/v2.11.1...v2.12.0) (2020-10-30)

**Note:** Version bump only for package @takomo/cli





## [2.11.1](https://github.com/takomo-io/takomo/compare/v2.11.0...v2.11.1) (2020-10-20)

**Note:** Version bump only for package @takomo/cli





# [2.11.0](https://github.com/takomo-io/takomo/compare/v2.10.1...v2.11.0) (2020-10-17)


### Features

* add CLI commands to create and delete account aliases ([#119](https://github.com/takomo-io/takomo/issues/119)) ([56571e4](https://github.com/takomo-io/takomo/commit/56571e45e8e6b52976c5f4323c20e9e3a8280b2f)), closes [#75](https://github.com/takomo-io/takomo/issues/75)





## [2.10.1](https://github.com/takomo-io/takomo/compare/v2.10.0...v2.10.1) (2020-10-13)

**Note:** Version bump only for package @takomo/cli





# [2.10.0](https://github.com/takomo-io/takomo/compare/v2.9.0...v2.10.0) (2020-10-11)


### Bug Fixes

* fix reviewing of stacks whose template uses 'AWS::Serverless-2016-10-31' transformation ([#113](https://github.com/takomo-io/takomo/issues/113)) ([5f1df87](https://github.com/takomo-io/takomo/commit/5f1df87fe8a65df8345bac2eb8cfdc8d90266043)), closes [#112](https://github.com/takomo-io/takomo/issues/112)


### Features

* add CLI command to show stacks dependency graph ([#116](https://github.com/takomo-io/takomo/issues/116)) ([20c00f2](https://github.com/takomo-io/takomo/commit/20c00f2a7f71c62f514fea72d24c6be9c1218b42)), closes [#115](https://github.com/takomo-io/takomo/issues/115)





# [2.9.0](https://github.com/takomo-io/takomo/compare/v2.8.0...v2.9.0) (2020-10-09)

**Note:** Version bump only for package @takomo/cli





# [2.8.0](https://github.com/takomo-io/takomo/compare/v2.7.4...v2.8.0) (2020-10-05)

**Note:** Version bump only for package @takomo/cli





## [2.7.4](https://github.com/takomo-io/takomo/compare/v2.7.3...v2.7.4) (2020-09-27)

**Note:** Version bump only for package @takomo/cli





## [2.7.3](https://github.com/takomo-io/takomo/compare/v2.7.2...v2.7.3) (2020-09-21)

**Note:** Version bump only for package @takomo/cli





## [2.7.2](https://github.com/takomo-io/takomo/compare/v2.7.1...v2.7.2) (2020-09-07)

**Note:** Version bump only for package @takomo/cli





## [2.7.1](https://github.com/takomo-io/takomo/compare/v2.7.0...v2.7.1) (2020-09-02)

**Note:** Version bump only for package @takomo/cli





# [2.7.0](https://github.com/takomo-io/takomo/compare/v2.6.2...v2.7.0) (2020-08-31)

**Note:** Version bump only for package @takomo/cli





## [2.6.2](https://github.com/takomo-io/takomo/compare/v2.6.1...v2.6.2) (2020-08-27)

**Note:** Version bump only for package @takomo/cli





## [2.6.1](https://github.com/takomo-io/takomo/compare/v2.6.0...v2.6.1) (2020-08-20)

**Note:** Version bump only for package @takomo/cli





# [2.6.0](https://github.com/takomo-io/takomo/compare/v2.5.0...v2.6.0) (2020-08-18)

**Note:** Version bump only for package @takomo/cli





# [2.5.0](https://github.com/takomo-io/takomo/compare/v2.4.0...v2.5.0) (2020-07-28)


### Features

* improve organization deployment ([#72](https://github.com/takomo-io/takomo/issues/72)) ([6104896](https://github.com/takomo-io/takomo/commit/6104896c1b90654ddb0e63de2703a7327d997c85)), closes [#71](https://github.com/takomo-io/takomo/issues/71)





# [2.4.0](https://github.com/takomo-io/takomo/compare/v2.3.0...v2.4.0) (2020-07-07)


### Features

* add CLI commands to bootstrap and tear down deployment targets ([#64](https://github.com/takomo-io/takomo/issues/64)) ([8ddd6d7](https://github.com/takomo-io/takomo/commit/8ddd6d7b7e6c8cd8b8db84badfdf62e1a22bd939)), closes [#63](https://github.com/takomo-io/takomo/issues/63)





# [2.3.0](https://github.com/takomo-io/takomo/compare/v2.2.1...v2.3.0) (2020-07-02)

**Note:** Version bump only for package @takomo/cli





# [2.2.0](https://github.com/takomo-io/takomo/compare/v2.1.0...v2.2.0) (2020-06-26)

**Note:** Version bump only for package @takomo/cli





# [2.1.0](https://github.com/takomo-io/takomo/compare/v2.0.0...v2.1.0) (2020-06-21)

**Note:** Version bump only for package @takomo/cli





# [2.0.0](https://github.com/takomo-io/takomo/compare/v2.0.0-alpha.1...v2.0.0) (2020-06-15)

**Note:** Version bump only for package @takomo/cli





# [2.0.0-alpha.1](https://github.com/takomo-io/takomo/compare/v2.0.0-alpha.0...v2.0.0-alpha.1) (2020-06-15)

**Note:** Version bump only for package @takomo/cli





# [2.0.0-alpha.0](https://github.com/takomo-io/takomo/compare/v1.3.1...v2.0.0-alpha.0) (2020-06-15)


### Features

* require nodejs version 14.4.0 ([#50](https://github.com/takomo-io/takomo/issues/50)) ([da186b4](https://github.com/takomo-io/takomo/commit/da186b44aadee05fb1478f21a536d0c7b6343553)), closes [#46](https://github.com/takomo-io/takomo/issues/46)


### BREAKING CHANGES

* Takomo now requires nodejs version 14.4.0





## [1.3.1](https://github.com/takomo-io/takomo/compare/v1.3.0...v1.3.1) (2020-06-14)

**Note:** Version bump only for package @takomo/cli





# [1.3.0](https://github.com/takomo-io/takomo/compare/v1.2.1...v1.3.0) (2020-06-09)


### Features

* add cli command to initialize a new project ([#43](https://github.com/takomo-io/takomo/issues/43)) ([7a11d55](https://github.com/takomo-io/takomo/commit/7a11d55b6e19fd46e59d614b514abe1cef2a66c3))
* add support to validate parameter resolver configuration ([#41](https://github.com/takomo-io/takomo/issues/41)) ([a70b307](https://github.com/takomo-io/takomo/commit/a70b30798c281a25f002a1a43732fc4afa8cf113)), closes [#40](https://github.com/takomo-io/takomo/issues/40)





## [1.2.1](https://github.com/takomo-io/takomo/compare/v1.2.0...v1.2.1) (2020-05-29)

**Note:** Version bump only for package @takomo/cli





# [1.2.0](https://github.com/takomo-io/takomo/compare/v1.1.0...v1.2.0) (2020-05-28)


### Features

* include information about OS and versions in error messages ([#37](https://github.com/takomo-io/takomo/issues/37)) ([4364be8](https://github.com/takomo-io/takomo/commit/4364be884e66ebce40099b22f6fe6a343e4c7595)), closes [#36](https://github.com/takomo-io/takomo/issues/36)





# [1.1.0](https://github.com/takomo-io/takomo/compare/v1.0.0...v1.1.0) (2020-05-18)


### Features

* show required minimum IAM policy in command specific help ([#26](https://github.com/takomo-io/takomo/issues/26)) ([177cf3f](https://github.com/takomo-io/takomo/commit/177cf3fba016b33e8009cb62e6f715ddc25dc4b9)), closes [#23](https://github.com/takomo-io/takomo/issues/23)





# [1.0.0](https://github.com/takomo-io/takomo/compare/v0.2.0...v1.0.0) (2020-05-12)


### Features

* parameter resolver enhancements ([#12](https://github.com/takomo-io/takomo/issues/12)) ([a54d2d0](https://github.com/takomo-io/takomo/commit/a54d2d05c93a17364cc61d0606a8d9dc62aa8187)), closes [#10](https://github.com/takomo-io/takomo/issues/10)
* rename organization launch CLI command ([#14](https://github.com/takomo-io/takomo/issues/14)) ([e4c9572](https://github.com/takomo-io/takomo/commit/e4c95720427e53d4e44d605d507569523d85e581)), closes [#13](https://github.com/takomo-io/takomo/issues/13)


### BREAKING CHANGES

* Rename 'tkm org launch' CLI command to 'tkm org deploy'
* Parameter resolver API and custom resolver configuration file have changed





# [0.2.0](https://github.com/takomo-io/takomo/compare/v0.1.0...v0.2.0) (2020-05-07)

**Note:** Version bump only for package @takomo/cli





# [0.1.0](https://github.com/takomo-io/takomo/compare/v0.0.2...v0.1.0) (2020-05-06)

**Note:** Version bump only for package @takomo/cli





## 0.0.2 (2020-05-04)

**Note:** Version bump only for package @takomo/cli
