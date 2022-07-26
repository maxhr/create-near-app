const _ = require('lodash');

function buildPackageJson({ contract, frontend, projectName, workspacesSupported }) {
  const result = basePackage({ projectName });
  const hasFrontend = frontend !== 'none';
  _.merge(result, packageHasFrontend(hasFrontend));
  switch (frontend) {
  case 'react':
    _.merge(result, frontendIsReact());
    break;
  case 'vanilla':
    _.merge(result, frontendIsVanilla());
    break;
  default:
    break;
  }
  switch (contract) {
  case 'js':
    _.merge(result, jsContract());
    _.merge(result, workspacesSupportedInJsContract(workspacesSupported));
    break;
  case 'rust':
    _.merge(result, rustContract());
    break;
  case 'assemblyscript':
    _.merge(result, asContract());
    _.merge(result, workspacesSupportedInJsContract(workspacesSupported));
    break;
  default:
    break;
  }

  return result;
}

function basePackage({ projectName }) {
  return {
    'name': projectName,
    'version': '1.0.0',
    'license': '(MIT AND Apache-2.0)',
    'scripts': {
      'deploy': 'npm run build && near dev-deploy',
      'start': 'npm run deploy',
      'dev': 'nodemon --watch contract -e ts --exec "npm run start"',
      'test': 'npm run build && npm run test:unit && npm run test:integration',
      'test:unit': 'cd contract && npm i && npm run test',
      'test:integration': 'cd integration-tests && npm run test'
    },
    'devDependencies': {
      'near-cli': '^3.3.0',
      'nodemon': '~2.0.16',
    },
    'dependencies': {}
  };
}

function workspacesSupportedInJsContract(isSupported) {
  if (isSupported) {
    return {
      'devDependencies': {
        'near-workspaces': '^2.0.0',
      },
    };
  } else {
    return {
      'dependencies': {
        'ava': '^4.2.0',
      }
    };
  }
}

function rustContract() {
  return {
    'scripts': {
      'build:contract': 'cd contract && rustup target add wasm32-unknown-unknown && cargo build --all --target wasm32-unknown-unknown --release && cp ./target/wasm32-unknown-unknown/release/greeter.wasm ../out/main.wasm',
      'test:unit': 'cd contract && cargo test',
      'test:integration': 'cd integration-tests/workspaces-rs-tests && cargo run --example integration-tests',
    }
  };
}

function asContract() {
  return {
    'scripts': {
      'build:contract': 'cd contract && npm run build && cp ./build/release/greeter.wasm ../out/main.wasm',
      'test:unit': 'cd contract && npm i && npm run test',
    },
    'dependencies': {
      'near-sdk-as': '^3.2.3',
    }
  };
}

function jsContract() {
  return {
    'scripts': {
      'build:contract': 'cd contract && npm run build && cp ./build/release/greeter.wasm ../out/main.wasm',
      'test:unit': 'cd contract && npm i && npm run test',
    }
  };
}

function packageHasFrontend(hasFrontend) {
  if (hasFrontend) {
    return {
      'scripts': {
        'build': 'npm run build:contract && npm run build:web',
        'build:web': 'parcel build frontend/index.html --public-url ./',
      },
      'dependencies': {
        'near-api-js': '^0.44.2',
      },
      'devDependencies': {
        'nodemon': '~2.0.16',
        'parcel': '^2.6.0',
        'process': '^0.11.10',
        'env-cmd': '^10.1.0',
      }
    };
  } else {
    return {
      'scripts': {
        'build': 'npm run build:contract',
      },
    };
  }
}

function frontendIsVanilla() {
  return {
    'scripts': {
      'start': 'npm run deploy && echo The app is starting! It will automatically open in your browser when ready && env-cmd -f ./neardev/dev-account.env parcel frontend/index.html --open',
    }
  };
}

function frontendIsReact() {
  return {
    'scripts': {
      'start': 'npm run deploy && echo The app is starting! It will automatically open in your browser when ready && env-cmd -f ./neardev/dev-account.env parcel frontend/index.html --open',
    },
    'devDependencies': {
      '@babel/core': '~7.18.2',
      '@babel/preset-env': '~7.18.2',
      '@babel/preset-react': '~7.17.12',
      'ava': '^4.2.0',
      'react-test-renderer': '~18.1.0',
      'ts-node': '^10.8.0',
      'typescript': '^4.7.2'
    },
    'dependencies': {
      'react': '~18.1.0',
      'react-dom': '~18.1.0',
      'regenerator-runtime': '~0.13.9'
    },
    'resolutions': {
      '@babel/preset-env': '7.13.8'
    },
    'browserslist': {
      'production': [
        '>0.2%',
        'not dead',
        'not op_mini all'
      ],
      'development': [
        'last 1 chrome version',
        'last 1 firefox version',
        'last 1 safari version'
      ]
    }
  };
}

exports.buildPackageJson = buildPackageJson;