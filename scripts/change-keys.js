/**
 * @module change_keys
 * @description The script was used to change keys for fitting [breaking changes] in clash v1.0.0.
 * [breaking changes]: https://github.com/Dreamacro/clash/wiki/breaking-changes-in-1.0.0
 */

const { existsSync } = require('fs');
const { resolve } = require('path');
var modules_path = resolve(__dirname, '../node_modules');

let change_keys = (raw, { yaml, console, notify }, { url, name }) => {
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

    //try change keys
    console.log(`[info]: start change keys at ${new Date()}`);
    if (rawObj['Rule'] && rawObj['Proxy Group'] && rawObj['Proxy']) {
      console.log(`[info]: found old keys in ${name} yaml`);
      var { Rule: rules = [], 'Proxy Group': groups = [], Proxy: proxies = [] } = rawObj;
      delete rawObj['Rule'];
      delete rawObj['Proxy Group'];
      delete rawObj['Proxy'];
      var data = yaml.stringify({ ...rawObj, proxies, 'proxy-groups': groups, rules });
    } else if (
      rawObj['rules'] &&
      rawObj['proxy-groups'] &&
      Object.prototype.hasOwnProperty.call(rawObj, 'proxies')
    ) {
      console.log(`[info]: found new keys in ${name} yaml`);
    } else throw Error(`keys in ${name} not found`);
    console.log(`[info]: change keys of ${name} completely`);
    return data || raw;
  } catch (e) {
    console.log(`[error]: ${e}`);
    notify(`${name} change keys failed`, e.message);
    throw e;
  }
};

module.exports.parse = change_keys;
