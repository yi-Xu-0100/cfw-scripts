/**
 * @module auto_check_in
 * @description The script used to automatic check in.
 * @param {string[]} [domains = []] - The site of domain will be check in.
 * @param {string[]} [keep = []] - Value of keep.
 * @param {string[]} [email = []] - Value of email.
 * @param {string[]} [pwd = []] - Value of pwd.
 */

const { notify } = require('../lib/notify');
const { readFileSync, writeFileSync } = require('fs');
const { resolve } = require('path');
const variable_path = resolve(__dirname, './variables.json');
let _variables = JSON.parse(readFileSync(variable_path, 'utf-8'));
let debug = false;

let auto_check_in = async (raw, { axios, console }) => {
  console.log('[info]: auto-check-in variables:');
  if (!_variables['auto-check-in'].checkinDate) _variables['auto-check-in'].checkinDate = [];
  let variables = _variables['auto-check-in'];
  console.log(JSON.stringify(variables, null, 2));
  let domains = variables.domains;
  let keep = variables.keep;
  let email = variables.email;
  let pwd = variables.pwd;
  let today = new Date().toISOString().slice(0, 10);
  console.log(`[info]: today: ${today}`);
  console.log(`[info]: domains.length: ${domains.length}`);
  try {
    for (let i = 0; i < domains.length; i++) {
      console.log(`[info]: start check in ${domains[i]} at ${new Date()}`);
      if (variables.checkinDate[i] && variables.checkinDate[i] === today) {
        console.log(`[info]: ${domains[i]} has been already check in`);
        console.log(`[info]: ${domains[i]} check in completely`);
        continue;
      }

      // check sign
      let sign = false;
      try {
        console.log(`[info]: try check sign with ${domains[i]}`);
        let resp = await axios.get(`https://${domains[i]}/user`);
        if (debug) {
          console.log(`[debug]: response of https://${domains[i]}/user`);
          console.log(JSON.stringify(resp.data, null, 2));
        }
        sign = /用户中心/.test(resp.data);
      } catch (e) {
        if (e.message != 'Request failed with status code 404') {
          console.log(`[error]: check sign ${domains[i]} failed`);
          console.log(`[error]: ${e}`);
          notify(`check sign ${domains[i]} failed`, e.message);
          continue;
        } else {
          console.log(`[error]: check sign ${domains[i]} failed with 404 error`);
          continue;
        }
      }

      //try auto sign
      if (!sign) {
        try {
          console.log(`[info]: try sign in ${domains[i]}`);
          let resp = await axios.post(`https://${domains[i]}/auth/login`, {
            email: email[i],
            passwd: pwd[i],
            remember_me: keep[i]
          });
          if (debug) {
            console.log(`[debug]: response of https://${domains[i]}/auth/login`);
            console.log(JSON.stringify(resp.data, null, 2));
          }
          if (/登录成功/.test(resp.data.msg)) sign = true;
        } catch (e) {
          if (e.message != 'Request failed with status code 404') {
            console.log(`[error]: check sign ${domains[i]} failed`);
            console.log(`[error]: ${e}`);
            notify(`check sign ${domains[i]} failed`, e.message);
            continue;
          } else {
            console.log(`[error]: check sign ${domains[i]} failed with 404 error`);
            continue;
          }
        }
      } else sign = true;

      //try auto check in
      if (sign) {
        try {
          console.log(`[info]: try check in ${domains[i]}`);
          let resp = await axios.post(`https://${domains[i]}/user/checkin`);
          if (debug) {
            console.log(`[debug]: response of https://${domains[i]}/user/checkin`);
            console.log(JSON.stringify(resp.data, null, 2));
          }
          if (!/您似乎已经签到过了/.test(resp.data.msg)) {
            notify(`${domains[i]} rewards`, `${resp.data.msg}`, false);
          } else {
            _variables['auto-check-in'].checkinDate[i] = today;
            console.log(`[info]: ${domains[i]} has been already check in`);
          }
        } catch (e) {
          if (e.message != 'Request failed with status code 404') {
            console.log(`[error]: check sign ${domains[i]} failed`);
            console.log(`[error]: ${e}`);
            notify(`check sign ${domains[i]} failed`, e.message);
            continue;
          } else {
            console.log(`[error]: check sign ${domains[i]} failed with 404 error`);
            continue;
          }
        }
      } else console.log(`[warning]: ${domains[i]} need sign in`);
      console.log(`[info]: ${domains[i]} check in completely`);
    }
    return raw;
  } catch (e) {
    console.log(`[error]: ${e}`);
    notify(`auto-check-in failed`, e.message);
    throw e;
  } finally {
    writeFileSync(variable_path, JSON.stringify(_variables, null, 2), 'utf-8');
  }
};

module.exports.parse = auto_check_in;
