const { notify } = require('../lib/notify');

module.exports.parse = (raw, { yaml, console }, { name }) => {
  try {
    const rawObj = yaml.parse(raw);
    const { Rule: rules = [], 'Proxy Group': groups = [], Proxy: proxies = [] } = rawObj;
    delete rawObj['Rule'];
    delete rawObj['Proxy Group'];
    delete rawObj['Proxy'];
    notify(`Keys in ${name} successfully changed`, 'profile modified in new keys', false);
    return yaml.stringify({ ...rawObj, proxies, 'proxy-groups': groups, rules });
  } catch (e) {
    console.log(`[error]: ${e}`);
    notify(`${name} change keys failed`, e.message);
    throw e;
  }
};
