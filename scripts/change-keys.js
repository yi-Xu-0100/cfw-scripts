/**
 * @module change_keys
 * @description The script was used to change keys for fitting [breaking changes] in clash v1.0.0.
 * [breaking changes]: https://github.com/Dreamacro/clash/wiki/breaking-changes-in-1.0.0
 */

const { notify } = require('../lib/notify');

let change_keys = (raw, { yaml, console }, { name }) => {
  try {
    console.log(`[info]: start change keys at ${new Date()}`);
    const rawObj = yaml.parse(raw);
    if (rawObj['Rule'] && rawObj['Proxy Group'] && rawObj['Proxy']) {
      console.log(`[info]: found old keys in ${name} yaml`);
      var { Rule: rules = [], 'Proxy Group': groups = [], Proxy: proxies = [] } = rawObj;
      delete rawObj['Rule'];
      delete rawObj['Proxy Group'];
      delete rawObj['Proxy'];
      var data = yaml.stringify({ ...rawObj, proxies, 'proxy-groups': groups, rules });
    } else if (rawObj['rules'] && rawObj['proxy-groups'] && rawObj['proxies']) {
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
