/**
 * @module auto_check_in
 * @description The script used to automatic check in.
 * @param {string[]} [domains = []] - The site of domain will be check in.
 * @param {string[]} [keep = []] - Value of keep.
 * @param {string[]} [email = []] - Value of email.
 * @param {string[]} [pwd = []] - Value of pwd.
 */

const { notify } = require('../lib/notify');
const variables = require('./variables.json')['auto-check-in'];

let auto_check_in = async (raw, { axios, console }) => {
  console.log('[info]: auto-check-in variables:');
  console.log(JSON.stringify(variables, null, 2));
  let domains = variables.domains;
  console.log(`[info]: ${domains}`);
  let keep = variables.keep;
  console.log(`[info]: ${keep}`);
  let email = variables.email;
  console.log(`[info]: ${email}`);
  let pwd = variables.pwd;
  console.log(`[info]: ${pwd}`);
  try {
    for (let i = 0; i < domains.length; i++) {
      let sign = false;
      console.log(`[info]: start check in ${domains[i]} at ${new Date()}`);
      try {
        let resp = await axios.get(`https://${domains[i]}/user`);
        console.log(`[info]: response of https://${domains[i]}/user`);
        console.log(JSON.stringify(resp.data, null, 2));
        sign = /用户中心/.test(resp.data);
      } catch (e) {
        if (e.message != 'Request failed with status code 404') {
          console.log(`[error]: ${e}`);
          notify(`request ${domains[i]} failed`, e.message);
          throw e;
        }
      }
      if (!sign) {
        console.log(`[info]: ${domains[i]} need sign`);
        let resp = await axios.post(`https://${domains[i]}/auth/login`, {
          email: email[i],
          passwd: pwd[i],
          remember_me: keep[i]
        });
        console.log(`[info]: response of https://${domains[i]}/auth/login`);
        console.log(JSON.stringify(resp.data, null, 2));
        if (/登录成功/.test(resp.data.msg)) sign = true;
      } else sign = true;
      if (sign) {
        console.log(`[info]: ${domains[i]} start check in`);
        let resp = await axios.post(`https://${domains[i]}/user/checkin`);
        console.log(`[info]: response of https://${domains[i]}/user/checkin`);
        console.log(JSON.stringify(resp.data, null, 2));
        if (!/您似乎已经签到过了/.test(resp.data.msg)) {
          notify(`${domains[i]} rewards`, `${resp.data.msg}`, false);
        }
      } else console.log(`[info]: ${domains[i]} need sign in`);
    }
    return raw;
  } catch (e) {
    console.log(`[error]: ${e}`);
    notify(`auto-check-in failed`, e.message);
    throw e;
  }
};

module.exports.parse = auto_check_in;
