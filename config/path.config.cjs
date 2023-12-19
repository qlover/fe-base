const { join } = require('path')

/**
 * 项目根路径
 */
const rootPath = join(__dirname, '../')

/**
 * work 根目录
 */
const workRootPath = join(rootPath, 'work')

/**
 * src 根目录
 */
const srcRootPath = join(rootPath, 'src')

module.exports = {
  rootPath,
  workRootPath,
  srcRootPath
}
