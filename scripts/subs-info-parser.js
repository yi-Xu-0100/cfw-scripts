/**
 * @module subs_info_parser
 * @description The script used to get subscription information of user.
 */

const { notify } = require('../lib/notify');

const traffic = num => {
  const s = ['B', 'KB', 'MB', 'GB', 'TB'];
  let idx = 0;
  while (~~(num / 1024) && idx < s.length) {
    num /= 1024;
    idx++;
  }
  return `${idx === 0 ? num : num.toFixed(2)} ${s[idx]}`;
};

let subs_info_parser = async (raw, { axios, console }, { url, name }) => {
  try {
    console.log(`[info]: start fetch subscription-userinfo at ${new Date()}`);
    const { headers: { 'subscription-userinfo': info } = {} } = await axios.head(url);
    console.log(`[info]: subscription-userinfo: ${info}`);
    if (/upload=(\d+)?; download=(\d+)?; total=(\d+)?; expire=(\d+)?/.test(info)) {
      let upload = traffic(RegExp.$1 * 1);
      console.log(`[info]: upload: ${RegExp.$1} = ${upload}`);
      let download = traffic(RegExp.$2 * 1);
      console.log(`[info]: download: ${RegExp.$2} = ${download}`);
      let total = traffic(RegExp.$3 * 1);
      console.log(`[info]: total: ${RegExp.$3} = ${total}`);
      let expire = traffic(RegExp.$4 * 1);
      console.log(`[info]: expire: ${RegExp.$4} = ${expire}`);
      let used = traffic(RegExp.$1 * 1 + RegExp.$2 * 1);
      console.log(`[info]: used: ${RegExp.$1 * 1 + RegExp.$1 * 1} = ${used}`);
      notify(`${name} successfully update`, `traffic : ${used} | ${total}`, false);
    }
    return raw;
  } catch (e) {
    console.log(`[error]: ${e}`);
    notify(`${name} get subscription information failed`, e.message);
    throw e;
  }
};

module.exports.parse = subs_info_parser;
