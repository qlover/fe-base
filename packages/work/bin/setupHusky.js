const { join } = require('path')

const { install, add } = require('husky')

const { rootPath } = require('../config/path.config')

function main() {
  install()
  add(
    join(rootPath, '.husky/pre-commit'),
    '#!/bin/sh\n. "$(dirname "$0")/_/husky.sh"\nnpm run lint\n'
  )
  add(join(rootPath, '.husky/commit-msg'), 'npx --no -- commitlint --edit "$1"')
}

main()
