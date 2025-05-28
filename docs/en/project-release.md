# Project Release Guide

This document provides detailed instructions on the release process, configuration, and best practices for the fe-base project.

## 📋 Release Overview

fe-base uses an automated release process based on the [@qlover/fe-release](https://www.npmjs.com/package/@qlover/fe-release) tool. The release process consists of three main steps:

1. **MergePR Stage** - Automatically detect package changes and add tags
2. **ReleasePR Stage** - Generate changelog and version numbers
3. **Release Stage** - Automatically publish to GitHub and npm

## 🔄 Detailed Release Process

### Step 1: Create Feature Branch and Pull Request

#### 1.1 Create Feature Branch

```bash
# Create feature branch from master
git checkout master
git pull origin master
git checkout -b feature/your-feature-name

# Perform development work
# ... modify code ...

# Commit changes (follow commit conventions)
git add .
git commit -m "feat: add new feature"
git push origin feature/your-feature-name
```

> 💡 **Commit Convention**: Please refer to the [Commit Convention Guide](./commit-convention.md) for detailed commit message format requirements.

#### 1.2 Create Pull Request

Create a Pull Request on GitHub with `master` as the target branch.

#### 1.3 Add Version Increment Labels (Optional)

Add the following labels to the PR to control version number increments:

- `increment:major` - Major version increment (1.0.0 → 2.0.0)
- `increment:minor` - Minor version increment (1.0.0 → 1.1.0)  
- `increment:patch` - Patch version increment (1.0.0 → 1.0.1) **[Default]**

### Step 2: MergePR Automation

When the PR is merged into the master branch, GitHub Actions automatically performs the following operations:

#### 2.1 Detect Package Changes

The system automatically analyzes file changes in the `packages/` directory and adds tags for each modified package:

```
changes:packages/fe-corekit
changes:packages/fe-scripts
```

#### 2.2 Quality Checks

```bash
# Automatically executed check process
pnpm lint      # Code style check
pnpm test      # Run test suite
pnpm build     # Build all packages
```

#### 2.3 Generate ReleasePR

If all checks pass, the system will:
- Automatically generate changelog for each package
- Update version numbers
- Create ReleasePR

### Step 3: Publish to Repository

#### 3.1 Auto-merge ReleasePR

Based on the `autoMergeReleasePR` configuration in `fe-config.json`:

```json
{
  "release": {
    "autoMergeReleasePR": true  // Auto-merge ReleasePR
  }
}
```

#### 3.2 Publish to GitHub and npm

After ReleasePR is merged, the system automatically:
- Creates Git tags
- Publishes GitHub Release
- Publishes packages to npm registry

## ⚙️ Release Configuration

### fe-config.json Configuration Details

```json
{
  "protectedBranches": ["master", "develop"],
  "release": {
    "autoMergeReleasePR": true,
    "githubPR": {
      "commitArgs": ["--no-verify"],
      "pushChangedLabels": true
    },
    "changelog": {
      "formatTemplate": "\n- ${scopeHeader} ${commitlint.message} ${commitLink} ${prLink}",
      "commitBody": true,
      "types": [
        { "type": "feat", "section": "#### ✨ Features", "hidden": false },
        { "type": "fix", "section": "#### 🐞 Bug Fixes", "hidden": false },
        { "type": "docs", "section": "#### 📝 Documentation", "hidden": false },
        { "type": "refactor", "section": "#### ♻️ Refactors", "hidden": false },
        { "type": "perf", "section": "#### 🚀 Performance", "hidden": false },
        { "type": "build", "section": "#### 🚧 Build", "hidden": false },
        { "type": "chore", "section": "#### 🔧 Chores", "hidden": true },
        { "type": "test", "section": "#### 🚨 Tests", "hidden": true },
        { "type": "style", "section": "#### 🎨 Styles", "hidden": true },
        { "type": "ci", "section": "#### 🔄 CI", "hidden": true },
        { "type": "revert", "section": "#### ⏪ Reverts", "hidden": true },
        { "type": "release", "section": "#### 🔖 Releases", "hidden": true }
      ]
    }
  }
}
```

#### Configuration Options

- **protectedBranches**: List of protected branches
- **autoMergeReleasePR**: Whether to auto-merge ReleasePR
- **commitArgs**: Additional arguments for Git commits
- **pushChangedLabels**: Whether to push change labels
- **formatTemplate**: Changelog format template
- **types**: Commit type configuration, controls changelog grouping and display

### GitHub Actions Configuration

#### release.yml Workflow

```yaml
name: Release sub packages

on:
  pull_request:
    branches: [master]
    types: [closed]
    paths: [packages/**]

jobs:
  release-pull-request:
    # Execute when PR is merged and doesn't contain CI-Release label
    if: |
      github.event.pull_request.merged == true && 
      !contains(github.event.pull_request.labels.*.name, 'CI-Release')
    
  release:
    # Execute when PR is merged and contains CI-Release label
    if: |
      github.event.pull_request.merged == true && 
      contains(github.event.pull_request.labels.*.name, 'CI-Release')
```

### Environment Variables Configuration

Configure the following Secrets in GitHub repository settings:

```bash
# GitHub Personal Access Token (for creating PRs and Releases)
PAT_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxx

# npm publish token (for publishing to npm)
NPM_TOKEN=npm_xxxxxxxxxxxxxxxxxxxx
```

## 📝 Commit Convention

### Conventional Commits

The project uses [Conventional Commits](https://www.conventionalcommits.org/) specification:

```bash
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

#### Commit Types

| Type | Description | Example |
|------|------|------|
| `feat` | New feature | `feat(fe-corekit): add resize animation` |
| `fix` | Bug fix | `fix(fe-corekit): resolve memory leak` |
| `docs` | Documentation update | `docs(fe-corekit): update API documentation` |
| `style` | Code formatting | `style(fe-corekit): fix code formatting` |
| `refactor` | Refactoring | `refactor(fe-corekit): optimize performance` |
| `test` | Test related | `test(fe-corekit): add unit tests` |
| `chore` | Build/tools | `chore(fe-corekit): update dependencies` |

#### Scope

Scope should be the package name (without `@qlover/` prefix):

- `fe-corekit` - Core toolkit
- `fe-scripts` - Script tools
- `logger` - Logging tool
- `code2markdown` - Code conversion tool

#### Examples

```bash
# Feature development
feat(fe-corekit): add new utility function
fix(logger): resolve console output issue

# Documentation updates
docs(fe-scripts): update README with new examples
docs: update project documentation

# Build related
chore: update build configuration
chore(fe-corekit): bump dependencies
```

### Using Commitizen

The project is configured with Commitizen to help generate standardized commit messages:

```bash
# Use interactive commit
pnpm commit

# Or use git cz (if commitizen is globally installed)
git cz
```

## 🏷️ Label Management

### Automatic Labels

The system automatically adds labels for packages with changes:

```
changes:packages/fe-corekit    # Package change label
increment:minor                   # Version increment label
CI-Release                       # Release label (automatically added by system)
```

### Manual Label Management

If a package doesn't need to be released, you can manually remove the corresponding `changes:` label:

1. Find the label on the GitHub PR page
2. Click the ❌ next to the label to remove it
3. That package will not be included in this release

## 📦 Package Release Strategy

### Independent Version Management

Each package has an independent version number, not affecting each other:

```
@qlover/fe-corekit@1.2.0
@qlover/fe-scripts@0.5.1
@qlover/logger@2.1.0
```

### Dependency Relationship Handling

- **Internal Dependencies**: Inter-package dependencies automatically update version numbers
- **External Dependencies**: Need manual version range management

### Release Scope Control

You can control which packages participate in the release through labels:

```bash
# Only release fe-corekit package
# Remove changes: labels for other packages, keep changes:packages/fe-corekit
```

## 🔍 Release Status Monitoring

### GitHub Actions Status

View in the GitHub repository's Actions page:

- ✅ Build status
- ✅ Test results  
- ✅ Release status
- ❌ Failure reasons

### npm Release Status

Check if packages are successfully published to npm:

```bash
# Check package versions
npm view @qlover/fe-corekit versions --json

# Check latest version
npm view @qlover/fe-corekit version
```

### GitHub Release

View in the GitHub repository's Releases page:

- 📋 Release Notes
- 📦 List of published packages
- 🏷️ Git tags
- 📅 Release time

## 🚨 Troubleshooting

### Common Issues

#### 1. Release Failed: Insufficient Permissions

**Error Message**:
```
npm ERR! 403 Forbidden - PUT https://registry.npmjs.org/@qlover/fe-corekit
```

**Solution**:
- Check if `NPM_TOKEN` is correctly configured
- Confirm npm account has publishing permissions
- Verify package name is not already taken

#### 2. GitHub Actions Failed

**Error Message**:
```
Error: Resource not accessible by integration
```

**Solution**:
- Check `PAT_TOKEN` permission settings
- Confirm token includes `repo` and `write:packages` permissions

#### 3. Version Conflict

**Error Message**:
```
npm ERR! 409 Conflict - PUT https://registry.npmjs.org/@qlover/fe-corekit
```

**Solution**:
- Check if trying to publish an existing version
- Manually update version number or use changeset

#### 4. Build Failed

**Error Message**:
```
Build failed with exit code 1
```

**Solution**:
- Check TypeScript compilation errors
- Confirm all dependencies are properly installed
- Review detailed build logs

### Manual Release Process

If automatic release fails, you can manually execute the release:

```bash
# 1. Create changeset
pnpm changeset

# 2. Update version numbers
pnpm changeset version

# 3. Build packages
pnpm build

# 4. Publish to npm
pnpm changeset publish

# 5. Create Git tags
git tag @qlover/fe-corekit@x.x.x
git push origin --tags
```

### Rollback Release

If you need to rollback a published version:

```bash
# Unpublish from npm (within 24 hours)
npm unpublish @qlover/fe-corekit@x.x.x

# Delete Git tag
git tag -d @qlover/fe-corekit@x.x.x
git push origin :refs/tags/@qlover/fe-corekit@x.x.x

# Delete GitHub Release (manually on GitHub)
```

## 🎯 Best Practices

### 1. Pre-release Checklist

- [ ] Code passes all tests
- [ ] Documentation is updated
- [ ] Commit messages follow [commit convention](./commit-convention.md)
- [ ] CHANGELOG format is correct
- [ ] Version numbers follow semantic versioning
- [ ] Dependencies are correctly configured

### 2. Version Management Strategy

- **Patch version**: Backward-compatible bug fixes
- **Minor version**: Backward-compatible new features
- **Major version**: Non-backward-compatible breaking changes

### 3. Release Timing

- **Regular releases**: Weekly or bi-weekly releases
- **Emergency fixes**: Important bug fixes released immediately
- **Feature releases**: Released after new features are completed

### 4. Rollback Strategy

If release issues occur, you can:

```bash
# 1. Unpublish npm package (within 24 hours)
npm unpublish @qlover/fe-corekit@x.x.x

# 2. Publish fix version
npm version patch
npm publish

# 3. Update documentation explaining the issue
```

## 🔗 Related Links

- [Commit Convention Guide](./commit-convention.md)
- [@qlover/fe-release Documentation](https://www.npmjs.com/package/@qlover/fe-release)
- [Conventional Commits Specification](https://www.conventionalcommits.org/)
- [Semantic Versioning](https://semver.org/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [npm Publishing Guide](https://docs.npmjs.com/packages-and-modules/contributing-packages-to-the-registry)

## 📞 Support

If you encounter issues during the release process:

1. Check [GitHub Issues](https://github.com/qlover/fe-base/issues)
2. Review GitHub Actions execution logs
3. Contact project maintainers
4. Refer to [@qlover/fe-release](https://www.npmjs.com/package/@qlover/fe-release) documentation

## 📦 Release Examples

### Successful Release Output Example

```bash
# Output after successful release
✅ Published packages:
@qlover/fe-corekit@1.2.0
@qlover/fe-scripts@0.5.1
@qlover/logger@2.1.0

🏷️  Created tags:
@qlover/fe-corekit@1.2.0
@qlover/fe-scripts@0.5.1
@qlover/logger@2.1.0

🚀 GitHub releases created successfully
📦 npm packages published successfully
```

### Check Release Status

```bash
# View all versions of a package
npm view @qlover/fe-corekit versions --json

# View latest version of a package
npm view @qlover/fe-corekit version

# View detailed package information
npm view @qlover/fe-corekit
```

## 🧪 Testing Release

### Local Testing

Before releasing, it's recommended to perform comprehensive local testing:

```bash
# Install dependencies
pnpm install

# Run all tests
pnpm test

# Build all packages
pnpm build

# Test specific package
pnpm --filter @qlover/fe-corekit test

# Preview changelog
pnpm changeset status
```

### Release Pre-check

```bash
# Check package publishing configuration
npm pack --dry-run

# Check package contents
npm view @qlover/fe-corekit

# Verify package dependencies
npm ls @qlover/fe-corekit
```

## 📊 Release Statistics

### Recommended Release Frequency

- **Patch versions**: 1-2 times per week
- **Minor versions**: 1-2 times per month  
- **Major versions**: Once per quarter or half-year

### Release Quality Checklist

Ensure before each release:

- [ ] All tests pass
- [ ] Code coverage meets standards
- [ ] Documentation is updated
- [ ] CHANGELOG accurately describes changes
- [ ] Version numbers follow semantic versioning
- [ ] Breaking changes are documented

## 📚 Related Documentation

- [Commit Convention Guide](./commit-convention.md)
- [How to Add a Subpackage](./how-to-add-a-subpackage.md)
- [Project Builder and Dependency Management](./project-builder.md)
- [Testing Guide](./testing-guide.md)
