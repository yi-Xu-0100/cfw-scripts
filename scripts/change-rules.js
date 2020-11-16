const { notify } = require('../lib/notify');

module.exports.parse = (raw, { yaml, console }, { name }) => {
  try {
    var rawObj = yaml.parse(raw);
    rawObj['rules'].unshift('DOMAIN-SUFFIX,manhuabudang.com,DIRECT');
    console.log('[INFO]First rule added: ' + rawObj['rules'][0]);
    rawObj['rules'].unshift('DOMAIN-SUFFIX,v2ex.com,DIRECT');
    console.log('[INFO]First rule added: ' + rawObj['rules'][0]);
    rawObj['rules'].unshift('DOMAIN-SUFFIX,osapublishing.org,Proxies');
    console.log('[INFO]First rule added: ' + rawObj['rules'][0]);
    rawObj['rules'].unshift('DOMAIN-SUFFIX,phicomm.me,DIRECT');
    console.log('[INFO]First rule added: ' + rawObj['rules'][0]);
    notify(`Rules in ${name} successfully modified`, 'Personal rules successfully added', false);
    return yaml.stringify(rawObj);
  } catch (e) {
    console.log(`[error]: ${e}`);
    notify(`${name} change rules failed`, e.message);
    throw e;
  }
};
