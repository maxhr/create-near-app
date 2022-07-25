#!/usr/bin/env node
const fs = require('fs')
const os = require('os')
const path = require('path')
const yargs = require('yargs')
const cliSelect = require('cli-select')
const prompt = require('prompts')
const {renameFile, copyDir, npmInstall} = require('./scaffold/make')
const {buildPackageJson} = require('./scaffold/package-json')
const replaceInFiles = require('replace-in-files')
const spawn = require('cross-spawn')
const chalk = require('chalk')
const ncp = require('ncp').ncp
ncp.limit = 16

const mixpanel = require('./scaffold/tracking')
const { checkPrerequisites, checkUserInput, checkWorkspacesSupport } = require('./scaffold/checks')

const createProject = async function ({ contract, frontend, projectName, verbose }) {
  mixpanel.track(frontend, contract)

  console.log(chalk`Creating a new NEAR app.`)

  // skip build artifacts and symlinks
  const skip = ['.cache', 'dist', 'out', 'node_modules', 'yarn.lock', 'package-lock.json', 'contract', 'integration-tests']

  // copy frontend
  const sourceTemplateDir = __dirname + `/templates/${frontend}`
  await copyDir(sourceTemplateDir, projectName, { verbose, skip: skip.map(f => path.join(sourceTemplateDir, f)) })

  // copy contract files
  const contractSourceDir = `${__dirname}/contracts/${contract}`
  await copyDir(contractSourceDir, `${projectName}/contract`, { verbose, skip: skip.map(f => path.join(contractSourceDir, f)) })

  // copy tests
  const sourceTestDir = __dirname + '/integration-tests'
  await copyDir(sourceTestDir, `${projectName}/integration-tests/`, { verbose, skip: skip.map(f => path.join(sourceTestDir, f)) })

  // make out dir
  fs.mkdirSync(`${projectName}/out`)

  // add .gitignore
  await renameFile(`${projectName}/near.gitignore`, `${projectName}/.gitignore`)

  const packageJson = buildPackageJson({contract, frontend, projectName, workspacesSupported: checkWorkspacesSupport()})
  fs.writeFileSync(`${projectName}/package.json`, Buffer.from(JSON.stringify(packageJson, null, 2)))

  console.log('Installing project dependencies...')
  const npmCommandArgs = ['install']
  if (contract === 'assemblyscript') {
    npmCommandArgs.push('--legacy-peer-deps')
  }
  await new Promise((resolve, reject) => spawn('npm', npmCommandArgs, {
    cwd: projectName,
    stdio: 'inherit',
  }).on('close', (code, ...args) => {
    if (code !== 0) {
      console.log(chalk.red(`Error installing packages`))
      console.log(code, ...args)
      reject()
    } else {
      resolve()
    }
  }))

  // print success message
  console.log(chalk`
Success! Created ${projectName}
Inside that directory, you can run several commands:

  {bold npm run dev}
    Starts the development server. Both contract and client-side code will
    auto-reload once you change source files.

  {bold npm run test}
    Starts the test runner.
`)

  console.log(chalk`Happy hacking!`)
}

async function getUserInput() {
  const questions = [
    {
      type: 'select',
      name: 'contract',
      message: 'Select your smart-contract language',
      choices: [
        { title: 'JavaScript', value: 'js' },
        { title: 'Rust', value: 'rust' },
        { title: 'AssemblyScript', value: 'assemblyscript' },
      ]
    },
    {
      type: 'select',
      name: 'frontend',
      message: 'Select a template for your frontend',
      choices: [
        { title: 'React.js', value: 'react' },
        { title: 'Vanilla JavaScript', value: 'vanilla' },
        { title: 'No frontend', value: 'none' },
      ]
    },
    {
      type: 'text',
      name: 'projectName',
      message: 'Name your project (this will create a directory with that name)',
      initial: 'my-near-project',
      format: v => `${v}`
    },
  ];

  // const answers = await prompt(questions, {onCancel:cleanup, onSubmit:cleanup});
  const answers = await prompt(questions)
  return answers
}

(async function run() {
  const prerequisitesOk = checkPrerequisites()
  if (!prerequisitesOk) {
    return
  }
  const userInput = await getUserInput()
  const userInputOk = await checkUserInput(userInput)
  if (!userInputOk) {
    return
  }
  createProject(userInput)
})()
