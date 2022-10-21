# Developing guidelines

## Tools

Use Nodejs v16.17.0.

## Developing

Install dependencies to get started:

```
npm install
```

Build sources:

```
npm run build
```

Run unit tests from `test` dir:

```
npm test
```

Audit dependencies:

```
npm audit
```

Upgrade dependencies with [npm-check-updates](https://www.npmjs.com/package/npm-check-updates):

```
npx ncu  --interactive
```

Build API docs:

```
npx typedoc
```

## Integration tests

To run integration tests, you need to have credentials to Takomo's testing environment. You can ask credentials from maintainers.

Configure your personal credentials by placing `.env` file to project's root dir with following contents:

```
RECYCLER_HOSTNAME = <TEST ENV HOSTNAME>
RECYCLER_USERNAME = <YOUR USERNAME>
RECYCLER_PASSWORD = <YOUR PASSWORD>
```

**Never let others see your personal credentials.**

Integration tests are located in `integration-test` dir. CI pipeline runs all integration tests but locally you should run only one test at a time using your IDE.

## Developing features

Create a new feature branch from the latest release tag. Name your branch with `feat/` prefix.

```
git checkout tags/<tag> -b feat/<feature name>
```

For example, to start a new feature branch for "cool feature" from tag v5.0.0, run:

```
git checkout tags/v5.0.0 -b feat/cool-feature
```

Do development work in your feature branch.

## Publishing releases

We use [semantic-release](https://semantic-release.gitbook.io/semantic-release/) to handle releases.

See [release workflows](https://github.com/semantic-release/semantic-release/tree/master/docs/recipes/release-workflow).

### Branches

- master (default distribution channel)
  - When commits are pushed to the master branch, a new release is automatically made by semantic-release 
- alpha (pre-releases)
  - When commits are pushed to the alpha branch, a new pre-release is automatically made by semantic-release 
