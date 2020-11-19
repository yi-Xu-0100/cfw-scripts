/**
 * @module change_rules
 * @description The script used to change rules.
 */

const { notify } = require('../lib/notify');
const { readFileSync } = require('fs');
const { resolve } = require('path');
const rule_providers_path = resolve(__dirname, '../lib/rule-providers.json');
let rule_providers = JSON.parse(readFileSync(rule_providers_path, 'utf-8'));

let change_rules = (raw, { yaml, console }, { name }) => {
  try {
    console.log(`[info]: start change rules at ${new Date()}`);
    var rawObj = yaml.parse(raw);
    delete rawObj['proxy-groups'];
    delete rawObj['rules'];
    for (let i = 0; i < rawObj['proxies'].length; i++) {
      rule_providers['proxy-groups'][0]['proxies'].push(rawObj['proxies'][i].name);
      rule_providers['proxy-groups'][1]['proxies'].push(rawObj['proxies'][i].name);
    }
    console.log('[info]: proxy-groups:');
    console.log(JSON.stringify(rule_providers['proxy-groups'], null, 2));
    console.log(`[info]: change rules of ${name} completely`);
    return yaml.stringify({
      ...rawObj,
      'proxy-groups': rule_providers['proxy-groups'],
      'rule-providers': rule_providers['rule-providers'],
      rules: rule_providers['rules']
    });
  } catch (e) {
    console.log(`[error]: ${e}`);
    notify(`${name} change rules failed`, e.message);
    throw e;
  }
};

module.exports.parse = change_rules;
