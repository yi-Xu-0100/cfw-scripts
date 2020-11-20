/**
 * @module merge_nodes
 * @description The script was used to merge nodes with keys.
 * The script will based on `change-rules.js`.
 * @param {string[]} [keys = []] - The proxy name include keys will be merged.
 */

const { notify } = require('../lib/notify');
const { readFileSync } = require('fs');
const { resolve } = require('path');
const variable_path = resolve(__dirname, './variables.json');
let _variables = JSON.parse(readFileSync(variable_path, 'utf-8'));
let variables = _variables['merge-nodes'];
let keys = variables.keys;
let names = variables['names'];
let debug = false;

let merge_nodes = async (raw, { yaml, console }, { name }) => {
  console.log(`[info]: start merge nodes in ${name} at ${new Date()}`);
  try {
    var rawObj = yaml.parse(raw);
    if (keys.length != 0) {
      console.log('[info]: merge-nodes variables:');
      console.log(JSON.stringify(variables, null, 2));
      let _proxy = ['DIRECT', 'AUTO'];
      let _auto = [];
      let _other = [];
      for (let i = 0; i < names.length; i++) {
        _other.push({
          name: names[i],
          type: 'select',
          proxies: []
        });
      }
      _other.push({
        name: 'OTHER',
        type: 'select',
        proxies: []
      });
      if (debug) {
        console.log(`[debug]: ${JSON.stringify(_other)}`);
        console.log(`[debug]: ${JSON.stringify(rawObj['proxies'])}`);
      }
      for (let i = 0; i < rawObj['proxies'].length; i++) {
        if (debug)
          console.log(`[debug]: rawObj['proxies'][${i}]['name']: ${rawObj['proxies'][i]['name']}`);
        let check = false;
        for (let j = 0; j < keys.length; j++) {
          if (debug) console.log(`[debug]: keys[${i}]: ${keys[j]}`);
          if (rawObj['proxies'][i]['name'].search(keys[j]) != -1) {
            if (debug)
              console.log(`[debug]: add proxy name [${i}] into _other[${j}] ${_other[j]['name']}`);
            _other[j]['proxies'].push(rawObj['proxies'][i]['name']);
            check = true;
          }
          if (j === keys.length - 1 && check === false) {
            if (debug)
              console.log(`[debug]: add proxy name [${i}] into _other[${keys.length}] OTHER`);
            _other[keys.length]['proxies'].push(rawObj['proxies'][i]['name']);
          }
        }
      }
      if (debug) {
        console.log(`[debug]: _other[${_other.length}]:`);
        console.log(JSON.stringify(_other));
      }
      let _other_filter = _other.filter(item => item['proxies'].length != 0);
      if (debug) {
        console.log(`[debug]: _other_filter[${_other_filter.length}]:`);
        console.log(JSON.stringify(_other_filter));
      }
      rawObj['proxy-groups'][0]['proxies'] = JSON.parse(
        JSON.stringify(_proxy.concat(_other_filter.map(item => item['name'])))
      );
      rawObj['proxy-groups'][1]['proxies'] = JSON.parse(
        JSON.stringify(_auto.concat(_other_filter.map(item => item['name'])))
      );
      rawObj['proxy-groups'] = JSON.parse(
        JSON.stringify(rawObj['proxy-groups'].concat(_other_filter))
      );
    } else {
      console.log('[warning]: keys need to set.');
      console.log(`[info]: ${name} merge nodes completely`);
    }
    return JSON.stringify(rawObj);
  } catch (e) {
    console.log(`[error]: ${e}`);
    notify(`merge-nodes failed`, e.message);
    throw e;
  }
};

module.exports.parse = merge_nodes;
