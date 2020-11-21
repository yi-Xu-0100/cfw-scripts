/**
 * @module change_rules
 * @description The script will use [`rule-providers`] with [Loyalsoldier/clash-rules].
 * [`rule-providers`]: https://lancellc.gitbook.io/clash/clash-config-file/rule-provider
 * [Loyalsoldier/clash-rules]: https://github.com/Loyalsoldier/clash-rules
 */

const { readFileSync, existsSync } = require('fs');
const { resolve } = require('path');
var modules_path = resolve(__dirname, '../node_modules');
const rule_providers_path = resolve(__dirname, './rule-providers.yml');

let change_rules = (raw, { yaml, console, notify }, { name, url }) => {
  try {
    // check nodes_modules
    if (existsSync(modules_path)) {
      var _notify = require('../lib/notify');
      notify = _notify.notify;
    } else console.log('[warning]: no found node_modules');

    // check yaml
    try {
      var rawObj = yaml.parse(raw);
    } catch (e) {
      if (
        e.message === 'Implicit map keys need to be on a single line' &&
        !new RegExp('^((?!www.example.com).)*$').test(url)
      ) {
        console.log('[warning]: raw is not yaml');
        rawObj = { proxies: [], 'proxy-groups': [], rules: [] };
      } else {
        console.log('[error]: check yaml fail');
        console.log(e);
        throw e;
      }
    }

    //check variables.yml
    if (!existsSync(rule_providers_path)) {
      console.log('[warning]: no found ./scripts/rule-providers.yml');
      return yaml.stringify(rawObj);
    }
    var rule_providers = yaml.parse(readFileSync(rule_providers_path, 'utf-8'));
    if (!rule_providers['proxy-groups']) {
      console.log("[warning]: no found rule_providers['proxy-groups']");
      return yaml.stringify(rawObj);
    }

    //try change rules
    console.log(`[info]: start change rules at ${new Date()}`);
    delete rawObj['proxy-groups'];
    delete rawObj['rules'];
    for (let i = 0; i < rawObj['proxies'].length; i++) {
      rule_providers['proxy-groups'][0]['proxies'].push(rawObj['proxies'][i].name);
      rule_providers['proxy-groups'][1]['proxies'].push(rawObj['proxies'][i].name);
    }
    rule_providers['proxy-groups'][0]['proxies'].unshift('DIRECT', 'AUTO');
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
