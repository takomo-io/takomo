# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [3.26.0](https://github.com/takomo-io/takomo/compare/v3.25.0...v3.26.0) (2021-07-21)


### Features

* **deployment targets:** add --map-args option to run deployment targets command ([#272](https://github.com/takomo-io/takomo/issues/272)) ([fd784c7](https://github.com/takomo-io/takomo/commit/fd784c7fee48c7e4458e00f6ce9f600c6ed54618))
* **organization:** add support for config set stages ([#271](https://github.com/takomo-io/takomo/issues/271)) ([b04070b](https://github.com/takomo-io/takomo/commit/b04070b12404ba4cceb8cf15228c2bb882d7503b))
* **organization:** treat organization policy files as dynamic handlebars templates ([#270](https://github.com/takomo-io/takomo/issues/270)) ([d9c430b](https://github.com/takomo-io/takomo/commit/d9c430b8b257cc240be6fb46d9a1c4e360651ff6))
* **templating:** disable html escaping of dynamic Handlebars templates ([b6d0adf](https://github.com/takomo-io/takomo/commit/b6d0adfe977c771617e509cd5f1bfd8816b760a4))





# [3.25.0](https://github.com/takomo-io/takomo/compare/v3.24.0...v3.25.0) (2021-07-14)


### Features

* **organization:** add option to infer accout OU path from the dir its config file is located ([#268](https://github.com/takomo-io/takomo/issues/268)) ([0ae6a90](https://github.com/takomo-io/takomo/commit/0ae6a90ce23ba3423787e655c5f12ea124ba21df)), closes [#267](https://github.com/takomo-io/takomo/issues/267)
* **stacks:** add option to specify variable files in takomo.yml file ([#266](https://github.com/takomo-io/takomo/issues/266)) ([e7918e6](https://github.com/takomo-io/takomo/commit/e7918e6cdcf36e40cdea15e24f5a54820ec7d834)), closes [#265](https://github.com/takomo-io/takomo/issues/265)





# [3.24.0](https://github.com/takomo-io/takomo/compare/v3.23.0...v3.24.0) (2021-07-07)


### Features

* **deployment targets:** add option to infer deployment group path from target's file path ([#264](https://github.com/takomo-io/takomo/issues/264)) ([816514e](https://github.com/takomo-io/takomo/commit/816514e8c84a4121f2a7ee99e784e3ee5da82ad0))
* **organizations:** imporove organization configuration validation ([#263](https://github.com/takomo-io/takomo/issues/263)) ([5009bc2](https://github.com/takomo-io/takomo/commit/5009bc290258b0526bb6dbf7e6648488ae39b5f1))





# [3.23.0](https://github.com/takomo-io/takomo/compare/v3.22.0...v3.23.0) (2021-06-27)


### Features

* **deployment targets:** add option to prevent assuming of role from… ([#260](https://github.com/takomo-io/takomo/issues/260)) ([87b2134](https://github.com/takomo-io/takomo/commit/87b21346e010fcb05bbc6a4d16c4f06bd4de33da)), closes [#259](https://github.com/takomo-io/takomo/issues/259)
* **stacks:** do not validate schemas in stack groups ([#261](https://github.com/takomo-io/takomo/issues/261)) ([f930fd9](https://github.com/takomo-io/takomo/commit/f930fd9609b5a180d70d78a459a952f283b16a12))





# [3.22.0](https://github.com/takomo-io/takomo/compare/v3.21.0...v3.22.0) (2021-06-22)


### Bug Fixes

* **stacks:** fix formatting of stack dependents on stack undeploy review ([e9a064e](https://github.com/takomo-io/takomo/commit/e9a064e1e5c8a8c5954c4d18f0c95403a15122c9))


### Features

* **deployment targets:** improve error handling of deplyment targets ([#256](https://github.com/takomo-io/takomo/issues/256)) ([e84bfed](https://github.com/takomo-io/takomo/commit/e84bfed5061e94f5bf5742b89002da73e78eae62))
* **stacks:** add support for stack name and parameters schemas ([#257](https://github.com/takomo-io/takomo/issues/257)) ([f30c7ac](https://github.com/takomo-io/takomo/commit/f30c7ac19d4489f110310ae239977a5f55694a12))





# [3.21.0](https://github.com/takomo-io/takomo/compare/v3.20.0...v3.21.0) (2021-06-18)


### Features

* **deployment targets:** enhancements to run deployment targets command ([#253](https://github.com/takomo-io/takomo/issues/253)) ([bf4beaa](https://github.com/takomo-io/takomo/commit/bf4beaa54a7d5febf5710bacc46e19d7a3dd375f))
* **stacks:** add command to detect stack drift ([#255](https://github.com/takomo-io/takomo/issues/255)) ([cb81d48](https://github.com/takomo-io/takomo/commit/cb81d484066561fea40f405e360c1088a0ba492c)), closes [#252](https://github.com/takomo-io/takomo/issues/252)
* **stacks:** exit process with error code if drift is detected ([ca5d377](https://github.com/takomo-io/takomo/commit/ca5d377c3f47c1e127ee2d0252494a35e643ac0a))





# [3.20.0](https://github.com/takomo-io/takomo/compare/v3.19.0...v3.20.0) (2021-06-14)


### Bug Fixes

* **stacks:** fix reviewing of stack template when transform is used ([#250](https://github.com/takomo-io/takomo/issues/250)) ([baa601e](https://github.com/takomo-io/takomo/commit/baa601e29f534cd86e0bf9cd61663f5b37e5d7c1)), closes [#249](https://github.com/takomo-io/takomo/issues/249)


### Features

* **stacks:** add support for custom schemas for tags and data ([#251](https://github.com/takomo-io/takomo/issues/251)) ([cfaf951](https://github.com/takomo-io/takomo/commit/cfaf95168a5ec5f9048a8ac783818e0cea1b347e)), closes [#186](https://github.com/takomo-io/takomo/issues/186)





# [3.19.0](https://github.com/takomo-io/takomo/compare/v3.18.0...v3.19.0) (2021-06-07)


### Features

* **deployment targets:** enhance deployment targets run command ([7b83e3d](https://github.com/takomo-io/takomo/commit/7b83e3dec213f28be7e05bf01c94d8599bf39b93))





# [3.18.0](https://github.com/takomo-io/takomo/compare/v3.17.0...v3.18.0) (2021-06-04)


### Features

* **stacks:** add support for stack policies ([#248](https://github.com/takomo-io/takomo/issues/248)) ([f80657f](https://github.com/takomo-io/takomo/commit/f80657f1af0e2be1eb7fd22530f3016558b81524)), closes [#247](https://github.com/takomo-io/takomo/issues/247)





# [3.17.0](https://github.com/takomo-io/takomo/compare/v3.16.0...v3.17.0) (2021-06-02)


### Features

* **deployment targets:** add more options to deployment targets run command ([#244](https://github.com/takomo-io/takomo/issues/244)) ([bd4dd19](https://github.com/takomo-io/takomo/commit/bd4dd1966350aed0cad59ed2e274d984f8a61732)), closes [#242](https://github.com/takomo-io/takomo/issues/242)
* **resolvers:** implement parameter resolver that reads parameter values from SSM parameters ([#246](https://github.com/takomo-io/takomo/issues/246)) ([a260640](https://github.com/takomo-io/takomo/commit/a260640cca8a217d03664179a980e50dcf02cc33)), closes [#245](https://github.com/takomo-io/takomo/issues/245)





# [3.16.0](https://github.com/takomo-io/takomo/compare/v3.15.1...v3.16.0) (2021-05-26)


### Features

* **deployment targets:** add new command to run arbitrary commands targeting deployment targets wit ([#241](https://github.com/takomo-io/takomo/issues/241)) ([100fcba](https://github.com/takomo-io/takomo/commit/100fcba890469ad795b5e0d5f7c5172f77df6794)), closes [#240](https://github.com/takomo-io/takomo/issues/240)





## [3.15.1](https://github.com/takomo-io/takomo/compare/v3.15.0...v3.15.1) (2021-05-24)


### Bug Fixes

* **deployment targets:** fix config set option ([#239](https://github.com/takomo-io/takomo/issues/239)) ([2f1228d](https://github.com/takomo-io/takomo/commit/2f1228d26f6d3dd4917f9e25a05aaba52906e42c))





# [3.15.0](https://github.com/takomo-io/takomo/compare/v3.14.0...v3.15.0) (2021-05-21)


### Features

* **deployment targets:** add options to execute operation against a single config set and command path ([#234](https://github.com/takomo-io/takomo/issues/234)) ([26aaf8c](https://github.com/takomo-io/takomo/commit/26aaf8c5d2e75299f669e0b068c3a2a5a6b1653f)), closes [#225](https://github.com/takomo-io/takomo/issues/225)
* **helpers:** add support to load custom Handlebars helpers from NPM packages ([#235](https://github.com/takomo-io/takomo/issues/235)) ([6e35962](https://github.com/takomo-io/takomo/commit/6e35962b73d6053a4fa3567584b57fb65005238c)), closes [#173](https://github.com/takomo-io/takomo/issues/173)
* **stacks:** add support to define stack template as inline ([#237](https://github.com/takomo-io/takomo/issues/237)) ([74fd718](https://github.com/takomo-io/takomo/commit/74fd718919f1e57237899ee7525a108c438cb253)), closes [#236](https://github.com/takomo-io/takomo/issues/236)





# [3.14.0](https://github.com/takomo-io/takomo/compare/v3.13.0...v3.14.0) (2021-05-10)


### Features

* **deployment targets:** add new option to exclude labels from deployment operations ([#233](https://github.com/takomo-io/takomo/issues/233)) ([68aa4ee](https://github.com/takomo-io/takomo/commit/68aa4eef9f975a0098883f8de3040970db391a58)), closes [#321](https://github.com/takomo-io/takomo/issues/321)
* **deployment targets:** add new option to exclude targets from deployment operations ([#232](https://github.com/takomo-io/takomo/issues/232)) ([4f750cb](https://github.com/takomo-io/takomo/commit/4f750cb1f8e476cf9373030a44110a200089c287)), closes [#227](https://github.com/takomo-io/takomo/issues/227)





# [3.13.0](https://github.com/takomo-io/takomo/compare/v3.12.0...v3.13.0) (2021-05-09)


### Features

* **organizations:** add support for config set dirs ([#224](https://github.com/takomo-io/takomo/issues/224)) ([53f7c97](https://github.com/takomo-io/takomo/commit/53f7c9740e34f708417873e861866c6ed632abf5))
* **organizations:** add support to deploy accounts in parallel ([#226](https://github.com/takomo-io/takomo/issues/226)) ([993649c](https://github.com/takomo-io/takomo/commit/993649cc303849f40190fbadb84d9625c17a7b77)), closes [#25](https://github.com/takomo-io/takomo/issues/25)
* **organizations:** improve organization deploy confirm step ([#230](https://github.com/takomo-io/takomo/issues/230)) ([c2b0056](https://github.com/takomo-io/takomo/commit/c2b0056e353c0e351889c639f2aa35696e02ae30))
* **organizations:** modify account repository config ([#229](https://github.com/takomo-io/takomo/issues/229)) ([6b32677](https://github.com/takomo-io/takomo/commit/6b326776e0595822a6594b38ee5b0ad4fb826a2e))
* **organizations:** remove trusted services from organization management ([#228](https://github.com/takomo-io/takomo/issues/228)) ([eebf3a2](https://github.com/takomo-io/takomo/commit/eebf3a2c7d0b0984d0079fc7448fbc33f60b2d25))





# [3.12.0](https://github.com/takomo-io/takomo/compare/v3.11.1...v3.12.0) (2021-04-27)


### Features

* **deployment targets:** load config sets from a separate directory ([#223](https://github.com/takomo-io/takomo/issues/223)) ([f476db7](https://github.com/takomo-io/takomo/commit/f476db78afb85aa1f304caffdfdd54f2a2de0c66)), closes [#222](https://github.com/takomo-io/takomo/issues/222)
* **iam:** add command to generate a list of IAM actions needed to perform an action ([#221](https://github.com/takomo-io/takomo/issues/221)) ([e89e08f](https://github.com/takomo-io/takomo/commit/e89e08f1afb79a6b4be16f8d5488161115be6527)), closes [#219](https://github.com/takomo-io/takomo/issues/219)





## [3.11.1](https://github.com/takomo-io/takomo/compare/v3.11.0...v3.11.1) (2021-04-20)


### Bug Fixes

* **deployment targets:** change the wildcard character to % because * is a special character in shell ([#220](https://github.com/takomo-io/takomo/issues/220)) ([c701349](https://github.com/takomo-io/takomo/commit/c7013497f07c12dfb51492cd598f685de6fd542c))





# [3.11.0](https://github.com/takomo-io/takomo/compare/v3.10.0...v3.11.0) (2021-04-20)


### Features

* **deployment targets:** add support to select deployment targets by label ([#217](https://github.com/takomo-io/takomo/issues/217)) ([51bd726](https://github.com/takomo-io/takomo/commit/51bd726c2bad8d7bb0b5e5c01e28ae61e5ba44c1)), closes [#206](https://github.com/takomo-io/takomo/issues/206)
* **deployment targets:** allow wildcards in deployment target names ([#212](https://github.com/takomo-io/takomo/issues/212)) ([e513510](https://github.com/takomo-io/takomo/commit/e51351094910506a2783749121e8f5a71c0c47c1)), closes [#205](https://github.com/takomo-io/takomo/issues/205)
* **hooks:** add option to capture only the last line written in stdout ([#216](https://github.com/takomo-io/takomo/issues/216)) ([0396198](https://github.com/takomo-io/takomo/commit/0396198d8b2cd6ddc803c76b986f248989ef8e97)), closes [#214](https://github.com/takomo-io/takomo/issues/214)
* **hooks:** expose stack region to shell command executed by cmd hook ([#210](https://github.com/takomo-io/takomo/issues/210)) ([69f5e0a](https://github.com/takomo-io/takomo/commit/69f5e0a6d49fa733df1c8f40aa2564ec122ea9d2)), closes [#207](https://github.com/takomo-io/takomo/issues/207)
* **resolvers:** add option to capture the last line of cmd resolver output ([#218](https://github.com/takomo-io/takomo/issues/218)) ([3d1c5e9](https://github.com/takomo-io/takomo/commit/3d1c5e943e3f5cee706a5f95bf99d6b7a7ff4266)), closes [#215](https://github.com/takomo-io/takomo/issues/215)
* **resolvers:** add option to expose stack region and credentials to cmd resolver ([#213](https://github.com/takomo-io/takomo/issues/213)) ([8f72fc8](https://github.com/takomo-io/takomo/commit/8f72fc8a0762336767cec65947d74ef4440cd25b)), closes [#211](https://github.com/takomo-io/takomo/issues/211)
* **stacks:** expose stack group parent in stack config file ([#209](https://github.com/takomo-io/takomo/issues/209)) ([b3b8109](https://github.com/takomo-io/takomo/commit/b3b8109d5d9cd6f73ff077b15e9295e38d233ed9)), closes [#208](https://github.com/takomo-io/takomo/issues/208)





# [3.10.0](https://github.com/takomo-io/takomo/compare/v3.9.0...v3.10.0) (2021-04-14)

**Note:** Version bump only for package Takomo





# [3.9.0](https://github.com/takomo-io/takomo/compare/v3.8.0...v3.9.0) (2021-04-12)


### Features

* optimize stack event polling to minimize requests towards AWS APIs ([52715a6](https://github.com/takomo-io/takomo/commit/52715a64dfc7d70b3ba4acce07300421a9300ef9))





# [3.8.0](https://github.com/takomo-io/takomo/compare/v3.7.0...v3.8.0) (2021-04-08)


### Features

* **deployment targets:** add feature flags to disable undeploy and tear down commands ([#197](https://github.com/takomo-io/takomo/issues/197)) ([61e5031](https://github.com/takomo-io/takomo/commit/61e5031fab497a54073b02b6f78ccb6a58c9c44e)), closes [#196](https://github.com/takomo-io/takomo/issues/196)





# [3.7.0](https://github.com/takomo-io/takomo/compare/v3.6.0...v3.7.0) (2021-04-01)


### Bug Fixes

* **deployment targets:** fix displaying of account id deployment targets plan review ([1569e53](https://github.com/takomo-io/takomo/commit/1569e53b38b25da386e078ac9a2c0981d7bf3828))


### Features

* **credentials:** implement support for MFA when initializing default credentials ([#195](https://github.com/takomo-io/takomo/issues/195)) ([3a2b3dd](https://github.com/takomo-io/takomo/commit/3a2b3dd67aaa9832617c6c997b8c895643de0893)), closes [#194](https://github.com/takomo-io/takomo/issues/194)





# [3.6.0](https://github.com/takomo-io/takomo/compare/v3.5.1...v3.6.0) (2021-03-28)


### Bug Fixes

* **deployment-targets:** add missing vars to deployment targets config schema ([#187](https://github.com/takomo-io/takomo/issues/187)) ([6b3a387](https://github.com/takomo-io/takomo/commit/6b3a38705b6b9446581d66d188ba8a423f41089b))


### Features

* enable support for source maps ([#193](https://github.com/takomo-io/takomo/issues/193)) ([24a1688](https://github.com/takomo-io/takomo/commit/24a1688a78ad8708f1e264431abe2e2f7266020e)), closes [#191](https://github.com/takomo-io/takomo/issues/191)
* **deployment targets:** add more validation to deployment targets ([7b57ca7](https://github.com/takomo-io/takomo/commit/7b57ca76e6aa67de23cee1dded88c7fcf0eb4eae))
* **deployment targets:** add support to configure validation schemas for deployment targets ([#190](https://github.com/takomo-io/takomo/issues/190)) ([a8dbbd9](https://github.com/takomo-io/takomo/commit/a8dbbd9186f6a19077d443ff7b5ac2da4ae5a6e5)), closes [#188](https://github.com/takomo-io/takomo/issues/188)
* **deployment targets:** improve deployment targets plan ([#189](https://github.com/takomo-io/takomo/issues/189)) ([1f62615](https://github.com/takomo-io/takomo/commit/1f6261565b389345584b7efc1e3c5fea85fb1723))





## [3.5.1](https://github.com/takomo-io/takomo/compare/v3.5.0...v3.5.1) (2021-03-22)


### Bug Fixes

* **parameters:** allow empty string as parameter value ([#185](https://github.com/takomo-io/takomo/issues/185)) ([4bcd54a](https://github.com/takomo-io/takomo/commit/4bcd54acc9587be625862f153e6f566a29a063ed)), closes [#184](https://github.com/takomo-io/takomo/issues/184)





# [3.5.0](https://github.com/takomo-io/takomo/compare/v3.4.2...v3.5.0) (2021-03-21)


### Features

* **hooks:** add option to expose stack aws crendentials to cmd hook ([#178](https://github.com/takomo-io/takomo/issues/178)) ([497d328](https://github.com/takomo-io/takomo/commit/497d3288b25e5564a1edb89bf504ead97b6ddce1)), closes [#177](https://github.com/takomo-io/takomo/issues/177)
* **resolvers:** implement file-contents parameter resolver ([#180](https://github.com/takomo-io/takomo/issues/180)) ([7cb54e2](https://github.com/takomo-io/takomo/commit/7cb54e223cbe3c848cee3a04d768ab566df8d602)), closes [#179](https://github.com/takomo-io/takomo/issues/179)
* load deployment targets from an external repository ([#176](https://github.com/takomo-io/takomo/issues/176)) ([3b4baaf](https://github.com/takomo-io/takomo/commit/3b4baafa78691e7f76e01ba6f1476f0c0578343a)), closes [#172](https://github.com/takomo-io/takomo/issues/172)





## [3.4.2](https://github.com/takomo-io/takomo/compare/v3.4.1...v3.4.2) (2021-03-18)


### Bug Fixes

* **review:** fix reviewing of stack tags ([#175](https://github.com/takomo-io/takomo/issues/175)) ([6df265f](https://github.com/takomo-io/takomo/commit/6df265f7f4810f7d3125497d50e32892e7323d3e)), closes [#174](https://github.com/takomo-io/takomo/issues/174)





## [3.4.1](https://github.com/takomo-io/takomo/compare/v3.4.0...v3.4.1) (2021-03-17)


### Bug Fixes

* fix reviewing of stack parameters ([#171](https://github.com/takomo-io/takomo/issues/171)) ([d16c6c7](https://github.com/takomo-io/takomo/commit/d16c6c79cdc85723dc8f8a3929e35ea8fd4362de)), closes [#170](https://github.com/takomo-io/takomo/issues/170)





# [3.4.0](https://github.com/takomo-io/takomo/compare/v3.3.0...v3.4.0) (2021-03-08)


### Bug Fixes

* correct output of termination protection ([79eb950](https://github.com/takomo-io/takomo/commit/79eb950f819bd1dcce55d08222586c40ae9766dc))
* fix creating of deploy/undeploy plan when interactive command path selection is used ([#167](https://github.com/takomo-io/takomo/issues/167)) ([a406c2d](https://github.com/takomo-io/takomo/commit/a406c2dc53c5d861861d2120f73a8a30530bef7d)), closes [#166](https://github.com/takomo-io/takomo/issues/166)
* fix formatting of tables with colored values ([#165](https://github.com/takomo-io/takomo/issues/165)) ([b4a4ab5](https://github.com/takomo-io/takomo/commit/b4a4ab5ac7cdfa9c905cb2af4eda8f1e630af4eb))


### Features

* add support to load custom parameter resolvers from NPM packages ([#164](https://github.com/takomo-io/takomo/issues/164)) ([8d1a5e8](https://github.com/takomo-io/takomo/commit/8d1a5e8b8786804b39dd0ade31954c6c2d159385)), closes [#163](https://github.com/takomo-io/takomo/issues/163)





# [3.3.0](https://github.com/takomo-io/takomo/compare/v3.2.2...v3.3.0) (2021-02-22)


### Features

* expose stack parameters as object in stack template file ([#159](https://github.com/takomo-io/takomo/issues/159)) ([ee51de4](https://github.com/takomo-io/takomo/commit/ee51de4fda498daec053eb98894e4a387f3a72f1)), closes [#150](https://github.com/takomo-io/takomo/issues/150)
* improve stack template diff output ([4d387e1](https://github.com/takomo-io/takomo/commit/4d387e105b0c8a7e3eebe15a6807b7e7365812c6)), closes [#161](https://github.com/takomo-io/takomo/issues/161)
* load supported regions from takomo.yml project configuration file ([#160](https://github.com/takomo-io/takomo/issues/160)) ([dd1338e](https://github.com/takomo-io/takomo/commit/dd1338e5ba410e2e5ba24cdde9bb7be50e8df807)), closes [#147](https://github.com/takomo-io/takomo/issues/147)





## [3.2.2](https://github.com/takomo-io/takomo/compare/v3.2.1...v3.2.2) (2021-02-20)


### Bug Fixes

* fix validating of allowed accounts when undeploying stacks ([#158](https://github.com/takomo-io/takomo/issues/158)) ([807605d](https://github.com/takomo-io/takomo/commit/807605d2e8befad7a9567f74fb40b253bbbf76cb)), closes [#157](https://github.com/takomo-io/takomo/issues/157)





## [3.2.1](https://github.com/takomo-io/takomo/compare/v3.2.0...v3.2.1) (2021-02-18)


### Bug Fixes

* fix a bug in undeploy stacks command ([#155](https://github.com/takomo-io/takomo/issues/155)) ([046370b](https://github.com/takomo-io/takomo/commit/046370bba580bf07bca46904c4505e593d7c1d19)), closes [#154](https://github.com/takomo-io/takomo/issues/154)





# [3.2.0](https://github.com/takomo-io/takomo/compare/v3.1.0...v3.2.0) (2021-02-16)


### Features

* add support for relative stack paths ([#149](https://github.com/takomo-io/takomo/issues/149)) ([33854d0](https://github.com/takomo-io/takomo/commit/33854d0c23fc54a618d496fc9b8d8f6e318e70eb)), closes [#53](https://github.com/takomo-io/takomo/issues/53)





# [3.1.0](https://github.com/takomo-io/takomo/compare/v3.0.1...v3.1.0) (2021-02-14)


### Bug Fixes

* fix dependencies ([efb7e91](https://github.com/takomo-io/takomo/commit/efb7e916280e2563faca00055c883cfe01b0abf2))
* fix imports ([a7df59b](https://github.com/takomo-io/takomo/commit/a7df59b88690b2fcb844bf177014b55b0e0745e3))


### Features

* add option to specify organizational unit to create account command ([#144](https://github.com/takomo-io/takomo/issues/144)) ([fe543f0](https://github.com/takomo-io/takomo/commit/fe543f0491cbbd69f26bc695a8b4e40126d8df1d)), closes [#143](https://github.com/takomo-io/takomo/issues/143)
* add support to register custom Joi schemas that can be used to validate configuration ([#139](https://github.com/takomo-io/takomo/issues/139)) ([e9b6447](https://github.com/takomo-io/takomo/commit/e9b64475d0c4ff4b81694aa333560311fa6ce18f)), closes [#137](https://github.com/takomo-io/takomo/issues/137)
* implement loading of accounts from external repository ([#142](https://github.com/takomo-io/takomo/issues/142)) ([953250e](https://github.com/takomo-io/takomo/commit/953250e57b6f0c3349cf94d2636619f9521682c4)), closes [#140](https://github.com/takomo-io/takomo/issues/140)
* persist created accounts using account repository ([#146](https://github.com/takomo-io/takomo/issues/146)) ([69a0231](https://github.com/takomo-io/takomo/commit/69a02312d6ed4da64a7cf6d45d4f62b883afa791)), closes [#141](https://github.com/takomo-io/takomo/issues/141)





## [3.0.1](https://github.com/takomo-io/takomo/compare/v3.0.0...v3.0.1) (2021-01-31)

**Note:** Version bump only for package Takomo





# [3.0.0](https://github.com/takomo-io/takomo/compare/v3.0.0-alpha.5...v3.0.0) (2021-01-23)

**Note:** Version bump only for package Takomo





# [3.0.0-alpha.5](https://github.com/takomo-io/takomo/compare/v3.0.0-alpha.4...v3.0.0-alpha.5) (2021-01-20)


### Bug Fixes

* fix handling of parameters with default values, change set review details ([9ba7012](https://github.com/takomo-io/takomo/commit/9ba70127a6940fec649f922161a280c7965f71e6))





# [3.0.0-alpha.4](https://github.com/takomo-io/takomo/compare/v3.0.0-alpha.3...v3.0.0-alpha.4) (2021-01-18)


### Bug Fixes

* fix inheritance of tags ([edfd5e7](https://github.com/takomo-io/takomo/commit/edfd5e75b1b3221fe4c0ffe4f7f1a882aec0c0c6))
* fix tests ([96fd0e0](https://github.com/takomo-io/takomo/commit/96fd0e0599a407479ec0fd48f3a6cb77da2881a5))


### Features

* add option to disabled dynamic template processing ([efa59aa](https://github.com/takomo-io/takomo/commit/efa59aa9ad13226b284faf5a6c080c02d966079a))





# [3.0.0-alpha.3](https://github.com/takomo-io/takomo/compare/v3.0.0-alpha.2...v3.0.0-alpha.3) (2021-01-17)


### Bug Fixes

* fix loading of the current Takomo version from package.json ([e4e1632](https://github.com/takomo-io/takomo/commit/e4e1632402639df1930db5f3989760c9d16142ba))





# [3.0.0-alpha.2](https://github.com/takomo-io/takomo/compare/v3.0.0-alpha.1...v3.0.0-alpha.2) (2021-01-17)


### Features

* improve organization commands ([ebfabc1](https://github.com/takomo-io/takomo/commit/ebfabc15d5baf39b85b49140b379d779ee15b9f5))
* improve organization commands error handling ([691512c](https://github.com/takomo-io/takomo/commit/691512c174253db0ab18cb0ffd5915574be798ff))





# [3.0.0-alpha.1](https://github.com/takomo-io/takomo/compare/v3.0.0-alpha.0...v3.0.0-alpha.1) (2021-01-15)


### Bug Fixes

* fix failing tests ([2c26156](https://github.com/takomo-io/takomo/commit/2c2615638348f01864bf4f39250c42f75f91b8f2))


### Features

* improve error handling and validation ([bca09ed](https://github.com/takomo-io/takomo/commit/bca09ed5b88ee6148122a380be29e929dcb5b8b5))





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

**Note:** Version bump only for package takomo-project





# [2.12.0](https://github.com/takomo-io/takomo/compare/v2.11.1...v2.12.0) (2020-10-30)


### Features

* add additional file extensions for dynamic stack templates ([#131](https://github.com/takomo-io/takomo/issues/131)) ([3a69873](https://github.com/takomo-io/takomo/commit/3a6987344d4224649b7b8a47530a9282bf53cd8c)), closes [#127](https://github.com/takomo-io/takomo/issues/127)
* expose stack parameters to Handlebars stack template ([#130](https://github.com/takomo-io/takomo/issues/130)) ([7d22f06](https://github.com/takomo-io/takomo/commit/7d22f06559975204ae1b380db0c02f97d2a585cc)), closes [#125](https://github.com/takomo-io/takomo/issues/125)





## [2.11.1](https://github.com/takomo-io/takomo/compare/v2.11.0...v2.11.1) (2020-10-20)


### Bug Fixes

* add NetworkingError to the list of retryable errors ([#124](https://github.com/takomo-io/takomo/issues/124)) ([cc830b4](https://github.com/takomo-io/takomo/commit/cc830b42253cd3d23c91215e2cf5a49ff94f1b74)), closes [#121](https://github.com/takomo-io/takomo/issues/121)
* fix schema validation of resolvers ([#123](https://github.com/takomo-io/takomo/issues/123)) ([c035cc1](https://github.com/takomo-io/takomo/commit/c035cc1c55b92d5112fa566d362140cd2aa70c77)), closes [#122](https://github.com/takomo-io/takomo/issues/122)





# [2.11.0](https://github.com/takomo-io/takomo/compare/v2.10.1...v2.11.0) (2020-10-17)


### Bug Fixes

* fix tests ([69940fa](https://github.com/takomo-io/takomo/commit/69940fa4b012b006d367a19e5e762a75c283fed3))


### Features

* add CLI commands to create and delete account aliases ([#119](https://github.com/takomo-io/takomo/issues/119)) ([56571e4](https://github.com/takomo-io/takomo/commit/56571e45e8e6b52976c5f4323c20e9e3a8280b2f)), closes [#75](https://github.com/takomo-io/takomo/issues/75)





## [2.10.1](https://github.com/takomo-io/takomo/compare/v2.10.0...v2.10.1) (2020-10-13)


### Bug Fixes

* fix a bug in sorting of stacks for deploy and undeploy ([#117](https://github.com/takomo-io/takomo/issues/117)) ([338ef09](https://github.com/takomo-io/takomo/commit/338ef0917f66cf7df1241dd4a8bce418e3acb615)), closes [#110](https://github.com/takomo-io/takomo/issues/110)





# [2.10.0](https://github.com/takomo-io/takomo/compare/v2.9.0...v2.10.0) (2020-10-11)


### Bug Fixes

* fix reviewing of stacks whose template uses 'AWS::Serverless-2016-10-31' transformation ([#113](https://github.com/takomo-io/takomo/issues/113)) ([5f1df87](https://github.com/takomo-io/takomo/commit/5f1df87fe8a65df8345bac2eb8cfdc8d90266043)), closes [#112](https://github.com/takomo-io/takomo/issues/112)


### Features

* add CLI command to show stacks dependency graph ([#116](https://github.com/takomo-io/takomo/issues/116)) ([20c00f2](https://github.com/takomo-io/takomo/commit/20c00f2a7f71c62f514fea72d24c6be9c1218b42)), closes [#115](https://github.com/takomo-io/takomo/issues/115)





# [2.9.0](https://github.com/takomo-io/takomo/compare/v2.8.0...v2.9.0) (2020-10-09)


### Features

* add stack statuses related to importing of resources to stacks to stack status validation ([#108](https://github.com/takomo-io/takomo/issues/108)) ([27d95ae](https://github.com/takomo-io/takomo/commit/27d95ae977d7270703befab0809925cb69f37cdd)), closes [#107](https://github.com/takomo-io/takomo/issues/107)





# [2.8.0](https://github.com/takomo-io/takomo/compare/v2.7.4...v2.8.0) (2020-10-05)


### Features

* improve loading of configuration files ([#105](https://github.com/takomo-io/takomo/issues/105)) ([574dd64](https://github.com/takomo-io/takomo/commit/574dd64b7ca6a216d57fc426467eb6570cc2f2a3)), closes [#104](https://github.com/takomo-io/takomo/issues/104)
* validate command path using new configuration tree ([#106](https://github.com/takomo-io/takomo/issues/106)) ([c8d60a8](https://github.com/takomo-io/takomo/commit/c8d60a84c8b357346db6f18a8648d64ec20f2187))





## [2.7.4](https://github.com/takomo-io/takomo/compare/v2.7.3...v2.7.4) (2020-09-27)


### Bug Fixes

* fix sorting of stacks ([#101](https://github.com/takomo-io/takomo/issues/101)) ([f7edc91](https://github.com/takomo-io/takomo/commit/f7edc918c49e04128e960aef816084f939273bfb))





## [2.7.3](https://github.com/takomo-io/takomo/compare/v2.7.2...v2.7.3) (2020-09-21)


### Bug Fixes

* fix failing tests ([#100](https://github.com/takomo-io/takomo/issues/100)) ([6f8dba4](https://github.com/takomo-io/takomo/commit/6f8dba4b1464d7b84c257e03b5796479bf26a708))





## [2.7.2](https://github.com/takomo-io/takomo/compare/v2.7.1...v2.7.2) (2020-09-07)


### Bug Fixes

* fix retrying of requests to AWS APIs ([#98](https://github.com/takomo-io/takomo/issues/98)) ([7c22d27](https://github.com/takomo-io/takomo/commit/7c22d27477eca873ff195e71a6c07245c97d4fe7)), closes [#89](https://github.com/takomo-io/takomo/issues/89)





## [2.7.1](https://github.com/takomo-io/takomo/compare/v2.7.0...v2.7.1) (2020-09-02)


### Bug Fixes

* fix handling of failed change set creation ([#97](https://github.com/takomo-io/takomo/issues/97)) ([a81d514](https://github.com/takomo-io/takomo/commit/a81d5148c154044cebdc33eaf42fb87adfbe4074)), closes [#96](https://github.com/takomo-io/takomo/issues/96)





# [2.7.0](https://github.com/takomo-io/takomo/compare/v2.6.2...v2.7.0) (2020-08-31)


### Bug Fixes

* add logic to handle stacks with termination protection enabled on undeploy ([#95](https://github.com/takomo-io/takomo/issues/95)) ([4093189](https://github.com/takomo-io/takomo/commit/409318968058ef9554afe8d23749efe6109446f4)), closes [#87](https://github.com/takomo-io/takomo/issues/87)


### Features

* expose stack object to stack configuration file ([#90](https://github.com/takomo-io/takomo/issues/90)) ([05a6f2b](https://github.com/takomo-io/takomo/commit/05a6f2b769bad3ac5157b9ffe8243a2b6396703f)), closes [#81](https://github.com/takomo-io/takomo/issues/81)
* expose stack object to stack template file ([#94](https://github.com/takomo-io/takomo/issues/94)) ([13c8fd0](https://github.com/takomo-io/takomo/commit/13c8fd09831a668a841abd09df6b011ee258dbff)), closes [#91](https://github.com/takomo-io/takomo/issues/91)
* optimize AWS API calls to minimize throttling ([#93](https://github.com/takomo-io/takomo/issues/93)) ([e05ad1f](https://github.com/takomo-io/takomo/commit/e05ad1ff3fd0902d1509b1feaa51ebb4383fb18b)), closes [#79](https://github.com/takomo-io/takomo/issues/79)





## [2.6.2](https://github.com/takomo-io/takomo/compare/v2.6.1...v2.6.2) (2020-08-27)

**Note:** Version bump only for package takomo-project





## [2.6.1](https://github.com/takomo-io/takomo/compare/v2.6.0...v2.6.1) (2020-08-20)


### Bug Fixes

* adjust throttling of AWS API calls ([da547ef](https://github.com/takomo-io/takomo/commit/da547efd835539ebdabc37e163d492bbf95662ce)), closes [#78](https://github.com/takomo-io/takomo/issues/78)





# [2.6.0](https://github.com/takomo-io/takomo/compare/v2.5.0...v2.6.0) (2020-08-18)


### Features

* expose stack group name, path and path segments as Handlebars variables into stack group config ([#77](https://github.com/takomo-io/takomo/issues/77)) ([c2a7400](https://github.com/takomo-io/takomo/commit/c2a740085ea90c4677a6bca79ae49079812dce2a)), closes [#76](https://github.com/takomo-io/takomo/issues/76)





# [2.5.0](https://github.com/takomo-io/takomo/compare/v2.4.0...v2.5.0) (2020-07-28)


### Features

* add support for AWS backup trusted service for organization management ([#73](https://github.com/takomo-io/takomo/issues/73)) ([7a522eb](https://github.com/takomo-io/takomo/commit/7a522eb5baf6c2ef039fd9211323b1130591372e)), closes [#70](https://github.com/takomo-io/takomo/issues/70)
* add support to enable AI services opt-out policies ([#68](https://github.com/takomo-io/takomo/issues/68)) ([3824246](https://github.com/takomo-io/takomo/commit/3824246d4f9a4c6058cd2edc03185b28173fc076)), closes [#66](https://github.com/takomo-io/takomo/issues/66)
* add support to enable backup policies ([#69](https://github.com/takomo-io/takomo/issues/69)) ([328fdd9](https://github.com/takomo-io/takomo/commit/328fdd9e68cfa32f0043cb269807dc8083db17d7)), closes [#67](https://github.com/takomo-io/takomo/issues/67)
* improve organization deployment ([#72](https://github.com/takomo-io/takomo/issues/72)) ([6104896](https://github.com/takomo-io/takomo/commit/6104896c1b90654ddb0e63de2703a7327d997c85)), closes [#71](https://github.com/takomo-io/takomo/issues/71)





# [2.4.0](https://github.com/takomo-io/takomo/compare/v2.3.0...v2.4.0) (2020-07-07)


### Features

* add CLI commands to bootstrap and tear down deployment targets ([#64](https://github.com/takomo-io/takomo/issues/64)) ([8ddd6d7](https://github.com/takomo-io/takomo/commit/8ddd6d7b7e6c8cd8b8db84badfdf62e1a22bd939)), closes [#63](https://github.com/takomo-io/takomo/issues/63)
* update prompts used to ask input from user ([#62](https://github.com/takomo-io/takomo/issues/62)) ([ff98787](https://github.com/takomo-io/takomo/commit/ff98787f3184246511a55496975321ff33d9598a)), closes [#31](https://github.com/takomo-io/takomo/issues/31)





# [2.3.0](https://github.com/takomo-io/takomo/compare/v2.2.1...v2.3.0) (2020-07-02)


### Features

* add accountId property to deployment targets ([#59](https://github.com/takomo-io/takomo/issues/59)) ([ad0b367](https://github.com/takomo-io/takomo/commit/ad0b367b5d745e2b869ea907bd46ccf6247220aa)), closes [#58](https://github.com/takomo-io/takomo/issues/58)
* improve error handling when parsing yaml files ([#60](https://github.com/takomo-io/takomo/issues/60)) ([2a35bda](https://github.com/takomo-io/takomo/commit/2a35bda327e3ff18aa62712eb5144431f7b9e7c7)), closes [#57](https://github.com/takomo-io/takomo/issues/57)





## [2.2.1](https://github.com/takomo-io/takomo/compare/v2.2.0...v2.2.1) (2020-07-01)


### Bug Fixes

* fix invalid version range used to check current node.js version ([bcb54b4](https://github.com/takomo-io/takomo/commit/bcb54b46359243a9d18f43a4800908344ff8a09b))





# [2.2.0](https://github.com/takomo-io/takomo/compare/v2.1.0...v2.2.0) (2020-06-26)


### Bug Fixes

* fix handling of stacks in invalid state on the next attempt to create the stacks ([#56](https://github.com/takomo-io/takomo/issues/56)) ([78fbc2f](https://github.com/takomo-io/takomo/commit/78fbc2fb7783aa687ff2cd8257711586d569c7f9)), closes [#54](https://github.com/takomo-io/takomo/issues/54)


### Features

* show changed stack parameters on stack deployment review phase ([#55](https://github.com/takomo-io/takomo/issues/55)) ([8c45809](https://github.com/takomo-io/takomo/commit/8c458090536b9f16b7f1873be94bdcd738264361)), closes [#52](https://github.com/takomo-io/takomo/issues/52)





# [2.1.0](https://github.com/takomo-io/takomo/compare/v2.0.0...v2.1.0) (2020-06-21)


### Features

* add projectDir property to config sets ([#51](https://github.com/takomo-io/takomo/issues/51)) ([263bd17](https://github.com/takomo-io/takomo/commit/263bd175ae7748793953712da28a5d0bac7e25f0)), closes [#24](https://github.com/takomo-io/takomo/issues/24)





# [2.0.0](https://github.com/takomo-io/takomo/compare/v2.0.0-alpha.1...v2.0.0) (2020-06-15)

**Note:** Version bump only for package takomo-project





# [2.0.0-alpha.1](https://github.com/takomo-io/takomo/compare/v2.0.0-alpha.0...v2.0.0-alpha.1) (2020-06-15)

**Note:** Version bump only for package takomo-project





# [2.0.0-alpha.0](https://github.com/takomo-io/takomo/compare/v1.3.1...v2.0.0-alpha.0) (2020-06-15)


### Features

* require nodejs version 14.4.0 ([#50](https://github.com/takomo-io/takomo/issues/50)) ([da186b4](https://github.com/takomo-io/takomo/commit/da186b44aadee05fb1478f21a536d0c7b6343553)), closes [#46](https://github.com/takomo-io/takomo/issues/46)


### BREAKING CHANGES

* Takomo now requires nodejs version 14.4.0





## [1.3.1](https://github.com/takomo-io/takomo/compare/v1.3.0...v1.3.1) (2020-06-14)


### Bug Fixes

* add missing quotation to master account id in organization config file that is created along wi ([#49](https://github.com/takomo-io/takomo/issues/49)) ([df1e115](https://github.com/takomo-io/takomo/commit/df1e115928e90b64c931f6ff846b8f73d3efb5bd)), closes [#48](https://github.com/takomo-io/takomo/issues/48)
* fix bug in parsing organization config's organizational units ([#47](https://github.com/takomo-io/takomo/issues/47)) ([2b9ccf2](https://github.com/takomo-io/takomo/commit/2b9ccf2656b81d2d707cd401ce043804e94cef2e)), closes [#45](https://github.com/takomo-io/takomo/issues/45)





# [1.3.0](https://github.com/takomo-io/takomo/compare/v1.2.1...v1.3.0) (2020-06-09)


### Bug Fixes

* fix information shown to confirm creation of a new account ([#44](https://github.com/takomo-io/takomo/issues/44)) ([7a82c66](https://github.com/takomo-io/takomo/commit/7a82c669e83d3b40dd9dfd54d4172fb8363c49b3)), closes [#42](https://github.com/takomo-io/takomo/issues/42)


### Features

* add cli command to initialize a new project ([#43](https://github.com/takomo-io/takomo/issues/43)) ([7a11d55](https://github.com/takomo-io/takomo/commit/7a11d55b6e19fd46e59d614b514abe1cef2a66c3))
* add support to validate parameter resolver configuration ([#41](https://github.com/takomo-io/takomo/issues/41)) ([a70b307](https://github.com/takomo-io/takomo/commit/a70b30798c281a25f002a1a43732fc4afa8cf113)), closes [#40](https://github.com/takomo-io/takomo/issues/40)





## [1.2.1](https://github.com/takomo-io/takomo/compare/v1.2.0...v1.2.1) (2020-05-29)

**Note:** Version bump only for package takomo-project





# [1.2.0](https://github.com/takomo-io/takomo/compare/v1.1.0...v1.2.0) (2020-05-28)


### Features

* improve Handlebars error messages ([#33](https://github.com/takomo-io/takomo/issues/33)) ([875c586](https://github.com/takomo-io/takomo/commit/875c58647e925350dce58052e1f0d93c68152ad4)), closes [#32](https://github.com/takomo-io/takomo/issues/32)
* include information about OS and versions in error messages ([#37](https://github.com/takomo-io/takomo/issues/37)) ([4364be8](https://github.com/takomo-io/takomo/commit/4364be884e66ebce40099b22f6fe6a343e4c7595)), closes [#36](https://github.com/takomo-io/takomo/issues/36)





# [1.1.0](https://github.com/takomo-io/takomo/compare/v1.0.0...v1.1.0) (2020-05-18)


### Bug Fixes

* convert variables of type Map to objects when exposing them in Handlebars templates ([#28](https://github.com/takomo-io/takomo/issues/28)) ([1fdeae4](https://github.com/takomo-io/takomo/commit/1fdeae46faa5b6296c4daf1ef31b46fa8b0dfc68)), closes [#27](https://github.com/takomo-io/takomo/issues/27)


### Features

* create a minimal organization configuration file when a new organization is created ([#22](https://github.com/takomo-io/takomo/issues/22)) ([c07c0c8](https://github.com/takomo-io/takomo/commit/c07c0c8eb70eeabcb2eb453893cb1d568dd755f2)), closes [#21](https://github.com/takomo-io/takomo/issues/21)
* show required minimum IAM policy in command specific help ([#26](https://github.com/takomo-io/takomo/issues/26)) ([177cf3f](https://github.com/takomo-io/takomo/commit/177cf3fba016b33e8009cb62e6f715ddc25dc4b9)), closes [#23](https://github.com/takomo-io/takomo/issues/23)





# [1.0.0](https://github.com/takomo-io/takomo/compare/v0.2.0...v1.0.0) (2020-05-12)


### Features

* change timeout to use seconds instead of minutes ([#16](https://github.com/takomo-io/takomo/issues/16)) ([7419103](https://github.com/takomo-io/takomo/commit/74191036e27d31ef9f4cd23dd908c9e737217204)), closes [#15](https://github.com/takomo-io/takomo/issues/15)
* hook enhancements ([#11](https://github.com/takomo-io/takomo/issues/11)) ([0132e77](https://github.com/takomo-io/takomo/commit/0132e77d87be7e4961b8e489e23a6c27f842f13d)), closes [#9](https://github.com/takomo-io/takomo/issues/9)
* load existing stacks before proceeding to deploy/undeploy ([#20](https://github.com/takomo-io/takomo/issues/20)) ([082bf26](https://github.com/takomo-io/takomo/commit/082bf263830eb2996b62331c565b4fae2b9a1770)), closes [#19](https://github.com/takomo-io/takomo/issues/19)
* parameter resolver enhancements ([#12](https://github.com/takomo-io/takomo/issues/12)) ([a54d2d0](https://github.com/takomo-io/takomo/commit/a54d2d05c93a17364cc61d0606a8d9dc62aa8187)), closes [#10](https://github.com/takomo-io/takomo/issues/10)
* remove command hook 'register' property ([#18](https://github.com/takomo-io/takomo/issues/18)) ([7eb60a9](https://github.com/takomo-io/takomo/commit/7eb60a9cde1ded7cc16a83563c074149e58dba2a)), closes [#17](https://github.com/takomo-io/takomo/issues/17)
* rename organization launch CLI command ([#14](https://github.com/takomo-io/takomo/issues/14)) ([e4c9572](https://github.com/takomo-io/takomo/commit/e4c95720427e53d4e44d605d507569523d85e581)), closes [#13](https://github.com/takomo-io/takomo/issues/13)


### BREAKING CHANGES

* register property removed
* Timeout is now configured in seconds instead of minutes
* Rename 'tkm org launch' CLI command to 'tkm org deploy'
* Parameter resolver API and custom resolver configuration file have changed
* Hook output structure has changed.





# [0.2.0](https://github.com/takomo-io/takomo/compare/v0.1.0...v0.2.0) (2020-05-07)


### Bug Fixes

* correct ordering of stack events during stack deploy/undeploy operations ([cc7dd4f](https://github.com/takomo-io/takomo/commit/cc7dd4f2ec3b8708d31d5e80574bdc7750d01818)), closes [#7](https://github.com/takomo-io/takomo/issues/7)


### Features

* add new trusted aws services ([#6](https://github.com/takomo-io/takomo/issues/6)) ([5c224d3](https://github.com/takomo-io/takomo/commit/5c224d3e92b6d0ea1c426a3ba87af44f2aa80652)), closes [#5](https://github.com/takomo-io/takomo/issues/5)





# [0.1.0](https://github.com/takomo-io/takomo/compare/v0.0.2...v0.1.0) (2020-05-06)


### Bug Fixes

* fix loading of required version from Takomo project configuration file ([ff94c01](https://github.com/takomo-io/takomo/commit/ff94c0137aea4ecc05d6a0ccdbb1701865daef4f)), closes [#3](https://github.com/takomo-io/takomo/issues/3)


### Features

* add support for new regions: Milan and Capetown ([#2](https://github.com/takomo-io/takomo/issues/2)) ([5209694](https://github.com/takomo-io/takomo/commit/5209694196117e8c7e0e660491ef9d8a1dad3d46)), closes [#1](https://github.com/takomo-io/takomo/issues/1)





## 0.0.2 (2020-05-04)

**Note:** Version bump only for package takomo-project
