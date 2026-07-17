## `FeReleaseDefaults` (Module)

**Type:** `module FeReleaseDefaults`

Internal constants for fe-release

User-facing default configuration lives in `release.json` and is
injected into [ReleaseContext](./implments/ReleaseContext.md#releasecontext-module) at construction time.

---

### `defaultReleaaseName` (Variable)

**Type:** `"release"`

**Default:** `'release'`

Default name for the release task context (fe-config.json key)

---

### `MANIFEST_PATH` (Variable)

**Type:** `"package.json"`

**Default:** `'package.json'`

Path to package manifest file

---

### `releaseJson` (Variable)

**Type:** `Object`

**Default:** `{}`

---

#### `changesetVersion` (Property)

**Type:** `Object`

**Default:** `{}`

---

##### `changesetRoot` (Property)

**Type:** `".changeset"`

**Default:** `'.changeset'`

---

##### `dependencyReleaseTemplate` (Property)

**Type:** `"- Update dependency **${name}** from `${oldVersion}` to `${newVersion}`"`

**Default:** `'- Update dependency **${name}** from `${oldVersion}` to `${newVersion}`'`

---

##### `formatTemplate` (Property)

**Type:** `"

- ${scopeHeader} ${commitlint.message} ${commitLink} ${prLink}"`

**Default:** `'\n- ${scopeHeader} ${commitlint.message} ${commitLink} ${prLink}'`

---

##### `ignoreNonUpdatedPackages` (Property)

**Type:** `false`

**Default:** `false`

---

##### `increment` (Property)

**Type:** `"patch"`

**Default:** `'patch'`

---

##### `mode` (Property)

**Type:** `"version"`

**Default:** `'version'`

---

##### `types` (Property)

**Type:** `property types`

---

#### `github` (Property)

**Type:** `Object`

**Default:** `{}`

---

##### `autoMergeReleasePR` (Property)

**Type:** `false`

**Default:** `false`

---

##### `batchPRBody` (Property)

**Type:** `"

### ${name}@${newVersion}

#### ${changeTypeSection}

${changelog}
"`

**Default:** `'\n### ${name}@${newVersion}\n\n#### ${changeTypeSection}\n\n${changelog}\n'`

Per-workspace section in the PR body (single and multi package).
`${changeTypeSection}` is Patch/Minor/Major Changes from increment.

---

##### `branchName` (Property)

**Type:** `"release/${repoName}-${releaseId}"`

**Default:** `'release/${repoName}-${releaseId}'`

---

##### `commitMessage` (Property)

**Type:** `"chore(release): ${spaces}"`

**Default:** `'chore(release): ${spaces}'`

---

##### `ignoreReleasePaths` (Property)

**Type:** `property ignoreReleasePaths`

Path prefixes skipped when creating GitHub releases

---

##### `label` (Property)

**Type:** `Object`

**Default:** `{}`

---

###### `color` (Property)

**Type:** `"1A7F37"`

**Default:** `'1A7F37'`

---

###### `description` (Property)

**Type:** `"Automated release PR (merge to publish)"`

**Default:** `'Automated release PR (merge to publish)'`

---

###### `name` (Property)

**Type:** `"CI-Release"`

**Default:** `'CI-Release'`

---

##### `mergeType` (Property)

**Type:** `"squash"`

**Default:** `'squash'`

---

##### `mode` (Property)

**Type:** `"createPR"`

**Default:** `'createPR'`

---

##### `PRBody` (Property)

**Type:** `"## Changelog

${changelog}"`

**Default:** `'## Changelog\n\n${changelog}'`

---

##### `PRTitle` (Property)

**Type:** `"Release ${spaces}"`

**Default:** `'Release ${spaces}'`

Used when releasing 1–2 packages

---

##### `PRTitleMany` (Property)

**Type:** `"Release ${count} packages: ${spaces}"`

**Default:** `'Release ${count} packages: ${spaces}'`

Used when releasing more than 2 packages

---

##### `pushChangeLabels` (Property)

**Type:** `false`

**Default:** `false`

---

##### `releaseName` (Property)

**Type:** `"${name}@${version}"`

**Default:** `'${name}@${version}'`

GitHub release title template (createRelease mode)

---

##### `releaseTagName` (Property)

**Type:** `"release-tag-${count}-patch-${releaseId}"`

**Default:** `'release-tag-${count}-patch-${releaseId}'`

---

##### `skipCreateReleasePR` (Property)

**Type:** `false`

**Default:** `false`

---

#### `releaseEnv` (Property)

**Type:** `"development"`

**Default:** `'development'`

---

#### `sourceBranch` (Property)

**Type:** `"master"`

**Default:** `'master'`

---

#### `workspaces` (Property)

**Type:** `Object`

**Default:** `{}`

---

##### `includeDependencyReleases` (Property)

**Type:** `true`

**Default:** `true`

---

##### `tagMatch` (Property)

**Type:** `"${name}@*"`

**Default:** `'${name}@*'`

---

##### `tagTemplate` (Property)

**Type:** `"${name}@${version}"`

**Default:** `'${name}@${version}'`

---

### `TEMPLATE_OPEN` (Variable)

**Type:** `"{{"`

**Default:** `'{{'`

Template opening delimiter

---
