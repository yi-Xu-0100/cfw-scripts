module.exports.parse = async (raw, { yaml }) => {
  let rawObj = yaml.parse(raw);
  let proxy = 'proxy';
  rawObj['proxy-groups'].forEach(group => {
    if (group['proxies']) {
      if (group['proxies'].indexOf(proxy) === -1) {
        group['proxies'].push(proxy);
      }
    } else {
      group['proxies'] = [proxy];
    }
  });
  raw = yaml.stringify(rawObj);
  return raw;
};
