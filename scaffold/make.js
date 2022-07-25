const fs = require('fs')
const { ncp } = require('ncp')

function make(contract, frontend) {

}

const renameFile = async function (oldPath, newPath) {
  return new Promise((resolve, reject) => {
    fs.rename(oldPath, newPath, (err) => {
      if (err) {
        console.error(err)
        return reject(err)
      }
      resolve()
    })
  })
}

// Wrap `ncp` tool to wait for the copy to finish when using `await`
// Allow passing `skip` variable to skip copying an array of filenames
function copyDir(source, dest, { skip, verbose } = {}) {
  return new Promise((resolve, reject) => {
    const copied = []
    const skipped = []
    const filter = skip && function (filename) {
      const shouldCopy = !skip.find(f => filename.includes(f))
      shouldCopy ? copied.push(filename) : skipped.push(filename)
      return !skip.find(f => filename.includes(f))
    }

    ncp(source, dest, { filter }, (err) => {
      if (err) return reject(err)

      if (verbose) {
        console.log('Copied:')
        copied.forEach(f => console.log('  ' + f))
        console.log('Skipped:')
        skipped.forEach(f => console.log('  ' + f))
      }

      resolve()
    })
  })
}

exports.renameFile = renameFile
exports.copyDir = copyDir
exports.make = make