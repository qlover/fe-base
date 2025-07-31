# CI Workflow Guide

## Overview

Our CI system consists of two main workflows:

- `branch-check.yml`: Basic checks for feature branches and non-master PRs
- `general-check.yml`: Comprehensive checks for PRs targeting master

## Workflow Triggers

### Branch Check (`branch-check.yml`)

This workflow runs basic checks (lint, test, build) and is triggered when:

- Pushing to any non-master branch
- Creating/updating a PR that targets any branch except master

Example scenarios:

1. When creating a PR from `feature` to `v0.7`:
   - ✅ Triggers `branch-check.yml`
   - ❌ Does not trigger `general-check.yml`

2. When pushing new commits to `feature` or `v0.7`:
   - ✅ Triggers `branch-check.yml`
   - ❌ Does not trigger `general-check.yml`

### General Check (`general-check.yml`)

This workflow runs comprehensive checks (including package checks) and is triggered only when:

- Creating/updating a PR that targets the master branch directly
- The PR does not have the 'CI-Release' label

Example scenario:

1. When creating a PR from `v0.7` to `master`:
   - ✅ Triggers `general-check.yml`
   - ❌ Does not trigger `branch-check.yml`

## Common Development Flow

A typical development flow might look like this:

1. Feature Development:

   ```
   feature branch -> v0.7 (PR)
   ├── Triggers: branch-check.yml
   └── Runs: lint, test, build
   ```

2. Version Release:
   ```
   v0.7 -> master (PR)
   ├── Triggers: general-check.yml
   └── Runs: lint, test, build, package checks
   ```

## Important Notes

1. PRs targeting master will only trigger `general-check.yml`, ensuring comprehensive checks before merging to production.
2. All other development work (feature branches, version branches) will trigger `branch-check.yml` for faster feedback.
3. The workflows are mutually exclusive - a single PR will never trigger both workflows.
4. When a feature PR is merged to a version branch (e.g., v0.7), it won't affect the checks on the version branch's PR to master.
