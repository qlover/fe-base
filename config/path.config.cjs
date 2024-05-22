const { join } = require('path');

/**
 * 项目根路径
 */
const rootPath = join(__dirname, '../');

/**
 * scripts 根目录
 */
const srcriptsRootPath = join(rootPath, 'scripts');

module.exports = {
  rootPath,
  srcriptsRootPath
};
