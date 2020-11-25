/**
 * @module subs_info_domains
 * @description The script used to make nodes of subscription information with domains.
 */

var { readFileSync, existsSync } = require('fs');
var { resolve } = require('path');
var variable_path = resolve(__dirname, './variables.yml');
var modules_path = resolve(__dirname, '../node_modules');
var debug = false;
var current = true;
var expire = true;

let traffic = num => {
  const s = ['B', 'KB', 'MB', 'GB', 'TB'];
  let idx = 0;
  while (~~(num / 1024) && idx < s.length) {
    num /= 1024;
    idx++;
  }
  return `${idx === 0 ? num : num.toFixed(2)} ${s[idx]}`;
};

let subs_info_parse = async (raw, { yaml, axios, console, notify }, { variable }) => {
  try {
    console.log(`[info]: start fetch subscription-userinfo at ${new Date()}`);
    const { headers: { 'subscription-userinfo': info } = {} } = await axios.head(variable['url']);
    console.log(`[info]: ${variable['name']} subscription-userinfo: ${info}`);
    if (!/upload=(\d+)?; download=(\d+)?; total=(\d+)?(; expire=(\d+)?)?/.test(info)) {
      if (debug) console.log(`[debug]: variable['url']: ${variable['url']}`);
      console.log(`[warning]: No found subscription-userinfo in ${variable['name']}`);
      console.log(`[info]: fetch subscription-userinfo of ${variable['name']} completely`);
      return raw;
    }
    let upload = traffic(RegExp.$1 * 1);
    console.log(`[info]: ${variable['name']} upload: ${RegExp.$1} = ${upload}`);
    let download = traffic(RegExp.$2 * 1);
    console.log(`[info]: ${variable['name']} download: ${RegExp.$2} = ${download}`);
    let total = traffic(RegExp.$3 * 1);
    console.log(`[info]: ${variable['name']} total: ${RegExp.$3} = ${total}`);
    if (RegExp.$5) {
      var _expire = new Date(RegExp.$5 * 1000).toLocaleString();
      console.log(`[info]: ${variable['name']} expire: ${RegExp.$5} = ${_expire}`);
    } else {
      _expire = 'NOT FOUND';
      console.log(`[warring]: ${variable['name']} expire: NOT FOUND`);
    }
    let used = traffic(RegExp.$1 * 1 + RegExp.$2 * 1);
    console.log(`[info]: ${variable['name']} used: ${RegExp.$1 * 1 + RegExp.$1 * 1} = ${used}`);
    let reserve = traffic(RegExp.$3 * 1 - RegExp.$1 * 1 - RegExp.$2 * 1);
    console.log(
      `[info]: ${variable['name']} used: ${
        RegExp.$3 * 1 - RegExp.$1 * 1 - RegExp.$1 * 1
      } = ${reserve}`
    );
    var rawObj = yaml.parse(raw);
    rawObj['proxies'].push({
      name: `[${variable['name']}]剩余流量：${reserve}`,
      server: 'server',
      type: 'socks5',
      port: 443
    });
    if (
      rawObj['proxy-groups'].length === 0 ||
      rawObj['proxy-groups'][rawObj['proxy-groups'].length - 1]['name'] != 'SUBS-INFO'
    )
      rawObj['proxy-groups'].push({
        name: 'SUBS-INFO',
        type: 'select',
        proxies: []
      });

    rawObj['proxy-groups'][rawObj['proxy-groups'].length - 1]['proxies'].push(
      `[${variable['name']}]剩余流量：${reserve}`
    );
    if (expire) {
      rawObj['proxies'].push({
        name: `[${variable['name']}]到期时间：${_expire}`,
        server: 'server',
        type: 'socks5',
        port: 443
      });
      rawObj['proxy-groups'][rawObj['proxy-groups'].length - 1]['proxies'].push(
        `[${variable['name']}]到期时间：${_expire}`
      );
    }
    console.log(`[info]: fetch subscription-userinfo of ${variable['name']} completely`);
    return yaml.stringify(rawObj);
  } catch (e) {
    console.log(`[error]: ${e}`);
    notify(`${variable['name']} get subscription information failed`, e.message);
    throw e;
  }
};

let subs_info_parser = async (raw, { yaml, axios, console, notify }, { url, name }) => {
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
    if (!existsSync(variable_path)) {
      console.log('[warning]: Not found ./scripts/variables.yml');
      return yaml.stringify(rawObj);
    }
    var _variables = yaml.parse(readFileSync(variable_path, 'utf-8'));
    if (!_variables['subs_info_domains']) {
      console.log('[warning]: Not found subs_info_domains variables');
      return yaml.stringify(rawObj);
    } else var variables = _variables['subs_info_domains'];
    if (!_variables['subs_info_config']) {
      console.log('[warning]: Not found subs_info_config variables');
    } else {
      let variables_config = _variables['subs_info_config'].filter(item => item.url === url);
      if (variables_config.length != 0) {
        console.log(`[info]: set subs_info_config of ${name}`);
        if (variables_config[0]['current'] != undefined) current = variables_config[0]['current'];
        else console.log(`[warning]: Not found current of ${name} in subs_info_config`);
        if (variables_config[0]['expire'] != undefined) expire = variables_config[0]['expire'];
        else console.log(`[warning]: Not found expire of ${name} in subs_info_config`);
      } else {
        console.log(`[warning]: Not found url of ${name} in subs_info_config`);
      }
    }
    console.log(`[info]: current = ${current}`);
    console.log(`[info]: expire = ${expire}`);
    raw = yaml.stringify(rawObj);

    //try fetch subs-info
    var variables_filter = variables;
    if (!variables_filter) {
      console.log('[warning]: subs_info_domains variables not found!');
      if (current) {
        variables_filter.unshift({ url: url, name: name });
        console.log('[info]: subs_info_domains_filter variables:');
        console.log(JSON.stringify(variables_filter, null, 2));
      } else return raw;
    } else {
      console.log('[info]: subs_info_domains variables:');
      console.log(JSON.stringify(variables, null, 2));
      if (current) {
        variables_filter = variables.filter(item => item.url != url);
        variables_filter.unshift({ url: url, name: name });
        console.log('[info]: subs_info_domains_filter variables:');
        console.log(JSON.stringify(variables_filter, null, 2));
      }
    }
    for (let i = 0; i < variables_filter.length; i++) {
      console.log('[info]: variables_filter[i]:');
      console.log(variables_filter[i]);
      raw = await subs_info_parse(
        raw,
        { yaml, axios, console, notify },
        { variable: variables_filter[i] }
      );
    }
    return raw;
  } catch (e) {
    console.log(`[error]: ${e}`);
    console.log(e);
    notify(`${name} get subscription information failed`, e.message);
    throw e;
  }
};

module.exports.parse = subs_info_parser;
