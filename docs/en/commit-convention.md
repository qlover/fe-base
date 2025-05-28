# Commit Convention Guide

This document provides detailed guidelines for commit message conventions in the fe-base project, based on the [Conventional Commits](https://www.conventionalcommits.org/) standard.

## 📋 Convention Overview

### Why Do We Need Commit Conventions?

1. **Automated CHANGELOG Generation** - Automatically generate version logs based on commit types
2. **Semantic Version Control** - Automatically determine version increment types
3. **Improved Code Readability** - Clear commit history facilitates code review
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

| Type | Description | Version Impact | Show in CHANGELOG |
|------|-------------|----------------|-------------------|
| `feat` | New feature | Minor | ✅ |
| `fix` | Bug fix | Patch | ✅ |
| `docs` | Documentation updates | - | ✅ |
| `refactor` | Code refactoring | - | ✅ |
| `perf` | Performance optimization | Patch | ✅ |
| `build` | Build system or external dependency changes | - | ✅ |

### Supporting Types

| Type | Description | Version Impact | Show in CHANGELOG |
|------|-------------|----------------|-------------------|
| `test` | Test-related | - | ❌ |
| `chore` | Other miscellaneous | - | ❌ |
| `style` | Code formatting | - | ❌ |
| `ci` | CI/CD configuration | - | ❌ |
| `revert` | Revert commit | - | ❌ |

### Special Types

| Type | Description | Version Impact | Show in CHANGELOG |
|------|-------------|----------------|-------------------|
| `BREAKING CHANGE` | Breaking changes | Major | ✅ |
| `release` | Release-related | - | ❌ |

## 🎯 Scope

Scope is used to specify the range affected by the commit, using lowercase letters.

### Package Scope

```bash
feat(element-sizer): add auto-resize feature
fix(element-sizer): resolve memory leak issue
test(element-sizer): add unit tests for animation
```

### Feature Scope

```bash
feat(animation): add fade transition effect
fix(utils): correct type definitions
docs(api): update method documentation
```

### Configuration Scope

```bash
build(rollup): update bundle configuration
ci(github): add release workflow
chore(deps): update dependencies
```

### General Scope

```bash
docs(readme): update installation guide
style(lint): fix eslint warnings
test(setup): configure vitest environment
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
✅ add resize animation support
✅ fix memory leak in event listeners
✅ update installation documentation
✅ refactor animation logic for better performance
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
feat(element-sizer): add auto-resize feature

Add automatic resize detection for elements when container size changes.
This feature uses ResizeObserver API for better performance compared to
polling-based solutions.

The implementation includes:
- ResizeObserver integration
- Debounced resize handling
- Fallback for older browsers
```

## 🔗 Footer

### Breaking Changes

```bash
feat(api): change method signature

BREAKING CHANGE: The `resize()` method now requires an options parameter.
Migration: `resize()` -> `resize({ animate: true })`
```

### Related Issues

```bash
fix(element-sizer): resolve animation timing issue

Fixes #123
Closes #456
Refs #789
```

### Co-authors

```bash
feat(animation): add new transition effects

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
$ pnpm commit

? Select the type of change that you're committing: (Use arrow keys)
❯ feat:     A new feature
  fix:      A bug fix
  docs:     Documentation only changes
  style:    Changes that do not affect the meaning of the code
  refactor: A code change that neither fixes a bug nor adds a feature
  perf:     A code change that improves performance
  test:     Adding missing tests or correcting existing tests

? What is the scope of this change (e.g. component or file name): element-sizer

? Write a short, imperative tense description of the change:
 add auto-resize feature

? Provide a longer description of the change: (press enter to skip)
 Add automatic resize detection using ResizeObserver API

? Are there any breaking changes? No

? Does this change affect any open issues? Yes

? Add issue references (e.g. "fix #123", "re #123".):
 closes #123
```

### Commitlint Configuration

The project uses commitlint to validate commit message format.

#### Configuration File

```javascript
// commitlint.config.js
module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat',
        'fix',
        'docs',
        'style',
        'refactor',
        'perf',
        'test',
        'build',
        'ci',
        'chore',
        'revert'
      ]
    ],
    'scope-enum': [
      2,
      'always',
      [
        'element-sizer',
        'docs',
        'config',
        'deps',
        'animation',
        'utils',
        'api',
        'types'
      ]
    ],
    'subject-case': [2, 'never', ['sentence-case', 'start-case', 'pascal-case', 'upper-case']],
    'subject-empty': [2, 'never'],
    'subject-full-stop': [2, 'never', '.'],
    'body-leading-blank': [1, 'always'],
    'body-max-line-length': [2, 'always', 72],
    'footer-leading-blank': [1, 'always'],
    'footer-max-line-length': [2, 'always', 72]
  }
};
```

### Husky Git Hooks

The project configures Git hooks to automatically validate commit messages.

```bash
# .husky/commit-msg
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

npx --no-install commitlint --edit $1
```

## 📚 Practical Examples

### New Feature Commits

```bash
# Simple new feature
feat(element-sizer): add fade animation option

# Complex new feature
feat(animation): add advanced transition system

Implement a comprehensive animation system with multiple transition types:
- Fade in/out animations
- Slide transitions
- Scale transformations
- Custom easing functions

The system supports chaining animations and provides callbacks for
animation lifecycle events.

Closes #45
```

### Bug Fix Commits

```bash
# Simple fix
fix(element-sizer): resolve memory leak in event listeners

# Complex fix
fix(animation): prevent race condition in concurrent animations

Fix a race condition that occurred when multiple animations were
triggered simultaneously on the same element. The issue was caused
by shared state between animation instances.

Changes:
- Add animation queue management
- Implement proper cleanup for interrupted animations
- Add tests for concurrent animation scenarios

Fixes #123
Refs #124
```

### Documentation Update Commits

```bash
# API documentation
docs(api): update ElementResizer constructor options

# README update
docs(readme): add installation and usage examples

# Guide documentation
docs(guide): add testing best practices section
```

### Refactoring Commits

```bash
# Code refactoring
refactor(utils): extract common animation helpers

# Architecture refactoring
refactor(core): migrate to composition-based architecture

Restructure the core module to use composition pattern instead of
inheritance. This change improves testability and makes the code
more modular.

BREAKING CHANGE: The ElementResizer class constructor signature has changed.
Migration: new ElementResizer(element, options) -> new ElementResizer({ target: element, ...options })
```

### Performance Optimization Commits

```bash
# Performance optimization
perf(animation): optimize RAF usage for better performance

# Memory optimization
perf(element-sizer): reduce memory footprint by 30%

Optimize memory usage by implementing object pooling for frequently
created animation objects and improving garbage collection patterns.

Performance improvements:
- 30% reduction in memory usage
- 15% faster animation initialization
- Better performance on low-end devices
```

### Test-related Commits

```bash
# Add tests
test(element-sizer): add unit tests for resize detection

# Fix tests
test(animation): fix flaky animation timing tests

# Test configuration
test(setup): configure vitest for browser environment
```

### Build and Configuration Commits

```bash
# Build configuration
build(rollup): add UMD bundle support

# Dependency updates
chore(deps): update vitest to v1.0.0

# CI/CD configuration
ci(github): add automated release workflow

# Development tool configuration
chore(eslint): add new rules for better code quality
```

## 🎯 Best Practices

### 1. Commit Frequency

```bash
# ✅ Good commit frequency - logically complete small changes
feat(element-sizer): add resize detection
test(element-sizer): add tests for resize detection
docs(element-sizer): update API documentation

# ❌ Bad commit frequency - overly large changes
feat(element-sizer): add complete animation system with tests and docs
```

### 2. Atomic Commits

```bash
# ✅ Atomic commits - one commit does one thing
fix(element-sizer): resolve memory leak
refactor(element-sizer): extract animation helpers

# ❌ Non-atomic commits - one commit does multiple things
fix(element-sizer): resolve memory leak and refactor code
```

### 3. Commit Timing

```bash
# ✅ Appropriate commit timing
- Complete a feature point
- Fix a bug
- Refactor a module
- Update documentation

# ❌ Inappropriate commit timing
- Code still has syntax errors
- Tests are not passing
- Feature is only half complete
```

### 4. Branch Strategy Coordination

```bash
# Feature branch
feature/add-animation-system
├── feat(animation): add basic animation framework
├── feat(animation): add fade transition
├── feat(animation): add slide transition
├── test(animation): add comprehensive test suite
└── docs(animation): add API documentation

# Fix branch
hotfix/memory-leak-fix
├── fix(element-sizer): resolve memory leak in listeners
└── test(element-sizer): add regression test for memory leak
```

## 🚨 Common Mistakes

### 1. Wrong Type Selection

```bash
# ❌ Wrong type selection
chore(element-sizer): add new resize feature  # Should use feat
fix(docs): update README                      # Should use docs
feat(test): add unit tests                    # Should use test

# ✅ Correct type selection
feat(element-sizer): add new resize feature
docs(readme): update installation guide
test(element-sizer): add unit tests for resize
```

### 2. Wrong Scope Usage

```bash
# ❌ Wrong scope usage
feat(ElementSizer): add feature              # Should use lowercase
fix(element_sizer): fix bug                  # Should use hyphens
feat(packages/element-sizer): add feature    # No need for path

# ✅ Correct scope usage
feat(element-sizer): add resize feature
fix(element-sizer): resolve animation bug
feat(animation): add transition effects
```

### 3. Wrong Description Format

```bash
# ❌ Wrong description format
feat(element-sizer): Added new feature.      # No past tense and period
feat(element-sizer): Add New Feature         # No title case
feat(element-sizer): add feature and fix bug # Don't do multiple things in one commit

# ✅ Correct description format
feat(element-sizer): add resize animation
fix(element-sizer): resolve memory leak
docs(element-sizer): update API examples
```

## 🔧 Troubleshooting

### Commit Rejected

If commit is rejected by commitlint:

```bash
# Check error message
$ git commit -m "Add new feature"
⧗   input: Add new feature
✖   subject may not be empty [subject-empty]
✖   type may not be empty [type-empty]

# Fix commit message
$ git commit -m "feat(element-sizer): add new resize feature"
```

### Modify Last Commit

```bash
# Modify commit message
git commit --amend -m "feat(element-sizer): add resize animation"

# Add file to last commit
git add forgotten-file.ts
git commit --amend --no-edit
```

### Interactive History Modification

```bash
# Modify last 3 commits
git rebase -i HEAD~3

# In editor, select commits to modify
pick abc1234 feat(element-sizer): add feature
reword def5678 fix bug  # Change to reword to modify commit message
pick ghi9012 docs: update readme
```

## 📖 Reference Resources

### Official Documentation

- [Conventional Commits Specification](https://www.conventionalcommits.org/)
- [Angular Commit Guidelines](https://github.com/angular/angular/blob/main/CONTRIBUTING.md#commit)
- [Semantic Versioning](https://semver.org/)

### Tool Documentation

- [Commitizen Documentation](https://github.com/commitizen/cz-cli)
- [Commitlint Documentation](https://commitlint.js.org/)
- [Husky Documentation](https://typicode.github.io/husky/)

### Related Links

- [How to Write Good Git Commit Messages](https://chris.beams.io/posts/git-commit/)
- [Conventional Commits Best Practices](https://www.conventionalcommits.org/en/v1.0.0/#examples)

## 📞 Support

If you encounter issues while using commit conventions:

1. Check [Project Issues](https://github.com/qlover/fe-base/issues)
2. Refer to the troubleshooting section in this document
3. Contact project maintainers
4. Check commitlint error messages for specific guidance 