# Fe-release

A tool for releasing front-end projects, supporting multiple release modes and configurations, simplifying the release process and improving efficiency.

Currently, the release is based on the core functions of [release-it](https://github.com/release-it/release-it).

## Usage

```bash
npm install @qlover/fe-release
```

## Commands

```bash
fe-release [options]
```

### Options

- `-v, --version`：output the version.
- `-d, --dry-run`：do not touch or write anything, but show the commands.
- `-V, --verbose`：show more information.
- `-P, --pull-request`：create a release PR.
- `-p, --publish-path <publishPath>`：specify the path of the package to release.
- `-h, --help`：show help information.

### Examples

1. show version:

```bash
fe-release --version
# or
fe-release -v
```

2. dry run, show the commands:

```bash
fe-release --dry-run
# or
fe-release -d
```

3. create a release PR:

```bash
fe-release --pull-request
# or
fe-release -P
```

4. publish the package in the specified path:

```bash
fe-release --publish-path ./path/to/package
# or
fe-release -p ./path/to/package
```

Through the above instructions, users can better understand how to use the `fe-release` tool for project release. Hope this helps! If you have any other questions, please let me know.
