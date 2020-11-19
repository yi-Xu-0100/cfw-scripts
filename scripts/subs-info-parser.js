/**
 * @module subs_info_parser
 * @description The script was used to get subscription information of domains.
 */

const { notify } = require('../lib/notify');
const { readFileSync } = require('fs');
const { resolve } = require('path');
const variable_path = resolve(__dirname, './variables.json');
let variables = JSON.parse(readFileSync(variable_path, 'utf-8'))['subs-info-parser'];
let urls = variables.urls;
let names = variables.names;

const traffic = num => {
  const s = ['B', 'KB', 'MB', 'GB', 'TB'];
  let idx = 0;
  while (~~(num / 1024) && idx < s.length) {
    num /= 1024;
    idx++;
  }
  return `${idx === 0 ? num : num.toFixed(2)} ${s[idx]}`;
};

let subs_info_parser = async (raw, { axios, console }, { name }) => {
  try {
    console.log(`[info]: start fetch subscription-userinfo at ${new Date()}`);
    if (urls.length === 0) throw Error('urls is not defined');
    if (urls.length != names.length) throw Error('variable need fully defining');
    for (let i = 0; i < urls.length; i++) {
      const { headers: { 'subscription-userinfo': info } = {} } = await axios.head(urls[i]);
      console.log(`[info]: ${names[i]} subscription-userinfo: ${info}`);
      if (!/upload=(\d+)?; download=(\d+)?; total=(\d+)?; expire=(\d+)?/.test(info)) {
        console.log(`[info]: urls: ${urls[i]}`);
        console.log(`[warning]: No found subscription-userinfo in ${names[i]}`);
        console.log(`[info]: fetch subscription-userinfo of ${names[i]} completely`);
        continue;
      }
      let upload = traffic(RegExp.$1 * 1);
      console.log(`[info]: ${names[i]} upload: ${RegExp.$1} = ${upload}`);
      let download = traffic(RegExp.$2 * 1);
      console.log(`[info]: ${names[i]} download: ${RegExp.$2} = ${download}`);
      let total = traffic(RegExp.$3 * 1);
      console.log(`[info]: ${names[i]} total: ${RegExp.$3} = ${total}`);
      let expire = new Date(RegExp.$4 * 1000).toLocaleString();
      console.log(`[info]: ${names[i]} expire: ${RegExp.$4} = ${expire}`);
      let used = traffic(RegExp.$1 * 1 + RegExp.$2 * 1);
      console.log(`[info]: ${names[i]} used: ${RegExp.$1 * 1 + RegExp.$1 * 1} = ${used}`);
      notify(
        `${names[i]} subscription-userinfo`,
        `traffic : ${used} | ${total}\nexpire: ${expire}`,
        false
      );
      console.log(`[info]: fetch subscription-userinfo of ${names[i]} completely`);
    }
    return raw;
  } catch (e) {
    console.log(`[error]: ${e}`);
    notify(`${name} get subscription information failed`, e.message);
    throw e;
  }
};

module.exports.parse = subs_info_parser;
