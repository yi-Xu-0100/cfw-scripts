const { notify } = require('./lib/notify');
const { existsSync, copyFileSync } = require('fs');

async function run() {
  try {
    notify('cfw-parser', 'Notify test successfully', false);
    if (existsSync('./scripts/variables.yml')) throw Error('variables.yml occupied error');
    else {
      copyFileSync('./lib/variables.yml', './scripts/variables.yml');
      console.log('[info]: Start copy ./lib/variables.yml to ./scripts/variables.yml');
    }
    if (existsSync('./scripts/rule-providers.yml')) throw Error('rule-providers.yml occupied error');
    else {
      copyFileSync('./lib/rule-providers.yml', './scripts/rule-providers.yml');
      console.log('[info]: Start copy ./lib/rule-providers.yml to ./scripts/rule-providers.yml');
    }
  } catch (e) {
    if (e.message === 'variables.yml occupied error') {
      console.log('\x1B[31m%s\x1B[0m', `[error]: ${e.message}`);
      console.log(
        '\x1B[33m%s\x1B[0m',
        "[warning]: './scripts/variables.yml' occupied, please use 'npm run clear' to delete this file."
      );
    } else if (e.message === 'rule-providers.yml occupied error') {
      console.log('\x1B[31m%s\x1B[0m', `[error]: ${e.message}`);
      console.log(
        '\x1B[33m%s\x1B[0m',
        "[warning]: './scripts/rule-providers.yml' occupied, please use 'npm run clear' to delete this file."
      );
    } else {
      console.log(`'\x1B[31m%s\x1B[0m', [error]: ${e.message}`);
      throw e;
    }
  }
}

run();
