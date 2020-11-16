// eslint-disable-next-line no-unused-vars
const path = require('path')

/**
 * 根据不同的操作系统，开发环境和测试环境返回resources文件夹下的文件路径
 * @param filePath 文件路径，不用写resources
 * @returns {string}
 */
export function getAppResourcePath (filePath) {
  if (process.platform === 'darwin' || process.platform === 'linux') {
    if (process.env.NODE_ENV === 'development') {
      return path.resolve('resources/' + filePath)
    } else {
      return path.join(__dirname, '..') + filePath
    }
  } else {
    return path.resolve('resources/' + filePath)
  }
}
