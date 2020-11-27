/**
 * @module auto_check_in
 * @description The script was used to automatic check in.
 * @param {string[]} [domains = []] - The site of domain will be check in.
 * @param {string[]} [keep = []] - Value of keep.
 * @param {string[]} [email = []] - Value of email.
 * @param {string[]} [pwd = []] - Value of pwd.
 */

const { readFileSync, writeFileSync, existsSync } = require('fs');
const { resolve } = require('path');
const variable_path = resolve(__dirname, './variables.yml');
var modules_path = resolve(__dirname, '../node_modules');
let debug = false;

let check_in = async (raw, { yaml, axios, console, notify }, { name, variable }) => {
  try {
    var today = new Date().toISOString().slice(0, 10);
    var rawObj = yaml.parse(raw);
    var check = false;
    var sign = false;
    var _time = new Date().toISOString();
    if (!variable['checkinDate']) {
      variable['checkinDate'] = '';
      variable['checkinMessage'] = '';
    }
    console.log(`[info]: start check in ${variable['domain']} at ${new Date()}`);
    console.log(`[info]: today: ${today}`);
    if (variable['checkinDate'] && variable['checkinDate'].slice(0, 10) === today) {
      console.log(`[info]: ${variable['domain']} has been already check in`);
      check = true;
    }

    // check sign
    if (!check && !sign) {
      try {
        console.log(`[info]: try check sign with ${variable['name']}`);
        let resp = await axios.get(`https://${variable['domain']}/user`);
        if (debug) {
          console.log(`[debug]: response of https://${variable['domain']}/user`);
          console.log(JSON.stringify(resp.data, null, 2));
        }
        sign = /用户中心/.test(resp.data);
      } catch (e) {
        check = true;
        console.log(`[error]: check sign ${variable['name']} failed`);
        console.log(`[error]: ${e}`);
        notify(`check sign ${variable['name']} failed`, e.message);
      }
    }

    //try auto sign
    if (!check && !sign) {
      try {
        console.log(`[info]: try sign in ${variable['name']}`);
        let resp = await axios.post(`https://${variable['domain']}/auth/login`, {
          email: variable['email'],
          passwd: variable['pwd'],
          remember_me: variable['keep']
        });
        if (debug) {
          console.log(`[debug]: response of https://${variable['domain']}/auth/login`);
          console.log(JSON.stringify(resp.data, null, 2));
        }
        if (/登录成功/.test(resp.data.msg)) sign = true;
      } catch (e) {
        check = true;
        console.log(`[error]: check sign ${variable['name']} failed`);
        console.log(`[error]: ${e}`);
        notify(`check sign ${variable['name']} failed`, e.message);
      }
    } else sign = true;

    //try auto check in
    if (!check && sign) {
      try {
        console.log(`[info]: try check in ${variable['name']}`);
        let resp = await axios.post(`https://${variable['domain']}/user/checkin`);
        if (debug) {
          console.log(`[debug]: response of https://${variable['domain']}/user/checkin`);
          console.log(JSON.stringify(resp.data, null, 2));
        }
        if (!variable['checkinMessage'] || !/您似乎已经签到过了/.test(resp.data.msg)) {
          console.log(`[info]: ${variable['name']} checkinDate: ${_time}`);
          console.log(`[info]: ${variable['name']} checkinMessage: ${resp.data.msg}`);
          variable['checkinDate'] = _time;
          variable['checkinMessage'] = resp.data.msg;
        } else {
          console.log(`[info]: ${variable['name']} has been already check in`);
        }
      } catch (e) {
        console.log(`[error]: check sign ${variable['name']} failed`);
        console.log(`[error]: ${e}`);
        notify(`check sign ${variable['name']} failed`, e.message);
      }
    } else console.log(`[warning]: ${variable['name']} need to sign in`);
    console.log(`[info]: rawObj['proxies']:`);
    console.log(JSON.stringify(rawObj['proxies']));
    console.log(`[info]: rawObj['proxy-groups']:`);
    console.log(JSON.stringify(rawObj['proxy-groups']));
    rawObj['proxies'].push(
      {
        name: `⏰ [${variable['name']}]签到时间：${variable['checkinDate']}`,
        server: 'server',
        type: 'socks5',
        port: 443
      },
      {
        name: `🎁 [${variable['name']}]签到消息：${variable['checkinMessage']}`,
        server: 'server',
        type: 'socks5',
        port: 443
      }
    );
    if (
      rawObj['proxy-groups'].length === 0 ||
      rawObj['proxy-groups'][rawObj['proxy-groups'].length - 1]['name'] != '🤚 CHECK-INFO'
    )
      rawObj['proxy-groups'].push({
        name: '🤚 CHECK-INFO',
        type: 'select',
        proxies: []
      });
    if (name === variable['name'])
      rawObj['proxy-groups'][rawObj['proxy-groups'].length - 1]['proxies'].unshift(
        `⏰ [${variable['name']}]签到时间：${variable['checkinDate']}`,
        `🎁 [${variable['name']}]签到消息：${variable['checkinMessage']}`
      );
    else
      rawObj['proxy-groups'][rawObj['proxy-groups'].length - 1]['proxies'].push(
        `⏰ [${variable['name']}]签到时间：${variable['checkinDate']}`,
        `🎁 [${variable['name']}]签到消息：${variable['checkinMessage']}`
      );
    console.log(`[info]: ${variable['name']} check in completely`);
    return [yaml.stringify(rawObj), variable];
  } catch (e) {
    console.log(`[error]: ${variable['name']} check in fail:`);
    console.log(e);
    notify(`${variable['name']} check in failed`, e.message);
    throw e;
  }
};

let auto_check_in = async (raw, { yaml, axios, console, notify }, { url, name }) => {
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
    console.log('[warning]: no found ./scripts/variables.yml');
    return yaml.stringify(rawObj);
  }
  var _variables = yaml.parse(readFileSync(variable_path, 'utf-8'));
  if (!_variables['auto_check_in']) {
    console.log('[warning]: no found auto_check_in variables');
    return yaml.stringify(rawObj);
  } else var variables = _variables['auto_check_in'];

  // try check in
  try {
    console.log('[info]: auto_check_in variables:');
    console.log(JSON.stringify(variables, null, 2));
    raw = yaml.stringify(rawObj);
    for (let i = 0; i < variables.length; i++) {
      [raw, variables[i]] = await check_in(
        raw,
        { yaml, axios, console, notify },
        { name, variable: variables[i] }
      );
    }
    return raw;
  } catch (e) {
    console.log(`[error]: ${e}`);
    notify(`auto-check-in failed`, e.message);
    throw e;
  } finally {
    delete _variables['auto_check_in'];
    writeFileSync(
      variable_path,
      yaml.stringify({ ..._variables, auto_check_in: variables }, null, 2),
      'utf-8'
    );
  }
};

module.exports.parse = auto_check_in;
