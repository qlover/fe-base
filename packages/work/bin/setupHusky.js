import { join } from 'path'

import { install, add } from 'husky'

import { rootPath } from '../config/path.config'

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const main = () => {
  install()
  add(
    join(rootPath, '.husky/pre-commit'),
    '#!/bin/sh\n. "$(dirname "$0")/_/husky.sh"\nnpm run lint\n'
  )
  add(join(rootPath, '.husky/commit-msg'), 'npx --no -- commitlint --edit "$1"')
}

main()
