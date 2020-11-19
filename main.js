const { notify } = require('./lib/notify');
const { existsSync, copyFileSync } = require('fs');

async function run() {
  try {
    notify('cfw-parser', 'Notify test successfully', false);
    if (existsSync('./scripts/variables.json')) throw Error('occupied error');
    else {
      copyFileSync('./lib/variables.json', './scripts/variables.json');
      console.log('[info]: Start copy ./lib/variables.json to ./scripts/variables.json');
    }
  } catch (e) {
    if (e.message === 'occupied error') {
      console.log('\x1B[31m%s\x1B[0m', `[error]: ${e.message}`);
      console.log(
        '\x1B[33m%s\x1B[0m',
        "[warning]: './scripts/variables.json' occupied, please use 'npm run clear' to delete this file."
      );
    } else {
      console.log(`'\x1B[31m%s\x1B[0m', [error]: ${e.message}`);
      throw e;
    }
  }
}

run();
