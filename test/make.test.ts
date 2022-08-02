import fs from 'fs';
import path from 'path';
import dir from 'node-dir';
import {createProject} from '../src/make';
import {Contract, Frontend, TestingFramework} from '../src/types';

describe('create', () => {
  const testMatrix = [
    ['js', 'react', 'workspaces-js'],
    ['js', 'vanilla', 'workspaces-js'],
    ['js', 'none', 'workspaces-js'],
    ['js', 'react', 'workspaces-rs'],
    ['js', 'vanilla', 'workspaces-rs'],
    ['js', 'none', 'workspaces-rs'],
    ['assemblyscript', 'react', 'workspaces-js'],
    ['assemblyscript', 'vanilla', 'workspaces-js'],
    ['assemblyscript', 'none', 'workspaces-js'],
    ['rust', 'react', 'workspaces-js'],
    ['rust', 'react', 'workspaces-rs'],
    ['rust', 'vanilla', 'workspaces-js'],
    ['rust', 'vanilla', 'workspaces-rs'],
    ['rust', 'none', 'workspaces-js'],
    ['rust', 'none', 'workspaces-rs'],
  ];
  const ts = Date.now();
  test.each(testMatrix)('%o %o %o', async (contract: Contract, frontend: Frontend, tests: TestingFramework) => {
    const projectName = `${contract}_${frontend}_${tests}`;
    const rootDir = path.resolve(__dirname, '../templates/');
    fs.mkdirSync(path.resolve(__dirname, `../_testrun/${ts}`), {recursive: true});
    const projectPathPrefix = path.resolve(__dirname, `../_testrun/${ts}`);
    const projectPath = path.resolve(projectPathPrefix, projectName);
    await createProject({
      contract,
      frontend,
      tests,
      projectName,
      verbose: false,
      rootDir,
      projectPath,
    });
    await new Promise<void>((resolve, reject) => {
      const allContent = [];
      dir.readFiles(projectPath,
        {exclude: ['node_modules', 'Cargo.lock', 'package-lock.json', 'yarn.lock']},
        function (err, content, next) {
          if (err) {
            reject(err);
          }
          allContent.push(content);
          next();
        },
        function (err, files) {
          if (err) {
            reject(err);
          } else {
            files.forEach((f, n) => {
              const fileName: string = f.replace(projectPathPrefix, '');
              expect([fileName, allContent[n]]).toMatchSnapshot(`${fileName}`);
            });
            resolve();
          }
        });
    });
  });
});
