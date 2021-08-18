module.exports.parse = async (raw, { yaml, console }) => {
  let rawObj = yaml.parse(raw);
  let proxy = 'proxy';
  let isProxy = true;
  let provider = 'provider';
  let isProvider = true;
  if (!rawObj['proxies'] || rawObj['proxies'].flatMap(i => [i['name']]).indexOf(proxy) === -1) {
    console.log(`Not found proxy: ${proxy}`);
    isProxy = false;
  }
  if (
    !rawObj['proxy-providers'] ||
    Object.keys(rawObj['proxy-providers']).indexOf(provider) === -1
  ) {
    console.log(`Not found provider: ${provider}`);
    isProvider = false;
  }
  rawObj['proxy-groups'].forEach(group => {
    if (isProxy) {
      if (group['proxies']) {
        if (group['proxies'].indexOf(proxy) === -1) {
          group['proxies'].push(proxy);
        }
      } else {
        group['proxies'] = [proxy];
      }
    }
    if (isProvider) {
      if (group['use']) {
        if (group['use'].indexOf(provider) === -1) {
          group['use'].push(provider);
        }
      } else {
        group['use'] = [provider];
      }
    }
  });
  raw = yaml.stringify(rawObj);
  return raw;
};
