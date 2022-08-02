import {UserConfig} from './types';
import chalk from 'chalk';
import prompt, {PromptObject} from 'prompts';
import { program } from 'commander';

export async function getUserArgs(): Promise<UserConfig> {
  program
    .argument('[projectName]')
    .option('--contract <contract>')
    .option('--frontend <frontend>')
    .option('--tests <tests>')
    .option('--install')
    .option('--no-sandbox');


  program.parse();

  const options = program.opts();
  const [projectName] = program.args;
  const { contract, frontend, tests, sandbox, install } = options;
  return { contract, frontend, projectName, tests, sandbox, install };
}

export function validateUserArgs(args: UserConfig | null): 'error' | 'ok' | 'none' {
  if (args === null) {
    return 'error';
  }
  const { projectName, contract, frontend, tests } = args;
  const hasAllOptions = contract !== undefined && frontend !== undefined;
  const hasPartialOptions = contract !== undefined || frontend !== undefined;
  const hasProjectName = projectName !== undefined;
  const hasAllArgs = hasAllOptions && hasProjectName;
  const hasNoArgs = !hasPartialOptions && !hasProjectName;
  const optionsAreValid = hasAllOptions
    && ['react', 'vanilla', 'none'].includes(frontend)
    && ['js', 'rust', 'assemblyscript'].includes(contract)
    && ['workspaces-rs', 'workspaces-js'].includes(tests);

  if (hasNoArgs) {
    return 'none';
  } else if (hasAllArgs && optionsAreValid) {
    return 'ok';
  } else {
    return 'error';
  }
}

const userPrompts: PromptObject[] = [
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
    type: prev => prev === 'rust' ? 'select' : null,
    name: 'tests',
    message: 'Select language for Sandbox Test',
    choices: [
      { title: 'Rust Sandbox Tests', value: 'workspaces-rs' },
      { title: 'JavaScript Sandbox Tests', value: 'workspaces-js' },
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
    initial: 'hello-near',
  },
];

export async function getUserAnswers() {
  const [contract, frontend, tests, projectName] = userPrompts;

  const answers = await prompt([contract, frontend, tests, projectName]);
  if (!answers.tests) {
    answers.tests = answers.contract !== 'rust' ? 'workspaces-js' : 'workspaces-rs';
  }
  return answers;
}

export async function showProjectNamePrompt() {
  const [, , , projectName] = userPrompts;
  const answers = await prompt([projectName]);
  return answers;
}

export async function showDepsInstallPrompt() {
  const questions: PromptObject[] = [
    {
      type: 'toggle',
      name: 'depsInstall',
      // message: chalk`One last thing:\n  There are few package.json files with dependencies. We can run {bold {blue 'yarn install'}} for you.\n  Run {bold {blue 'yarn install'}} now? (To do it yourself: {blue 'yarn run deps-install'}).\n  \n`,
      message: chalk`Run {bold {blue 'npm install'}} now in all folders? (To do it yourself: {blue 'npm run deps-install'}).\n`,
      initial: true,
      active: 'yes',
      inactive: 'no'
    },
  ];

  const answers = await prompt(questions);
  return answers;
}

export function userAnswersAreValid(answers: Partial<UserConfig>): answers is UserConfig {
  const { contract, frontend, projectName, tests } = answers;
  if ([contract, frontend, projectName, tests].includes(undefined)) {
    return false;
  } else {
    return true;
  }
}
