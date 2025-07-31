# CI Workflow Guide

## Overview

Our CI system uses a single workflow file `general-check.yml` that handles all PR checks with different behaviors based on the target branch.

## Workflow Triggers

The workflow is triggered when:

- Creating a new PR
- Updating an existing PR
- Reopening a PR

## Workflow Behaviors

### Basic Checks

For all PRs, regardless of the target branch, the following checks will run:

- Code linting
- Unit tests
- Build process
- Rebuild process

### Package Checks

Package checks are additional verifications that only run when:

- The PR targets the master branch
- The PR does not have the 'CI-Release' label

## Common Development Flow

A typical development flow might look like this:

1. Feature Development:

   ```
   feature branch -> v0.7 (PR)
   └── Runs: lint, test, build, rebuild
   ```

2. Version Release:
   ```
   v0.7 -> master (PR)
   ├── Runs: lint, test, build, rebuild
   └── Additional: package checks
   ```

## Important Notes

1. All PRs go through the same basic quality checks (lint, test, build).
2. Package checks are automatically skipped for PRs not targeting master.
3. Use the 'CI-Release' label to skip all checks if needed.
4. The workflow is designed to provide consistent checks across all branches while ensuring extra verification for master.
