# CI Workflow Guide

## Overview

Our CI system uses `general-check.yml` for quality checks and `release.yml` for publishing.

## Workflow Triggers

`general-check.yml` runs when:

- Creating a new PR
- Updating an existing PR
- Reopening a PR

PRs with the **`CI-Release`** label skip `general-check`.

## Workflow Behaviors

### Basic Checks

For all non-`CI-Release` PRs:

- Code linting
- Unit tests
- Build process
- Rebuild process

Changed packages are detected later by `fe-release` via **git diff**. PRs are no longer labeled with `changes:*`.

## Common Development Flow

1. Feature Development:

   ```
   feature branch -> develop (PR)
   └── Runs: lint, test, build, rebuild
   ```

2. Version Release:
   ```
   develop merge (PR has CI-Release)
   └── create-release-pr: fe-release version → release/* → master
   └── merge release PR to master → publish
   ```

## Important Notes

1. All regular PRs get the same basic quality checks (lint, test, build).
2. Release scope is determined by `fe-release` git diff, not PR labels.
3. To release, add `CI-Release` **before** merging into develop.
4. If already merged without the label, run the **Release sub packages** workflow manually.
