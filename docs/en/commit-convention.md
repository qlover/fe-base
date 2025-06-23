# Commit Convention Guide

This document details the commit message conventions for the fe-base project, based on the [Conventional Commits](https://www.conventionalcommits.org/) standard.

## 📋 Convention Overview

### Why Do We Need Commit Conventions?

1. **Automated CHANGELOG Generation** - Automatically generate version logs based on commit types
2. **Semantic Versioning** - Automatically determine version number increment types
3. **Improved Code Readability** - Clear commit history facilitates code reviews
4. **Team Collaboration Efficiency** - Unified format reduces communication costs
5. **CI/CD Integration** - Supports automated release workflows

### Basic Format

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

## 🏷️ Commit Types

### Primary Types

| Type       | Description                                 | Version Impact | Show in CHANGELOG |
| ---------- | ------------------------------------------- | -------------- | ----------------- |
| `feat`     | New feature                                 | Minor          | ✅                |
| `fix`      | Bug fix                                     | Patch          | ✅                |
| `docs`     | Documentation updates                       | -              | ✅                |
| `refactor` | Code refactoring                            | -              | ✅                |
| `perf`     | Performance optimization                    | Patch          | ✅                |
| `build`    | Build system or external dependency changes | -              | ✅                |

### Auxiliary Types

| Type     | Description         | Version Impact | Show in CHANGELOG |
| -------- | ------------------- | -------------- | ----------------- |
| `test`   | Testing related     | -              | ❌                |
| `chore`  | Other miscellaneous | -              | ❌                |
| `style`  | Code formatting     | -              | ❌                |
| `ci`     | CI/CD configuration | -              | ❌                |
| `revert` | Revert commit       | -              | ❌                |

### Special Types

| Type              | Description      | Version Impact | Show in CHANGELOG |
| ----------------- | ---------------- | -------------- | ----------------- |
| `BREAKING CHANGE` | Breaking changes | Major          | ✅                |
| `release`         | Release related  | -              | ❌                |

> Whether to show in changelog can be configured in `fe-config.json` under `release.changelog.types`

## 🎯 Scope

Scope is used to specify the range of impact of the commit, using lowercase letters.

### Package Scope

```bash
feat(fe-corekit): add storage utility functions
fix(fe-scripts): resolve clean command issue
test(logger): add unit tests for log levels
docs(fe-release): update release workflow guide
```

### Feature Scope

```bash
feat(animation): add fade transition effect
fix(utils): correct type definitions
docs(api): update method documentation
perf(serializer): optimize JSON parsing performance
```

### Configuration Scope

```bash
build(rollup): update bundle configuration
ci(github): add release workflow
chore(deps): update dependencies
style(eslint): fix linting warnings
```

### General Scope

```bash
docs(readme): update installation guide
style(lint): fix eslint warnings
test(setup): configure vitest environment
chore(workspace): update pnpm workspace config
```

## 📝 Description

### Writing Principles

1. **Use imperative mood** - "add feature" not "added feature"
2. **Lowercase first letter** - "add new component" not "Add new component"
3. **No period at the end** - "fix bug" not "fix bug."
4. **Be concise** - Keep within 50 characters
5. **Describe what was done** - not why it was done

### Good Description Examples

```bash
✅ add storage utility functions
✅ fix memory leak in event listeners
✅ update installation documentation
✅ refactor logger logic for better performance
✅ remove deprecated API methods
```

### Bad Description Examples

```bash
❌ Added new feature
❌ Fixed some bugs
❌ Updated stuff
❌ Changes
❌ WIP
```

## 📄 Commit Body

### When to Use

- Need to explain **why** this change was made
- The change is complex and needs detailed explanation
- Contains detailed information about breaking changes

### Format Requirements

- Leave a blank line between title and body
- Each line should not exceed 72 characters
- Use imperative mood
- Can contain multiple paragraphs

### Example

```bash
feat(fe-corekit): add JSONStorage class

Add JSON storage utility with automatic serialization and expiration support.
This feature provides a unified interface for storing complex objects in
localStorage, sessionStorage, or custom storage backends.

The implementation includes:
- Automatic JSON serialization/deserialization
- TTL (time-to-live) support for cache expiration
- Pluggable storage backends
- TypeScript type safety
```

## 🔗 Footer

### Breaking Changes

```bash
feat(fe-corekit): change Logger constructor signature

BREAKING CHANGE: The Logger constructor now requires a configuration object.
Migration: `new Logger()` -> `new Logger({ level: 'info' })`
```

### Related Issues

```bash
fix(fe-scripts): resolve clean command timing issue

Fixes #123
Closes #456
Refs #789
```

### Co-authors

```bash
feat(logger): add structured logging support

Co-authored-by: John Doe <john@example.com>
Co-authored-by: Jane Smith <jane@example.com>
```

## 🛠️ Tool Configuration

### Commitizen Configuration

The project has configured Commitizen to help generate standardized commit messages.

#### Installation and Usage

```bash
# Use project-configured commitizen
pnpm commit

# Or install globally and use
npm install -g commitizen
git cz
```

#### Interactive Commit Process

```bash
? Select the type of change that you're committing: feat
? What is the scope of this change (e.g. component or file name): fe-corekit
? Write a short, imperative tense description: add storage utilities
? Provide a longer description: (optional)
? Are there any breaking changes? No
? Does this change affect any open issues? No
```

### Configuration Files

```json
// package.json
{
  "config": {
    "commitizen": {
      "path": "cz-conventional-changelog"
    }
  }
}
```

### Scope Configuration

```javascript
// .commitlint.config.js

/**
 * @type {import('@commitlint/types').UserConfig}
 */
const Configuration = {
  /*
   * Resolve and load @commitlint/config-conventional from node_modules
   * Referenced packages must be installed
   */
  extends: ['@commitlint/config-conventional'],
  /*
   * Resolve and load conventional-changelog-atom from node_modules
   * Referenced packages must be installed
   */
  parserPreset: 'conventional-changelog-atom',
  /*
   * Resolve and load @commitlint/format from node_modules
   * Referenced packages must be installed
   */
  formatter: '@commitlint/format',
  /*
   * Any rules defined here will override those in @commitlint/config-conventional
   */
  rules: {
    'type-enum': [2, 'always', ['foo']]
  },
  /*
   * Array of functions that return true to indicate commitlint should ignore the given commit message
   * The given array will be merged with predefined functions that contain the following matchers:
   *
   * - 'Merge pull request', 'Merge X into Y' or 'Merge branch X'
   * - 'Revert X'
   * - 'v1.2.3' (semantic version matcher)
   * - 'Automatic merge X' or 'Auto-merged X into Y'
   *
   * See full list at: https://github.com/conventional-changelog/commitlint/blob/master/%40commitlint/is-ignored/src/defaults.ts
   * To disable these ignore rules and always run checks, set `defaultIgnores: false` as shown below
   */
  ignores: [(commit) => commit === ''],
  /*
   * Whether to use commitlint's default ignore rules, see description above
   */
  defaultIgnores: true,
  /*
   * Custom help URL to display when checks fail
   */
  helpUrl:
    'https://github.com/conventional-changelog/commitlint/#what-is-commitlint',
  /*
   * Custom prompt configuration
   */
  prompt: {
    messages: {},
    questions: {
      type: {
        description: 'Please enter commit type:'
      }
    }
  }
};

export default Configuration;
```

More reference: [Commitlint Configuration](https://commitlint.js.org/reference/configuration.html)

## 📊 Commit Examples

### Feature Development

```bash
feat(fe-corekit): add JSONStorage with TTL support
```

### Bug Fix

```bash
fix(fe-scripts): resolve memory leak in clean command
```

### Documentation Update

```bash
docs(logger): add usage examples for structured logging
```

### Performance Optimization

```bash
perf(fe-corekit): reduce memory footprint by 30%
```

### Testing

```bash
test(logger): add unit tests for log level filtering
```

### Refactoring

```bash
refactor(fe-scripts): extract common utilities
```

## 🔄 Commit Workflow

### Single Feature Commits

```bash
feat(fe-corekit): add storage utility functions
test(fe-corekit): add tests for storage utilities
docs(fe-corekit): update API documentation
```

### Multiple Commits for Complex Features

```bash
feat(fe-corekit): add basic storage interface
feat(fe-corekit): implement JSONStorage class
feat(fe-corekit): add TTL support for storage
test(fe-corekit): add comprehensive storage tests
docs(fe-corekit): add storage usage examples
```

### Fix-related Commits

```bash
fix(fe-scripts): resolve memory leak in clean command
test(fe-scripts): add regression test for memory leak
```

### Breaking Changes

```bash
feat(logger): redesign Logger API for better extensibility

BREAKING CHANGE: Logger constructor signature has changed.
- Before: new Logger(level)
- After: new Logger({ level, format, output })

Migration guide:
- new Logger('info') -> new Logger({ level: 'info' })
- new Logger('debug') -> new Logger({ level: 'debug' })
```

## ❌ Common Mistakes

### Type Errors

```bash
❌ chore(fe-corekit): add new storage feature  # Should use feat
❌ feat(fe-corekit): fix typo                  # Should use fix
❌ fix(fe-corekit): add error handling         # Should use feat
```

**Correct way:**

```bash
✅ feat(fe-corekit): add storage feature
✅ fix(fe-corekit): resolve typo in error message
✅ feat(fe-corekit): add error handling for storage operations
```

### Scope Errors

```bash
❌ feat(packages/fe-corekit): add feature    # Don't need path
❌ feat(FE-COREKIT): add feature             # Don't use uppercase
❌ feat(fe_corekit): add feature             # Don't use underscores
```

**Correct way:**

```bash
✅ feat(fe-corekit): add storage feature
✅ fix(logger): resolve log level issue
✅ docs(fe-scripts): update command examples
```

### Description Errors

```bash
❌ feat(fe-corekit): Added new feature.      # Don't use past tense and period
❌ feat(fe-corekit): Add New Feature         # Don't capitalize first letter
❌ feat(fe-corekit): add feature and fix bug # Don't do multiple things in one commit
```

**Correct way:**

```bash
✅ feat(fe-corekit): add storage feature
✅ fix(logger): resolve memory leak
✅ docs(fe-scripts): update API examples
```

## 🎯 Best Practices

### Commit Frequency

- **Small and frequent** - Each commit should do one thing
- **Logically complete** - Ensure each commit is in a working state
- **Timely commits** - Don't accumulate too many changes

### Commit Timing

```bash
# When developing new features
$ git commit -m "feat(fe-corekit): add storage interface"
$ git commit -m "feat(fe-corekit): implement JSONStorage"
$ git commit -m "test(fe-corekit): add storage tests"

# When fixing bugs
$ git commit -m "fix(logger): resolve level filtering issue"

# When updating documentation
$ git commit -m "docs(readme): update installation guide"
```

### Commit Corrections

If commit messages are incorrect, you can use the following methods to correct them:

```bash
# Modify the last commit message
git commit --amend -m "feat(fe-corekit): add storage utilities"

# Interactive modification of historical commits
git rebase -i HEAD~3
```

### Squashing Commits

After feature branch development is complete, consider squashing related commits:

```bash
# Interactive rebase to squash commits
git rebase -i main

# Example: Squash multiple commits into one
pick abc1234 feat(fe-corekit): add storage interface
squash def5678 feat(fe-corekit): implement JSONStorage
squash ghi9012 feat(fe-corekit): add error handling
```

## 📚 Related Resources

- [Conventional Commits Official Documentation](https://www.conventionalcommits.org/)
- [Angular Commit Guidelines](https://github.com/angular/angular/blob/main/CONTRIBUTING.md#commit)
- [Commitizen Tool](https://github.com/commitizen/cz-cli)
- [Semantic Release](https://github.com/semantic-release/semantic-release)

## 📞 Support

If you encounter issues while using commit conventions:

1. Check [Project Issues](https://github.com/qlover/fe-base/issues)
2. Refer to the troubleshooting section of this document
3. Contact project maintainers
4. Check commitlint error messages for specific guidance

## 🌐 Other Language Versions

- **[🇨🇳 中文](../zh/commit-convention.md)** - Chinese version of this document
- **[🏠 Back to Home](./index.md)** - Return to English documentation home
