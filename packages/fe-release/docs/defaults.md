## `FeReleaseDefaults` (Module)

**Type:** `module FeReleaseDefaults`

Internal constants for fe-release

User-facing default configuration lives in `release.json` and is
injected into <a href="./implments/ReleaseContext.md#releasecontext-module" class="tsd-kind-module">ReleaseContext</a> at construction time.

---

### `MANIFEST_PATH` (Variable)

**Type:** `"package.json"`

**Default:** `'package.json'`

Path to package manifest file

---

### `TEMPLATE_OPEN` (Variable)

**Type:** `"{{"`

**Default:** `'{{'`

Template opening delimiter

---

### `defaultReleaaseName` (Variable)

**Type:** `"release"`

**Default:** `'release'`

Default name for the release task context (fe-config.json key)

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

##### `PRBody` (Property)

**Type:** `"## Changelog

${changelog}"`

**Default:** `'## Changelog\n\n${changelog}'`

---

##### `PRTitle` (Property)

**Type:** `"Release ${env} ${pkgName} ${tagName}"`

**Default:** `'Release ${env} ${pkgName} ${tagName}'`

---

##### `autoMergeReleasePR` (Property)

**Type:** `false`

**Default:** `false`

---

##### `batchPRBody` (Property)

**Type:** `"

## ${name} ${version}

${changelog}
"`

**Default:** `'\n## ${name} ${version}\n${changelog}\n'`

---

##### `branchName` (Property)

**Type:** `"release/${repoName}-${releaseId}"`

**Default:** `'release/${repoName}-${releaseId}'`

---

##### `commitMessage` (Property)

**Type:** `"chore(release): ${spaces}"`

**Default:** `'chore(release): ${spaces}'`

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

**Type:** `"Release PR"`

**Default:** `'Release PR'`

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

##### `pushChangeLabels` (Property)

**Type:** `false`

**Default:** `false`

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
