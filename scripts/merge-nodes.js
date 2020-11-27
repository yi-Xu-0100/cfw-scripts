/**
 * @module merge_nodes
 * @description The script was used to merge nodes with keys.
 * The script will based on `change-rules.js`.
 * @param {string[]} [keys = []] - The proxy name include keys will be merged.
 */

const { readFileSync, existsSync } = require('fs');
const { resolve } = require('path');
var modules_path = resolve(__dirname, '../node_modules');
const variable_path = resolve(__dirname, './variables.yml');
let debug = false;

let merge_nodes = async (raw, { yaml, console, notify }, { url, name }) => {
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
      console.log('[warning]: no found ./scripts/variables.yml');
      return yaml.stringify(rawObj);
    }
    var _variables = yaml.parse(readFileSync(variable_path, 'utf-8'));
    if (!_variables['merge_nodes']) {
      console.log('[warning]: no found merge_nodes variables');
      return yaml.stringify(rawObj);
    } else var variables = _variables['merge_nodes'];
    raw = yaml.stringify(rawObj);

    console.log(`[info]: start merge nodes in ${name} at ${new Date()}`);
    if (variables.length != 0) {
      console.log('[info]: merge_nodes variables:');
      console.log(yaml.stringify(variables, null, 2));
      let _proxy = ['DIRECT', '♻️ AUTO'];
      let _auto = [];
      let _other = [];
      for (let i = 0; i < variables.length; i++) {
        _other.push({
          name: variables[i]['name'],
          type: 'select',
          proxies: []
        });
      }
      _other.push({
        name: '🐟 OTHER',
        type: 'select',
        proxies: []
      });
      if (debug) {
        console.log(`[debug]: ${yaml.stringify(_other)}`);
        console.log(`[debug]: ${yaml.stringify(rawObj['proxies'])}`);
      }
      rawObj['proxies'].forEach(proxy => {
        if (debug) console.log(`[debug]: proxy['name']: ${proxy['name']}`);
        let check = false;
        for (let i = 0; i < variables.length; i++) {
          if (debug) console.log(`[debug]: variables[${i}]: ${variables[i]}`);
          variables[i]['keys'].forEach(key => {
            if (proxy['name'].search(key) != -1) {
              if (debug) console.log(`[debug]: add ${proxy['name']} into ${variables[i]['name']}`);
              _other[i]['proxies'].push(proxy['name']);
              check = true;
            }
          });
          if (i === variables.length - 1 && check === false) {
            if (debug)
              console.log(`[debug]: add ${proxy['name']} into ${variables[i + 1]['name']}`);
            _other[i + 1]['proxies'].push(proxy['name']);
          }
        }
      });
      if (debug) {
        console.log(`[debug]: _other[${_other.length}]:`);
        console.log(yaml.stringify(_other));
      }
      let _other_filter = _other.filter(item => item['proxies'].length != 0);
      if (debug) {
        console.log(`[debug]: _other_filter[${_other_filter.length}]:`);
        console.log(yaml.stringify(_other_filter));
      }
      rawObj['proxy-groups'][0]['proxies'] = yaml.parse(
        yaml.stringify(_proxy.concat(_other_filter.map(item => item['name'])))
      );
      rawObj['proxy-groups'][1]['proxies'] = yaml.parse(
        yaml.stringify(_auto.concat(_other_filter.map(item => item['name'])))
      );
      rawObj['proxy-groups'] = yaml.parse(
        yaml.stringify(rawObj['proxy-groups'].concat(_other_filter))
      );
    } else {
      console.log('[warning]: keys need to set.');
      console.log(`[info]: ${name} merge nodes completely`);
    }
    return yaml.stringify(rawObj);
  } catch (e) {
    console.log(`[error]: ${e}`);
    notify(`merge-nodes failed`, e.message);
    throw e;
  }
};

module.exports.parse = merge_nodes;
