const fs = require('fs')
const {ncp} = require('ncp')
const spawn = require('cross-spawn')
const chalk = require('chalk')
const path = require('path')
const {buildPackageJson} = require('./package-json')
const {checkWorkspacesSupport} = require('./checks')

async function make({contract, frontend, projectName, verbose, rootDir}) {
  await createFiles({
    contract,
    frontend,
    projectName,
    verbose,
    rootDir,
  })

  const packageJson = buildPackageJson({
    contract,
    frontend,
    projectName,
    workspacesSupported: checkWorkspacesSupport()
  })
  fs.writeFileSync(`${projectName}/package.json`, Buffer.from(JSON.stringify(packageJson, null, 2)))

  await npmInstall({
    contract,
    projectName,
    projectPath: path.resolve(rootDir, projectName)
  })

}

async function createFiles({contract, frontend, projectName, verbose, rootDir}) {
  // skip build artifacts and symlinks
  const skip = ['.cache', 'dist', 'out', 'node_modules', 'yarn.lock', 'package-lock.json', 'contract', 'integration-tests']

  // copy frontend
  const sourceTemplateDir = rootDir + `/templates/${frontend}`
  await copyDir(sourceTemplateDir, projectName, {verbose, skip: skip.map(f => path.join(sourceTemplateDir, f))})

  // copy contract files
  const contractSourceDir = `${rootDir}/contracts/${contract}`
  await copyDir(contractSourceDir, `${projectName}/contract`, {
    verbose,
    skip: skip.map(f => path.join(contractSourceDir, f))
  })

  // copy tests
  const sourceTestDir = rootDir + '/integration-tests'
  await copyDir(sourceTestDir, `${projectName}/integration-tests/`, {
    verbose,
    skip: skip.map(f => path.join(sourceTestDir, f))
  })

  // make out dir
  fs.mkdirSync(`${projectName}/out`)

  // add .gitignore
  await renameFile(`${projectName}/near.gitignore`, `${projectName}/.gitignore`)

}

async function npmInstall({contract, projectName, projectPath}) {
  console.log('Installing project dependencies...')
  const npmCommandArgs = ['install']
  if (contract === 'assemblyscript') {
    npmCommandArgs.push('--legacy-peer-deps')
  }
  await new Promise((resolve, reject) => spawn('npm', npmCommandArgs, {
    cwd: projectPath,
    stdio: 'inherit',
  }).on('close', (code, ...args) => {
    if (code !== 0) {
      console.log(chalk.red('Error installing packages'))
      console.log(code, ...args)
      reject()
    } else {
      resolve()
    }
  }))
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
function copyDir(source, dest, {skip, verbose} = {}) {
  return new Promise((resolve, reject) => {
    const copied = []
    const skipped = []
    const filter = skip && function (filename) {
      const shouldCopy = !skip.find(f => filename.includes(f))
      shouldCopy ? copied.push(filename) : skipped.push(filename)
      return !skip.find(f => filename.includes(f))
    }

    ncp(source, dest, {filter}, (err) => {
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
exports.npmInstall = npmInstall