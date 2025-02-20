# pack-app

A tools....

A private monorepo for managing ...

## Directory Structure

```bash
├── .github/ # GitHub config files
│ ├── workflows/ # GitHub Actions workflows
├── .vscode/ # VSCode config files
├── .husky/ # husky config files
├── packages/
│ ├── node-lib/
│ ├── node-lib2/
│ ├── ....
├── .gitignore # Git ignore files
├── package.json # project config file
└── README.md # project description
```

## Pre-check

### Commit Message Lint

Use [conventional commits](https://www.conventionalcommits.org/en/v1.0.0/) to standardize commit messages

Conventional Commits is a commit message convention, it is recommended to follow a certain format for each Git commit message. The basic format is as follows:

Example：

```bash
<type>(<scope>): <message>
```

- type: commit type, for example, feat (new feature), fix (bug fix), chore (miscellaneous tasks), etc.
- scope (optional): the scope of the feature, for example, a module or file.
- message: a brief description of the purpose of this commit.

Common commit types include:

- feat: new feature
- fix: bug fix
- docs: document modification
- style: code format related modifications (do not affect code logic)
- refactor: code refactoring
- test: add or modify tests
- chore: other modifications that do not affect the source code (such as dependency updates)

fe-release uses release-it, and the current project uses the @release-it/conventional-changelog plugin, so it needs to follow the conventional commits specification

When the project is released, it will generate the CHANGELOG.md file according to the commit information of each commit, and generate the release version according to the commit information

For example, feat: Add Docs

changelog will generate the following similar md:

```md
### Features

- feat: Add Docs [#5](https://github.com/qlover/brainai-frontend/pull/5) [25dcc5](https://github.com/qlover/brainai-frontend/pull/5/commits/25dcc5d180604f5d46bd3f114cfe0eb01dd13b90)
```

You can also use commitlint + husky to limit submissions

If you are afraid of forgetting, you can directly use the fe-commit command to complete the submission, it is interactive

### Commit Lint

When git commit, it will check whether the current submission code meets the eslint + prettier format requirements

The current project uses lint-staged to limit the code submitted, only check the code in the staging area

**Note:** When submitting too many codes, there will be a slow verification situation, please avoid submitting too many codes at once

## node-lib

```bash
npx node-lib
```

## Release

**Note:** When publishing, you need to use npm, not pnpm or yarn, because fe-release internally depends on relesae-it, and release-it only supports npm

And you need to provide a higher permission GITHUB_TOKEN, as well as NPM_TOKEN

Below is an example of how to publish `node-lib`

The current project is hosted on github, so you need to use the github workflow workflow

0. Create a corresponding release.yml file in the .github/workflow directory

1. Submit code and create a Merge PR to the `main` branch

   If there is a modification to the `packages/node-lib` directory in the current submission, the `workflows/general-check.yml` will give the current PR the `changes:packages/node-lib` label

2. After the current Merge PR is merged into the `main` branch, it will trigger `workflows/release.yml`, the same Merge PR must have `packages/node-lib/**` modifications, otherwise it will not be triggered

   - When the `release-PR` is triggered, the corresponding `npm run release-pr:node-lib` will be executed, and a Release PR will be created using the bot identity, and the `CI-Release` label will be added, and the commitlint rules will automatically process the `CHANGELOG.md` and `package.json` version number
   - When the Release PR is merged, the corresponding `npm run release:node-lib` will be executed, and the NPM and GitHub release will be published, and a unique tag will be generated

   Release PR will automatically use the patch version number

   If the .env(.env.local) setting of FE_RELEASE is false, it will skip the release

   **Note:** Only when the PR has the `changes:packages/node-lib` and `CI-Release` labels will the release be triggered, of course, you can also directly skip all steps and manually add labels to release, or delete labels to cancel the release
